#!/usr/bin/env node

/**
 * Debug script for backend API testing
 * Provides detailed information about test setup and execution
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Backend API Test Debugger');
console.log('==============================\n');

// Check Node.js version
console.log('1. Node.js Environment:');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`   ✅ Node.js: ${nodeVersion}`);
} catch (error) {
  console.log(`   ❌ Node.js check failed: ${error.message}`);
}

// Check if dependencies are installed
console.log('\n2. Dependencies Check:');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('   ✅ package.json found');
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const deps = Object.keys(packageJson.dependencies || {});
    const devDeps = Object.keys(packageJson.devDependencies || {});

    console.log(`   📦 Dependencies: ${deps.length} packages`);
    console.log(`   🔧 Dev Dependencies: ${devDeps.length} packages`);

    // Check for key testing dependencies
    const keyDeps = ['jest', 'ts-jest', '@types/jest', 'supertest'];
    keyDeps.forEach(dep => {
      if (devDeps.includes(dep)) {
        console.log(`   ✅ ${dep}: installed`);
      } else {
        console.log(`   ❌ ${dep}: missing`);
      }
    });
  } catch (error) {
    console.log(`   ❌ Failed to parse package.json: ${error.message}`);
  }
} else {
  console.log('   ❌ package.json not found');
}

// Check Jest configuration
console.log('\n3. Jest Configuration:');
const jestConfigPath = path.join(process.cwd(), 'jest.config.ts');
if (fs.existsSync(jestConfigPath)) {
  console.log('   ✅ Jest config found');

  try {
    // Check if jest can be executed
    execSync('npx jest --version', { stdio: 'pipe' });
    console.log('   ✅ Jest executable found');
  } catch (error) {
    console.log(`   ❌ Jest executable not found: ${error.message}`);
  }
} else {
  console.log('   ❌ Jest config not found');
}

// Check test files
console.log('\n4. Test Files:');
const testDir = path.join(process.cwd(), 'src', '__tests__');
if (fs.existsSync(testDir)) {
  console.log('   ✅ Test directory found');

  try {
    const files = fs.readdirSync(testDir, { recursive: true });
    const testFiles = files.filter(file =>
      typeof file === 'string' && file.endsWith('.test.ts')
    );

    console.log(`   📄 Test files found: ${testFiles.length}`);

    // Categorize test files
    const categories = {
      unit: testFiles.filter(f => f.includes('unit')),
      integration: testFiles.filter(f => f.includes('integration')),
      services: testFiles.filter(f => f.includes('services')),
      security: testFiles.filter(f => f.includes('security'))
    };

    Object.entries(categories).forEach(([category, files]) => {
      if (files.length > 0) {
        console.log(`   📂 ${category}: ${files.length} files`);
      }
    });

  } catch (error) {
    console.log(`   ❌ Failed to read test directory: ${error.message}`);
  }
} else {
  console.log('   ❌ Test directory not found');
}

// Check environment variables
console.log('\n5. Environment Variables:');
const requiredEnvVars = ['NODE_ENV', 'JWT_SECRET', 'DATABASE_URL'];
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: ${envVar === 'JWT_SECRET' ? '[REDACTED]' : process.env[envVar]}`);
  } else {
    console.log(`   ⚠️  ${envVar}: not set`);
  }
});

// Check coverage directory
console.log('\n6. Coverage Setup:');
const coverageDir = path.join(process.cwd(), 'coverage');
if (fs.existsSync(coverageDir)) {
  console.log('   ✅ Coverage directory exists');
} else {
  console.log('   📁 Coverage directory will be created');
}

console.log('\n🎯 Test Execution Commands:');
console.log('============================');
console.log('npm test              # Run all tests with coverage');
console.log('npm run test:unit     # Run unit tests only');
console.log('npm run test:integration # Run integration tests only');
console.log('npm run test:watch    # Run tests in watch mode');
console.log('npx jest --verbose    # Run with verbose output');
console.log('npx jest --coverage   # Generate coverage report');

console.log('\n✅ Debug check completed!');
