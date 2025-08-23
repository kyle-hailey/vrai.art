const bcrypt = require('bcryptjs');

// Test password hashing
async function testPasswordHashing() {
  console.log('🔐 Password Hashing Test\n');
  
  // Test with a simple password
  const testPassword = 'test123';
  console.log(`Testing password: "${testPassword}"`);
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  console.log(`Hashed password: ${hashedPassword}`);
  console.log(`Hash length: ${hashedPassword.length}`);
  
  // Test comparison
  const isValid = await bcrypt.compare(testPassword, hashedPassword);
  console.log(`Password comparison test: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test with the hash from your database
  const dbHash = '$2a$10$s5EsZl2kdX0f6NI5uMx.sOUCxQGOI097WeQu44vgJy3w/imO.9Sha';
  console.log(`\nDatabase hash: ${dbHash}`);
  
  // Test if 'test123' matches the database hash
  const matchesDb = await bcrypt.compare(testPassword, dbHash);
  console.log(`"${testPassword}" matches database hash: ${matchesDb ? '✅ YES' : '❌ NO'}`);
  
  // Test with some other common passwords
  const commonPasswords = ['password', '123456', 'admin', 'kylelf', 'Kylelf'];
  console.log('\n🔍 Testing common passwords against database hash:');
  
  for (const pwd of commonPasswords) {
    const matches = await bcrypt.compare(pwd, dbHash);
    console.log(`"${pwd}": ${matches ? '✅ MATCH' : '❌ no match'}`);
  }
  
  // Test what the current password might be
  console.log('\n🔍 Current database hash analysis:');
  console.log(`Hash starts with: ${dbHash.substring(0, 20)}...`);
  console.log(`Hash algorithm: ${dbHash.substring(0, 4)}`);
  console.log(`Cost factor: ${dbHash.substring(4, 6)}`);
  console.log(`Salt: ${dbHash.substring(7, 29)}`);
}

// Run the test
testPasswordHashing().catch(console.error);
