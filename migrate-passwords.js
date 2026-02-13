const fs = require('fs');
const bcrypt = require('bcryptjs');

async function migratePasswords() {
  console.log('Starting password migration...\n');
  
  if (!fs.existsSync('users.json')) {
    console.log('No users.json file found. Nothing to migrate.');
    return;
  }

  const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  
  if (users.length === 0) {
    console.log('No users found. Nothing to migrate.');
    return;
  }

  console.log(`Found ${users.length} user(s) to migrate:\n`);

  for (let user of users) {
    // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      console.log(`✓ ${user.email} - Already hashed, skipping`);
      continue;
    }

    // Hash the plain text password
    const hashedPassword = await bcrypt.hash(user.password, 12);
    user.password = hashedPassword;
    console.log(`✓ ${user.email} - Password hashed successfully`);
  }

  // Save the updated users
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  console.log('\n✓ Migration complete! All passwords are now hashed.');
  console.log('You can now login with your original passwords.\n');
}

migratePasswords().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
