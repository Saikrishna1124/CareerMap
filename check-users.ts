import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function getRegisteredUsers() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is not set in .env file.");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: dbUrl });

  try {
    const res = await pool.query(`
      SELECT id, email, name, title, createdat 
      FROM users 
      ORDER BY createdat DESC
    `);

    console.log(`\n========================================`);
    console.log(` Registered Users in Database (${res.rows.length} total)`);
    console.log(`========================================\n`);

    if (res.rows.length === 0) {
      console.log("No registered users found in the database yet.");
    } else {
      console.table(res.rows);
    }
  } catch (error) {
    console.error("❌ Error fetching users from database:", error);
  } finally {
    await pool.end();
  }
}

getRegisteredUsers();
