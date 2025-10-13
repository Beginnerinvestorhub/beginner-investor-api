#!/usr/bin/env node

/**
 * Add Firebase configuration to .env file
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Adding Firebase configuration to .env file...\n');

// Firebase configuration from the provided config
const firebaseConfig = {
  FIREBASE_PROJECT_ID: 'beginnerinvestorhub-5eb71',
  FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk-fbsvc@beginnerinvestorhub-5eb71.iam.gserviceaccount.com',
  // Note: You'll need to add the actual private key
  // FIREBASE_PRIVATE_KEY: 'your-actual-private-key-here'
};

const envPath = path.join(__dirname, '.env');

try {
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists');

    // Read current .env content
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Check if Firebase variables already exist
    const lines = envContent.split('\n');
    const existingFirebaseVars = lines.filter(line =>
      line.startsWith('FIREBASE_') && line.includes('=')
    );

    if (existingFirebaseVars.length > 0) {
      console.log('✅ Firebase variables already exist in .env');
      console.log('📋 Current Firebase configuration:');
      existingFirebaseVars.forEach(line => console.log(`   ${line}`));
    } else {
      console.log('📝 Adding Firebase configuration to .env file...');

      // Add Firebase configuration
      const firebaseLines = Object.entries(firebaseConfig).map(
        ([key, value]) => `${key}=${value}`
      );

      // Append to .env file
      envContent += '\n\n# Firebase Configuration\n' + firebaseLines.join('\n');

      fs.writeFileSync(envPath, envContent);

      console.log('✅ Firebase configuration added to .env file');
      console.log('📋 Added:');
      firebaseLines.forEach(line => console.log(`   ${line}`));

      console.log('\n⚠️  Note: You may need to add the actual FIREBASE_PRIVATE_KEY');
      console.log('   from your Firebase service account JSON file.');
    }

  } else {
    console.log('❌ .env file not found');
    console.log('📋 Please create src/.env file and add Firebase configuration manually.');

    // Create a template .env file
    const templateEnv = `# Firebase Configuration
FIREBASE_PROJECT_ID=beginnerinvestorhub-5eb71
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@beginnerinvestorhub-5eb71.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"`;

    fs.writeFileSync(envPath, templateEnv);
    console.log('📄 Created src/.env template file');
  }

} catch (error) {
  console.log('❌ Error updating .env file:', error.message);
}

console.log('\n🚀 Next steps:');
console.log('1. Add your actual FIREBASE_PRIVATE_KEY to src/.env');
console.log('2. Restart the development server');
console.log('3. Test the application');

console.log('\n✅ Firebase configuration setup completed!');
