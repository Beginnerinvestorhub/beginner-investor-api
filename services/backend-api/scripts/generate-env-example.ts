import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { generateEnvExample } from '../src/config/env.schema.js';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the .env.example file
const envExamplePath = join(__dirname, '../../.env.example');

// Generate the .env.example content
const envExampleContent = `# Environment variables declaration.
# This file is auto-generated. Do not commit secrets to version control.
# Copy this file to .env and update the values as needed.

${generateEnvExample()}

# Additional environment variables can be added below this line
`;

// Write the .env.example file
try {
  writeFileSync(envExamplePath, envExampleContent, 'utf8');
  console.log('✅ .env.example file generated successfully');
} catch (error) {
  console.error('❌ Failed to generate .env.example file:', error);
  process.exit(1);
}
