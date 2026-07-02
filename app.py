import os
import sqlite3
import json
import uuid
import jwt
import bcrypt
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, make_response, send_from_directory, g
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app, supports_credentials=True)

JWT_SECRET = os.getenv('JWT_SECRET', 'careermap-secret-key')
DB_NAME = 'careermap.db'

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    try:
        conn.executescript('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                title TEXT,
                bio TEXT,
                skills TEXT, -- JSON string
                experience TEXT, -- JSON string
                education TEXT, -- JSON string
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS resumes (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                content TEXT NOT NULL,
                score INTEGER NOT NULL,
                skills TEXT NOT NULL, -- JSON string
                tips TEXT NOT NULL,   -- JSON string
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS interviews (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                type TEXT NOT NULL,
                score INTEGER NOT NULL,
                communication INTEGER NOT NULL,
                technical INTEGER NOT NULL,
                confidence INTEGER NOT NULL,
                integrity INTEGER NOT NULL,
                feedback TEXT NOT NULL,
                questions TEXT NOT NULL, -- JSON string
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS code_snippets (
                id TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                title TEXT NOT NULL,
                language TEXT NOT NULL,
                code TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id)
            );
        ''')
        conn.commit()
    except Exception as e:
        print(f"Database initialization error: {e}")
    finally:
        conn.close()

init_db()

def authenticate(f):
    def wrapper(*args, **kwargs):
        token = request.cookies.get('token')
        if not token:
            return jsonify({'error': 'Unauthorized'}), 401
        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            g.user = decoded
            return f(*args, **kwargs)
        except Exception:
            return jsonify({'error': 'Invalid token'}), 401
    wrapper.__name__ = f.__name__
    return wrapper

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if not email or not password or not name:
        return jsonify({'error': 'Missing fields'}), 400
        
    try:
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_id = str(uuid.uuid4())
        
        conn = get_db_connection()
        conn.execute("INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)",
                     (user_id, email, hashed_password, name))
        conn.commit()
        conn.close()
        
        token = jwt.encode({'id': user_id, 'email': email, 'name': name}, JWT_SECRET, algorithm='HS256')
        resp = make_response(jsonify({'id': user_id, 'email': email, 'name': name}))
        resp.set_cookie('token', token, httponly=True, secure=True, samesite='None')
        return resp
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401
        
    token = jwt.encode({'id': user['id'], 'email': user['email'], 'name': user['name']}, JWT_SECRET, algorithm='HS256')
    resp = make_response(jsonify({'id': user['id'], 'email': user['email'], 'name': user['name']}))
    resp.set_cookie('token', token, httponly=True, secure=True, samesite='None')
    return resp

@app.route('/api/auth/me', methods=['GET'])
def me():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'error': 'Not logged in'}), 401
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        conn = get_db_connection()
        user = conn.execute("SELECT id, email, name, title, bio, skills, experience, education FROM users WHERE id = ?", (decoded['id'],)).fetchone()
        conn.close()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        user_dict = dict(user)
        user_dict['skills'] = json.loads(user_dict['skills']) if user_dict['skills'] else []
        user_dict['experience'] = json.loads(user_dict['experience']) if user_dict['experience'] else []
        user_dict['education'] = json.loads(user_dict['education']) if user_dict['education'] else []
        
        return jsonify(user_dict)
    except Exception:
        return jsonify({'error': 'Invalid token'}), 401

@app.route('/api/auth/profile', methods=['PUT'])
@authenticate
def update_profile():
    data = request.json
    name = data.get('name')
    title = data.get('title')
    bio = data.get('bio')
    skills = data.get('skills', [])
    experience = data.get('experience', [])
    education = data.get('education', [])
    
    try:
        conn = get_db_connection()
        conn.execute('''
            UPDATE users 
            SET name = ?, title = ?, bio = ?, skills = ?, experience = ?, education = ?
            WHERE id = ?
        ''', (name, title, bio, json.dumps(skills), json.dumps(experience), json.dumps(education), g.user['id']))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    resp = make_response(jsonify({'success': True}))
    resp.set_cookie('token', '', expires=0)
    return resp

@app.route('/api/resumes', methods=['POST'])
@authenticate
def save_resume():
    data = request.json
    content = data.get('content')
    score = data.get('score')
    skills = data.get('skills', [])
    tips = data.get('tips', [])
    
    try:
        resume_id = str(uuid.uuid4())
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO resumes (id, userId, content, score, skills, tips)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (resume_id, g.user['id'], content, score, json.dumps(skills), json.dumps(tips)))
        conn.commit()
        conn.close()
        return jsonify({'id': resume_id, 'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/resumes', methods=['GET'])
@authenticate
def get_resumes():
    try:
        conn = get_db_connection()
        resumes = conn.execute("SELECT * FROM resumes WHERE userId = ? ORDER BY createdAt DESC", (g.user['id'],)).fetchall()
        conn.close()
        
        formatted = []
        for r in resumes:
            rd = dict(r)
            rd['skills'] = json.loads(rd['skills'])
            rd['tips'] = json.loads(rd['tips'])
            formatted.append(rd)
        return jsonify(formatted)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/interviews', methods=['POST'])
@authenticate
def save_interview():
    data = request.json
    try:
        interview_id = str(uuid.uuid4())
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO interviews (id, userId, type, score, communication, technical, confidence, integrity, feedback, questions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (interview_id, g.user['id'], data['type'], data['score'], data['communication'], 
              data['technical'], data['confidence'], data['integrity'], data['feedback'], json.dumps(data['questions'])))
        conn.commit()
        conn.close()
        return jsonify({'id': interview_id, 'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/interviews', methods=['GET'])
@authenticate
def get_interviews():
    try:
        conn = get_db_connection()
        interviews = conn.execute("SELECT * FROM interviews WHERE userId = ? ORDER BY createdAt DESC", (g.user['id'],)).fetchall()
        conn.close()
        
        formatted = []
        for i in interviews:
            idict = dict(i)
            idict['questions'] = json.loads(idict['questions'])
            formatted.append(idict)
        return jsonify(formatted)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/snippets', methods=['POST'])
@authenticate
def save_snippet():
    data = request.json
    title = data.get('title', 'Untitled Snippet')
    language = data.get('language')
    code = data.get('code')
    
    if not language or not code:
        return jsonify({'error': 'Missing language or code'}), 400
        
    try:
        snippet_id = str(uuid.uuid4())
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO code_snippets (id, userId, title, language, code)
            VALUES (?, ?, ?, ?, ?)
        ''', (snippet_id, g.user['id'], title, language, code))
        conn.commit()
        conn.close()
        return jsonify({'id': snippet_id, 'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/snippets', methods=['GET'])
@authenticate
def get_snippets():
    try:
        conn = get_db_connection()
        snippets = conn.execute("SELECT * FROM code_snippets WHERE userId = ? ORDER BY createdAt DESC", (g.user['id'],)).fetchall()
        conn.close()
        return jsonify([dict(s) for s in snippets])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/stats', methods=['GET'])
@authenticate
def get_stats():
    try:
        conn = get_db_connection()
        resume_count = conn.execute("SELECT COUNT(*) as count FROM resumes WHERE userId = ?", (g.user['id'],)).fetchone()['count']
        interview_count = conn.execute("SELECT COUNT(*) as count FROM interviews WHERE userId = ?", (g.user['id'],)).fetchone()['count']
        interviews = conn.execute("SELECT score FROM interviews WHERE userId = ?", (g.user['id'],)).fetchall()
        conn.close()
        
        avg_score = round(sum(i['score'] for i in interviews) / len(interviews)) if interviews else 0
        
        return jsonify({
            'resumes': resume_count,
            'interviews': interview_count,
            'avgScore': avg_score
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        index_path = os.path.join(app.static_folder, 'index.html')
        if not os.path.exists(index_path):
            return "Frontend build not found. Please wait for the build to complete or check for errors.", 503
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
