const fs = require('fs');

// Delete old files
try {
  if (fs.existsSync('users.json')) fs.unlinkSync('users.json');
  if (fs.existsSync('expenses.json')) fs.unlinkSync('expenses.json');
  console.log('Old files deleted');
} catch (err) {
  console.log('No old files to delete');
}

// Create new files without BOM
fs.writeFileSync('users.json', '[]', 'utf8');
fs.writeFileSync('expenses.json', '[]', 'utf8');

console.log('✓ users.json created');
console.log('✓ expenses.json created');
console.log('\nAll data cleared! You can now register new accounts.');
