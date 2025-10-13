const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Run jest with coverage
  execSync('npx jest --passWithNoTests --coverage --coverageReporters=lcov', {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Check if coverage file exists and has content
  const coveragePath = path.join(process.cwd(), 'coverage', 'lcov.info');
  if (fs.existsSync(coveragePath) && fs.statSync(coveragePath).size > 0) {
    console.log('Uploading coverage to coveralls...');
    execSync(`type "${coveragePath}" | coveralls`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } else {
    console.log('No tests found, skipping coverage upload');
  }
} catch (error) {
  console.error('Test execution failed:', error.message);
  process.exit(1);
}
