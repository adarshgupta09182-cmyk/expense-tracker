require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateTransportToTravelling() {
  try {
    console.log('Starting migration: Transport -> Travelling...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Not set');
    
    const result = await pool.query(
      'UPDATE expenses SET category = $1 WHERE category = $2',
      ['Travelling', 'Transport']
    );
    
    console.log(`✓ Successfully updated ${result.rowCount} expenses from Transport to Travelling`);
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    await pool.end();
    process.exit(1);
  }
}

migrateTransportToTravelling();
