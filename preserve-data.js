/**
 * Data Preservation Script
 * This script ensures that users.json and expenses.json are preserved
 * across deployments by:
 * 1. Restoring from backup files if they exist
 * 2. Validating data integrity
 * 3. Logging data status
 */

const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'users.json');
const EXPENSES_FILE = path.join(__dirname, 'expenses.json');
const USERS_BACKUP = path.join(__dirname, 'users-backup.json');
const EXPENSES_BACKUP = path.join(__dirname, 'expenses-backup.json');

function ensureDataFiles() {
  // Ensure users.json exists with at least the test user
  if (!fs.existsSync(USERS_FILE)) {
    // Try to restore from backup
    if (fs.existsSync(USERS_BACKUP)) {
      try {
        const backupData = JSON.parse(fs.readFileSync(USERS_BACKUP, 'utf8'));
        fs.writeFileSync(USERS_FILE, JSON.stringify(backupData, null, 2));
        console.log(`✓ Restored users.json from backup (${backupData.length} users)`);
      } catch (err) {
        console.error('✗ Error restoring users from backup:', err.message);
        createDefaultUsers();
      }
    } else {
      createDefaultUsers();
    }
  } else {
    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      if (!Array.isArray(users)) {
        throw new Error('users.json is not an array');
      }
      console.log(`✓ users.json exists with ${users.length} user(s)`);
      
      // Update backup
      fs.writeFileSync(USERS_BACKUP, JSON.stringify(users, null, 2));
    } catch (err) {
      console.error('✗ Error reading users.json:', err.message);
      createDefaultUsers();
    }
  }

  // Ensure expenses.json exists
  if (!fs.existsSync(EXPENSES_FILE)) {
    // Try to restore from backup
    if (fs.existsSync(EXPENSES_BACKUP)) {
      try {
        const backupData = JSON.parse(fs.readFileSync(EXPENSES_BACKUP, 'utf8'));
        fs.writeFileSync(EXPENSES_FILE, JSON.stringify(backupData, null, 2));
        console.log(`✓ Restored expenses.json from backup (${backupData.length} expenses)`);
      } catch (err) {
        console.error('✗ Error restoring expenses from backup:', err.message);
        fs.writeFileSync(EXPENSES_FILE, JSON.stringify([], null, 2));
        console.log('✓ Created empty expenses.json');
      }
    } else {
      fs.writeFileSync(EXPENSES_FILE, JSON.stringify([], null, 2));
      console.log('✓ Created empty expenses.json');
    }
  } else {
    try {
      const expenses = JSON.parse(fs.readFileSync(EXPENSES_FILE, 'utf8'));
      if (!Array.isArray(expenses)) {
        throw new Error('expenses.json is not an array');
      }
      console.log(`✓ expenses.json exists with ${expenses.length} expense(s)`);
      
      // Update backup
      fs.writeFileSync(EXPENSES_BACKUP, JSON.stringify(expenses, null, 2));
    } catch (err) {
      console.error('✗ Error reading expenses.json:', err.message);
      fs.writeFileSync(EXPENSES_FILE, JSON.stringify([], null, 2));
      console.log('✓ Reset expenses.json to empty array');
    }
  }

  // Log data persistence status
  console.log('\n📊 Data Persistence Status:');
  console.log('⚠️  Using JSON file storage with ephemeral filesystem.');
  console.log('   Expenses are backed up to expenses-backup.json');
  console.log('   For permanent storage, use a database like PostgreSQL.\n');
}

function createDefaultUsers() {
  const defaultUsers = [
    {
      "id": "user_001",
      "name": "Test User",
      "email": "test@example.com",
      "password": "$2a$10$zb4COi03BQP4klm0eoGFBOFWcnNn/rmtHT74vjtDGOsvcMWN4wrj6",
      "role": "user",
      "createdAt": "2025-02-14T00:00:00Z"
    }
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  fs.writeFileSync(USERS_BACKUP, JSON.stringify(defaultUsers, null, 2));
  console.log('✓ Created users.json with default test user');
}

module.exports = { ensureDataFiles };
