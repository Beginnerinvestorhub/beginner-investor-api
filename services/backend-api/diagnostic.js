#!/usr/bin/env node

/**
 * Simple Backend API Diagnostic Script
 */

console.log('🔍 Backend API Diagnostic');
console.log('========================\n');

// Check Node.js
console.log('1. Node.js Version:');
try {
  console.log('   Node.js:', process.version);
  console.log('   Platform:', process.platform);
} catch (error) {
  console.log('   ❌ Error checking Node.js:', error.message);
}

// Check package.json
console.log('\n2. Package Configuration:');
try {
  const fs = require('fs');
  const path = require('path');

  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('   ✅ package.json found');
    console.log('   📦 Name:', packageJson.name);
    console.log('   🔧 Scripts:', Object.keys(packageJson.scripts || {}).length);

    // Check for key dependencies
    const devDeps = packageJson.devDependencies || {};
    const keyDeps = ['jest', 'typescript', 'prisma'];
    keyDeps.forEach(dep => {
      if (devDeps[dep]) {
        console.log(`   ✅ ${dep}: ${devDeps[dep]}`);
      } else {
        console.log(`   ❌ ${dep}: missing`);
      }
    });
  } else {
    console.log('   ❌ package.json not found');
  }
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
}

// Check directories
console.log('\n3. Directory Structure:');
try {
  const fs = require('fs');
  const path = require('path');

  const srcDir = path.join(process.cwd(), 'src');
  const testDir = path.join(srcDir, '__tests__');

  if (fs.existsSync(srcDir)) {
    console.log('   ✅ src/ directory exists');

    if (fs.existsSync(testDir)) {
      console.log('   ✅ __tests__/ directory exists');

      const testFiles = fs.readdirSync(testDir, { recursive: true })
        .filter(file => typeof file === 'string' && file.endsWith('.test.ts'));
      console.log(`   📄 Test files found: ${testFiles.length}`);
    } else {
      console.log('   ❌ __tests__/ directory missing');
    }
  } else {
    console.log('   ❌ src/ directory missing');
  }
} catch (error) {
  console.log('   ❌ Error checking directories:', error.message);
}

// Check environment
console.log('\n4. Environment Variables:');
const envVars = ['NODE_ENV', 'DATABASE_URL', 'REDIS_URL'];
envVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: set`);
  } else {
    console.log(`   ⚠️  ${envVar}: not set`);
  }
});

console.log('\n5. Next Steps:');
console.log('   Run: npm install');
console.log('   Run: npm run test:debug');
console.log('   Run: npm run type-check');
console.log('   Run: npm run lint');

console.log('\n✅ Diagnostic completed!');
