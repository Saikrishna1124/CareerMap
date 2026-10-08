# 🗺️ CareerMap — Next-Gen AI Career Intelligence Platform

**CareerMap** is an AI-powered career navigation and intelligence platform designed to guide professionals and students through every step of their career journey. From analyzing resume ATS compatibility to interactive AI mock interviews, custom roadmap generation, and smart job & internship discovery — CareerMap bridges the gap between where you are and where you want to be.

---

## 📸 Platform Preview

### 🌟 Landing Page
![CareerMap Landing Page](docs/screenshots/landing_page.png)

---

## 🤖 AI Integration & Intelligence Architecture

CareerMap is engineered with **Google Gemini AI** (`@google/genai`) at its core, orchestrating intelligent career coaching, automated evaluation, and real-time market matching:

### 1. 📄 ATS Resume Intelligence & Semantic Parsing
- **Comprehensive ATS Scoring (0–100%):** Evaluates uploaded resumes against real industry applicant tracking metrics.
- **Skill Extraction & Gap Detection:** Identifies core competencies and flags missing high-value skills required for targeted roles.
- **Actionable Optimization Tips:** Delivers line-by-line recommendations and STAR-method bullet points to maximize recruiter visibility.

### 2. 🎙️ AI Mock Interviewer & Audio Evaluation
- **Adaptive Technical & Behavioral Questions:** Dynamically tailors coding challenges and behavioral questions to the candidate's target job role and experience level.
- **Multi-Vector Performance Scoring:** Analyzes responses across Technical Knowledge, Communication Clarity, Professional Confidence, and Structural Integrity.
- **Emotionally Supportive Constructive Feedback:** Provides warm, personalized critiques designed to build interview confidence while identifying improvement areas.

### 3. 💼 Smart Job & Internship Explorer
- **Dynamic Skill Compatibility Scoring:** Cross-references candidate skills against 25+ top employers (**Google, Microsoft, Meta, Amazon AWS, Apple, Netflix, AICTE, Flipkart, Zoho, TCS, Infosys, Razorpay**).
- **Personalized Readiness Roadmaps:** Automatically calculates match percentages and generates 3-step learning paths, portfolio project ideas, and interview strategies.
- **Curated Internship Pipelines:** Dedicated support for summer internships, graduate trainee programs, and AICTE virtual internships with real stipends and direct application links.

### 4. 🧠 Multi-Model Resilience & Snappy Fallbacks
- **Zero-Latency Availability:** Uses high-throughput Gemini models (`gemini-3.1-flash-lite`, `gemini-flash-latest`) with strict timeout races and robust caching.
- **Intelligent Offline Mode:** When API limits are reached, the platform seamlessly transitions to deterministic heuristic engines and verified master catalogs with zero user-facing downtime.

---

## ✨ Core Features

- **📊 Strategic Dashboard:** Track overall career readiness, interview metrics, and growth progression across multiple dimensions.
- **🗺️ Interactive Career Map:** D3.js and motion-powered interactive roadmap tracking milestones from foundational tech to senior leadership.
- **🎮 Daily Mind Gym ("Career Connections"):** Daily interactive game challenging users to group related concepts, test domain knowledge, and maintain learning streaks.
- **📅 Interview Calendar:** Auto-syncs applied jobs and scheduled interviews with automated reminder alerts.
- **🔐 Secure Authentication:** Enterprise-grade auth supporting email OTP verification, password hashing with bcrypt, and secure JWT session handling.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Framer Motion), D3.js, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, Nodemailer, Resend API |
| **Database & ORM** | PostgreSQL (Supabase / Neon), Drizzle ORM |
| **AI Integration** | Google Gemini GenAI SDK (`@google/genai`) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs, HTTP-only Cookie Parser |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **yarn** / **pnpm**
- A **PostgreSQL** database (Local, Supabase, Neon, or Render PostgreSQL)
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Saikrishna1124/CareerMap.git
   cd CareerMap
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure the required variables:
   ```env
   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # PostgreSQL Database Connection URL
   DATABASE_URL=postgresql://user:password@host:5432/dbname

   # JWT Encryption Secret
   JWT_SECRET=your_super_secret_jwt_key_here

   # Local URL / App Domain
   APP_URL=http://localhost:3000

   # Email OTP Configuration (Gmail SMTP or Resend)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   # RESEND_API_KEY=re_your_resend_key (Optional)
   ```

4. **Initialize Database:**
   ```bash
   npx drizzle-kit push
   ```

---

### Running Locally

Run the unified development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

### Production Build & Deployment

To create an optimized production build for platforms like **Render**, **Heroku**, or a VPS:
```bash
npm run build
npm start
```

---

## 🏗️ Project Structure

```
CareerMap/
├── src/
│   ├── components/        # Reusable UI components (Header, Sidebar, Tooltips, etc.)
│   ├── pages/             # Core views (Dashboard, Careers, Resume, Interview, etc.)
│   ├── context/           # Global state providers (AuthContext, ThemeContext)
│   ├── services/          # AI agents, email service, and jobs catalog
│   ├── db/                # Drizzle schema definitions and migrations
│   └── utils/             # Helper utilities and calculation algorithms
├── docs/
│   └── screenshots/       # High-resolution screenshots for documentation
├── server.ts              # Express API server with integrated Vite middleware
├── drizzle.config.ts      # Drizzle ORM configuration
├── vite.config.ts         # Vite bundler configuration
└── package.json           # Scripts and dependency specifications
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project (`https://github.com/Saikrishna1124/CareerMap/fork`)
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add NewFeature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
