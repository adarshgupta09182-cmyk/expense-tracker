/**
 * Data Preservation Script
 * This script ensures that users.json and expenses.json are preserved
 * across deployments by storing them in environment variables or
 * initializing them with default data if they don't exist.
 */

const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'users.json');
const EXPENSES_FILE = path.join(__dirname, 'expenses.json');

function ensureDataFiles() {
  // Ensure users.json exists with at least the test user
  if (!fs.existsSync(USERS_FILE)) {
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
    console.log('✓ Created users.json with default test user');
  } else {
    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      if (!Array.isArray(users)) {
        throw new Error('users.json is not an array');
      }
      console.log(`✓ users.json exists with ${users.length} user(s)`);
    } catch (err) {
      console.error('✗ Error reading users.json:', err.message);
      console.log('  Resetting to default...');
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
    }
  }

  // Ensure expenses.json exists
  if (!fs.existsSync(EXPENSES_FILE)) {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify([], null, 2));
    console.log('✓ Created expenses.json');
  } else {
    try {
      const expenses = JSON.parse(fs.readFileSync(EXPENSES_FILE, 'utf8'));
      if (!Array.isArray(expenses)) {
        throw new Error('expenses.json is not an array');
      }
      console.log(`✓ expenses.json exists with ${expenses.length} expense(s)`);
    } catch (err) {
      console.error('✗ Error reading expenses.json:', err.message);
      console.log('  Resetting to empty array...');
      fs.writeFileSync(EXPENSES_FILE, JSON.stringify([], null, 2));
    }
  }
}

module.exports = { ensureDataFiles };
