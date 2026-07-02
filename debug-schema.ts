import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return;
  
  const poolConfig: any = { connectionString };
  if (!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
  
  const pool = new pg.Pool(poolConfig);
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('All columns:', res.rows);
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await pool.end();
  }
}
check();
