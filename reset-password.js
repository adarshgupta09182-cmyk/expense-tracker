const bcrypt = require('bcryptjs');
const fs = require('fs');

// Hash the password
const password = '@kittu123#';
bcrypt.hash(password, 12, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }

  console.log('New password hash:', hash);

  // Update users.json
  const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  
  // Update Kittu's password
  const kittuUser = users.find(u => u.email === 'kittu@gmail.com');
  if (kittuUser) {
    kittuUser.password = hash;
    console.log('Updated Kittu password');
  }

  // Update Adarsh's password
  const adarshUser = users.find(u => u.email === 'adarshgupta09182@gmail.com');
  if (adarshUser) {
    adarshUser.password = hash;
    console.log('Updated Adarsh password');
  }

  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  console.log('users.json updated successfully!');
  process.exit(0);
});
