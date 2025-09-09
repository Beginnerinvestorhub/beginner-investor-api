#!/usr/bin/env node

/**
 * Security Audit Script
 * Checks for common security issues in the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const CONFIG = {
  scanDirs: [
    'tools-restructured/services/backend-api',
    'tools-restructured/frontend',
    'tools-restructured/ai-behavioral-nudge',
    'tools-restructured/python-engine'
  ],
  sensitivePatterns: [
    /(password|secret|key|token|credential)/i,
    /(api[_-]?key|access[_-]?key|secret[_-]?key)/i,
    /(jwt|auth|session)[_-]?(secret|key)/i,
    /(database|db)[_-]?(url|password|user|host|port)/i,
    /(aws|google|github)[_-]?(key|secret|token)/i
  ]
};

// Results
const results = {
  vulnerabilities: [],
  dependencies: [],
  sensitiveData: [],
  configIssues: []
};

// Main function
async function runAudit() {
  console.log(chalk.blue('\n🔍 Running security audit...\n'));
  
  await checkDependencies();
  await checkSensitiveData();
  await checkConfigs();
  
  generateReport();
}

// Check for vulnerable dependencies
async function checkDependencies() {
  console.log(chalk.blue('Checking dependencies...'));
  
  try {
    // npm audit
    try {
      const audit = JSON.parse(execSync('npm audit --json').toString());
      if (audit.vulnerabilities) {
        Object.entries(audit.vulnerabilities).forEach(([severity, count]) => {
          if (count > 0) {
            results.vulnerabilities.push({ severity, count });
          }
        });
      }
    } catch (e) {
      // npm audit exits with code 1 when vulnerabilities are found
      if (e.status !== 1) throw e;
    }
    
    // Check for outdated packages
    const outdated = JSON.parse(execSync('npm outdated --json').toString());
    results.dependencies = Object.entries(outdated).map(([pkg, info]) => ({
      package: pkg,
      current: info.current,
      wanted: info.wanted,
      latest: info.latest
    }));
    
  } catch (error) {
    console.error(chalk.red('Error checking dependencies:'), error.message);
  }
}

// Check for sensitive data in files
async function checkSensitiveData() {
  console.log(chalk.blue('\nScanning for sensitive data...'));
  
  for (const dir of CONFIG.scanDirs) {
    if (!fs.existsSync(dir)) continue;
    
    const files = await findFiles(dir, ['*.js', '*.ts', '*.json', '*.env*']);
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        CONFIG.sensitivePatterns.forEach(pattern => {
          if (pattern.test(content)) {
            results.sensitiveData.push({
              file: path.relative(process.cwd(), file),
              pattern: pattern.toString(),
            });
          }
        });
      } catch (error) {
        console.error(chalk.red(`Error scanning ${file}:`), error.message);
      }
    }
  }
}

// Check for security misconfigurations
async function checkConfigs() {
  console.log(chalk.blue('\nChecking configurations...'));
  
  // Check for .env files in git
  try {
    const gitFiles = execSync('git ls-files').toString().split('\n');
    const envFiles = gitFiles.filter(f => f.includes('.env'));
    
    if (envFiles.length > 0) {
      results.configIssues.push({
        issue: 'Sensitive .env files in git',
        files: envFiles
      });
    }
  } catch (error) {
    console.error(chalk.red('Error checking git files:'), error.message);
  }
  
  // Check for debug mode in production
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (pkg.scripts?.start?.includes('--inspect')) {
      results.configIssues.push({
        issue: 'Debug mode enabled in production',
        file: 'package.json',
        details: 'Start script contains --inspect flag'
      });
    }
  }
}

// Generate report
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log(chalk.bold('SECURITY AUDIT REPORT'));
  console.log('='.repeat(80));
  
  // Dependencies
  console.log('\n' + chalk.underline('DEPENDENCIES'));
  if (results.vulnerabilities.length > 0) {
    results.vulnerabilities.forEach(({ severity, count }) => {
      console.log(chalk.red(`✗ ${count} ${severity} vulnerabilities found`));
    });
  } else {
    console.log(chalk.green('✓ No known vulnerabilities found'));
  }
  
  // Sensitive data
  console.log('\n' + chalk.underline('SENSITIVE DATA'));
  if (results.sensitiveData.length > 0) {
    console.log(chalk.yellow(`⚠ Found ${results.sensitiveData.length} potential sensitive data leaks:`));
    results.sensitiveData.slice(0, 5).forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.file} (${item.pattern})`);
    });
    if (results.sensitiveData.length > 5) {
      console.log(`  ...and ${results.sensitiveData.length - 5} more`);
    }
  } else {
    console.log(chalk.green('✓ No sensitive data found'));
  }
  
  // Config issues
  console.log('\n' + chalk.underline('CONFIGURATION ISSUES'));
  if (results.configIssues.length > 0) {
    results.configIssues.forEach((issue, i) => {
      console.log(chalk.yellow(`⚠ ${i + 1}. ${issue.issue}`));
      if (issue.files) {
        console.log('   Files:', issue.files.join(', '));
      }
      if (issue.details) {
        console.log('   Details:', issue.details);
      }
    });
  } else {
    console.log(chalk.green('✓ No configuration issues found'));
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  // Summary
  const totalIssues = 
    results.vulnerabilities.length +
    results.sensitiveData.length +
    results.configIssues.length;
    
  if (totalIssues > 0) {
    console.log(chalk.red.bold(`Found ${totalIssues} security issues that need attention!`));
    process.exit(1);
  } else {
    console.log(chalk.green.bold('✓ No critical security issues found!'));
    process.exit(0);
  }
}

// Helper function to find files
async function findFiles(dir, extensions) {
  const { globby } = await import('globby');
  const patterns = extensions.map(ext => `${dir}/**/*${ext}`);
  return globby(patterns, { ignore: ['**/node_modules/**', '**/dist/**'] });
}

// Run the audit
runAudit().catch(console.error);
