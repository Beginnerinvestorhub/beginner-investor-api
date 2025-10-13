#!/usr/bin/env node

/**
 * Backend API Environment Fixer
 * Checks and fixes missing environment variables
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Backend API Environment Fixer');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, 'src', '.env');
const envExamplePath = path.join(__dirname, 'src', '.env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');

  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    // Check for required Firebase variables
    const firebaseVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
    const missingVars = [];

    firebaseVars.forEach(varName => {
      const found = lines.some(line => line.startsWith(`${varName}=`));
      if (found) {
        console.log(`   ✅ ${varName}: set`);
      } else {
        console.log(`   ❌ ${varName}: missing`);
        missingVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      console.log('\n🔧 Adding missing Firebase environment variables...');

      // If .env.example exists, try to get values from there
      if (fs.existsSync(envExamplePath)) {
        const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
        const exampleLines = exampleContent.split('\n');

        missingVars.forEach(varName => {
          const exampleLine = exampleLines.find(line => line.startsWith(`${varName}=`));
          if (exampleLine) {
            // Add the variable from example (will need manual configuration)
            console.log(`   📝 ${varName}: Please configure in .env file`);
          }
        });
      } else {
        console.log('   📝 Please add the following to your .env file:');
        missingVars.forEach(varName => {
          console.log(`   ${varName}=your_${varName.toLowerCase()}_here`);
        });
      }
    }

  } catch (error) {
    console.log('   ❌ Error reading .env file:', error.message);
  }
} else {
  console.log('❌ .env file not found');

  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Copying .env.example to .env...');
    try {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created from .env.example');
      console.log('🔧 Please configure the Firebase variables in .env');
    } catch (error) {
      console.log('❌ Error copying .env.example:', error.message);
    }
  }
}

console.log('\n📋 Required Firebase Environment Variables:');
console.log('FIREBASE_PROJECT_ID=your-project-id');
console.log('FIREBASE_CLIENT_EMAIL=your-service-account-email');
console.log('FIREBASE_PRIVATE_KEY=your-private-key');

console.log('\n🚀 To fix Firebase issues:');
console.log('1. Open src/.env');
console.log('2. Add the missing FIREBASE_* variables');
console.log('3. Restart the development server');

console.log('\n✅ Environment check completed!');
