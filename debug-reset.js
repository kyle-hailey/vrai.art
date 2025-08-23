const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'server', 'social.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Password Reset Debug Script\n');
console.log('Database path:', dbPath);

async function debugPasswordReset() {
  try {
    // 1. Check if database file exists
    console.log('\n1️⃣ Checking database file...');
    const fs = require('fs');
    if (fs.existsSync(dbPath)) {
      console.log('✅ Database file exists');
    } else {
      console.log('❌ Database file not found');
      return;
    }

    // 2. Check users table
    console.log('\n2️⃣ Checking users table...');
    db.get("PRAGMA table_info(users)", (err, columns) => {
      if (err) {
        console.error('❌ Error checking table schema:', err);
        return;
      }
      console.log('✅ Users table exists');
      
      // 3. Check current user data
      console.log('\n3️⃣ Checking current user data...');
      db.get('SELECT id, username, email, length(password) as pwd_length FROM users WHERE email = ?', 
        ['kylelf@gmail.com'], (err, user) => {
        if (err) {
          console.error('❌ Error fetching user:', err);
          return;
        }
        
        if (!user) {
          console.log('❌ User not found');
          return;
        }
        
        console.log('✅ User found:', {
          id: user.id,
          username: user.username,
          email: user.email,
          passwordLength: user.pwd_length
        });
        
        // 4. Check reset tokens
        console.log('\n4️⃣ Checking reset tokens...');
        db.all('SELECT id, user_id, token, expires_at FROM password_reset_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 3', 
          [user.id], (err, tokens) => {
          if (err) {
            console.error('❌ Error fetching tokens:', err);
            return;
          }
          
          console.log(`✅ Found ${tokens.length} reset tokens:`);
          tokens.forEach((token, index) => {
            const isExpired = new Date(token.expires_at) < new Date();
            console.log(`   Token ${index + 1}: ${token.token.substring(0, 20)}... (Expired: ${isExpired ? 'Yes' : 'No'})`);
          });
          
          // 5. Test password update manually
          console.log('\n5️⃣ Testing manual password update...');
          const testPassword = 'test123';
          
          // Use bcrypt.hash with a Promise wrapper since we're in a callback
          bcrypt.hash(testPassword, 10).then(hashedPassword => {
            console.log(`Test password: "${testPassword}"`);
            console.log(`Hashed password: ${hashedPassword.substring(0, 20)}...`);
            
            db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id], function(err) {
              if (err) {
                console.error('❌ Error updating password:', err);
                return;
              }
              
              console.log(`✅ Password update test: ${this.changes} rows affected`);
              
              if (this.changes > 0) {
                console.log('✅ Manual password update successful!');
                
                // Verify the update
                db.get('SELECT password FROM users WHERE id = ?', [user.id], (err, updatedUser) => {
                  if (err) {
                    console.error('❌ Error verifying update:', err);
                    return;
                  }
                  
                  bcrypt.compare(testPassword, updatedUser.password).then(matches => {
                    console.log(`✅ Password verification: ${matches ? 'PASS' : 'FAIL'}`);
                    
                    // Clean up - restore original password
                    console.log('\n🔄 Restoring original password...');
                    const originalHash = '$2a$10$s5EsZl2kdX0f6NI5uMx.sOUCxQGOI097WeQu44vgJy3w/imO.9Sha';
                    db.run('UPDATE users SET password = ? WHERE id = ?', [originalHash, user.id], function(err) {
                      if (err) {
                        console.error('❌ Error restoring password:', err);
                      } else {
                        console.log(`✅ Original password restored: ${this.changes} rows affected`);
                      }
                      db.close();
                    });
                  });
                });
              } else {
                console.log('❌ Manual password update failed - no rows affected');
                db.close();
              }
            });
          }).catch(error => {
            console.error('❌ Error hashing password:', error);
            db.close();
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Script error:', error);
    db.close();
  }
}

// Run the debug
debugPasswordReset();
