import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is missing');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString });
  
  try {
    const sqlFile = path.join(process.cwd(), 'drizzle/0000_groovy_mephistopheles.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by the drizzle statement breakpoint
    const statements = sql.split('--> statement-breakpoint');
    
    for (let statement of statements) {
      statement = statement.trim();
      if (statement) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await pool.query(statement);
      }
    }
    
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

run();
