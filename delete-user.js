require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function deleteUser() {
  try {
    const email = 'adarshgupta09182@gmail.com';
    
    console.log(`Deleting user with email: ${email}`);
    
    const result = await pool.query(
      'DELETE FROM users WHERE email = $1 RETURNING id, email, name',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log(`❌ User not found: ${email}`);
    } else {
      console.log(`✅ User deleted successfully:`);
      console.log(result.rows[0]);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
    process.exit(1);
  }
}

deleteUser();
