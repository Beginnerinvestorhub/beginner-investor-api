import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load OpenAPI specification
const openapiDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));

// Create Express app
const app = express();
const PORT = process.env.DOCS_PORT || 3001;

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Serve OpenAPI spec as JSON
app.get('/api-docs.json', (req, res) => {
  res.json(openapiDocument);
});

// Start server
app.listen(PORT, () => {
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`OpenAPI spec available at http://localhost:${PORT}/api-docs.json`);
});
