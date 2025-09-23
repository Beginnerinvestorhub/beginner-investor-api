"use strict";
/**
 * Swagger/OpenAPI Documentation Middleware
 * Serves interactive API documentation with Swagger UI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.docsAuth = exports.documentRoute = exports.serveDocsLanding = exports.serveReDoc = exports.serveSwaggerUI = exports.serveOpenApiSpec = void 0;
const openapi_1 = require("../config/openapi");
// ==============================================================================
// SWAGGER UI HTML TEMPLATE
// ==============================================================================
const swaggerUIHTML = (specUrl, title = 'API Documentation') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
    <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.10.3/favicon-32x32.png" sizes="32x32" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin: 0;
            background: #fafafa;
        }
        .swagger-ui .topbar {
            background-color: #4338ca;
        }
        .swagger-ui .topbar .download-url-wrapper .select-label {
            color: white;
        }
        .swagger-ui .topbar .download-url-wrapper input[type=text] {
            border: 2px solid #4338ca;
        }
        .swagger-ui .info .title {
            color: #4338ca;
        }
        .swagger-ui .scheme-container {
            background: #4338ca;
            box-shadow: 0 1px 2px 0 rgba(0,0,0,.15);
        }
        .swagger-ui .scheme-container .schemes > label {
            color: white;
        }
        .custom-header {
            background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 0;
        }
        .custom-header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 700;
        }
        .custom-header p {
            margin: 10px 0 0 0;
            font-size: 1.1rem;
            opacity: 0.9;
        }
        .api-info {
            background: white;
            padding: 20px;
            margin: 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .api-info .badges {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            flex-wrap: wrap;
        }
        .api-info .badge {
            background: #f3f4f6;
            color: #374151;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
        }
        .api-info .badge.security {
            background: #dcfce7;
            color: #166534;
        }
        .api-info .badge.rate-limit {
            background: #fef3c7;
            color: #92400e;
        }
        .api-info .badge.validation {
            background: #dbeafe;
            color: #1e40af;
        }
    </style>
</head>
<body>
    <div class="custom-header">
        <h1>🏦 Beginner Investor Hub API</h1>
        <p>Comprehensive REST API for Investment Tools & Portfolio Management</p>
    </div>
    
    <div class="api-info">
        <div class="badges">
            <span class="badge security">🔐 JWT Authentication</span>
            <span class="badge rate-limit">⏱️ Rate Limited</span>
            <span class="badge validation">✅ Input Validation</span>
            <span class="badge">📊 Portfolio Management</span>
            <span class="badge">🎯 Risk Assessment</span>
            <span class="badge">🎮 Gamification</span>
            <span class="badge">📚 Education</span>
            <span class="badge">💳 Payments</span>
        </div>
    </div>
    
    <div id="swagger-ui"></div>
    
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '${specUrl}',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                defaultModelsExpandDepth: 1,
                defaultModelExpandDepth: 1,
                docExpansion: "list",
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                tryItOutEnabled: true,
                requestInterceptor: function(request) {
                    // Add custom headers or modify requests
                    request.headers['X-Requested-With'] = 'SwaggerUI';
                    return request;
                },
                responseInterceptor: function(response) {
                    // Process responses
                    return response;
                },
                onComplete: function() {
                    console.log('Swagger UI loaded successfully');
                },
                onFailure: function(data) {
                    console.error('Failed to load Swagger UI:', data);
                }
            });
            
            // Custom authorization handling
            ui.preauthorizeApiKey('BearerAuth', localStorage.getItem('jwt_token') || '');
        };
    </script>
</body>
</html>
`;
// ==============================================================================
// REDOC HTML TEMPLATE (Alternative Documentation)
// ==============================================================================
const redocHTML = (specUrl, title = 'API Documentation') => `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
        }
        .custom-header {
            background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .custom-header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 700;
            font-family: 'Montserrat', sans-serif;
        }
        .custom-header p {
            margin: 15px 0 0 0;
            font-size: 1.2rem;
            opacity: 0.9;
            font-family: 'Roboto', sans-serif;
        }
    </style>
</head>
<body>
    <div class="custom-header">
        <h1>🏦 Beginner Investor Hub API</h1>
        <p>Comprehensive API Documentation</p>
    </div>
    <redoc spec-url='${specUrl}' theme='{"colors": {"primary": {"main": "#4338ca"}}}'></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>
`;
// ==============================================================================
// MIDDLEWARE FUNCTIONS
// ==============================================================================
/**
 * Serve OpenAPI JSON specification
 */
const serveOpenApiSpec = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Add request info to spec
    const protocol = req.get('X-Forwarded-Proto') || req.protocol;
    const host = req.get('Host');
    const baseUrl = `${protocol}://${host}`;
    const spec = Object.assign(Object.assign({}, openapi_1.openApiSpec), { servers: [
            { url: baseUrl, description: 'Current server' },
            ...(openapi_1.openApiSpec.servers || [])
        ] });
    res.json(spec);
};
exports.serveOpenApiSpec = serveOpenApiSpec;
/**
 * Serve Swagger UI documentation
 */
const serveSwaggerUI = (req, res) => {
    const protocol = req.get('X-Forwarded-Proto') || req.protocol;
    const host = req.get('Host');
    const specUrl = `${protocol}://${host}/api/docs/openapi.json`;
    res.setHeader('Content-Type', 'text/html');
    res.send(swaggerUIHTML(specUrl, 'Beginner Investor Hub API Documentation'));
};
exports.serveSwaggerUI = serveSwaggerUI;
/**
 * Serve ReDoc documentation (alternative to Swagger UI)
 */
const serveReDoc = (req, res) => {
    const protocol = req.get('X-Forwarded-Proto') || req.protocol;
    const host = req.get('Host');
    const specUrl = `${protocol}://${host}/api/docs/openapi.json`;
    res.setHeader('Content-Type', 'text/html');
    res.send(redocHTML(specUrl, 'Beginner Investor Hub API Documentation'));
};
exports.serveReDoc = serveReDoc;
/**
 * Documentation landing page with links to different formats
 */
const serveDocsLanding = (req, res) => {
    const protocol = req.get('X-Forwarded-Proto') || req.protocol;
    const host = req.get('Host');
    const baseUrl = `${protocol}://${host}`;
    const landingHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Documentation - Beginner Investor Hub</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 600px;
                width: 90%;
                text-align: center;
            }
            h1 {
                color: #4338ca;
                font-size: 2.5rem;
                margin-bottom: 10px;
                font-weight: 700;
            }
            .subtitle {
                color: #6b7280;
                font-size: 1.2rem;
                margin-bottom: 40px;
            }
            .docs-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .doc-card {
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                padding: 25px;
                text-decoration: none;
                color: inherit;
                transition: all 0.3s ease;
            }
            .doc-card:hover {
                border-color: #4338ca;
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(67, 56, 202, 0.1);
            }
            .doc-card h3 {
                color: #4338ca;
                font-size: 1.3rem;
                margin-bottom: 10px;
            }
            .doc-card p {
                color: #6b7280;
                line-height: 1.5;
            }
            .api-info {
                background: #f0f9ff;
                border-radius: 12px;
                padding: 20px;
                margin-top: 30px;
            }
            .api-info h4 {
                color: #0369a1;
                margin-bottom: 15px;
            }
            .endpoints {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                font-size: 0.9rem;
            }
            .endpoint {
                background: white;
                padding: 8px 12px;
                border-radius: 6px;
                color: #374151;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏦 API Documentation</h1>
            <p class="subtitle">Beginner Investor Hub REST API</p>
            
            <div class="docs-grid">
                <a href="${baseUrl}/api/docs/swagger" class="doc-card">
                    <h3>📖 Swagger UI</h3>
                    <p>Interactive API documentation with try-it-out functionality. Perfect for testing endpoints and exploring the API.</p>
                </a>
                
                <a href="${baseUrl}/api/docs/redoc" class="doc-card">
                    <h3>📚 ReDoc</h3>
                    <p>Clean, responsive API documentation with detailed schemas and examples. Great for reference and integration.</p>
                </a>
                
                <a href="${baseUrl}/api/docs/openapi.json" class="doc-card">
                    <h3>🔧 OpenAPI Spec</h3>
                    <p>Raw OpenAPI 3.0 specification in JSON format. Use this to generate client SDKs or import into tools.</p>
                </a>
            </div>
            
            <div class="api-info">
                <h4>🚀 Available Endpoints</h4>
                <div class="endpoints">
                    <div class="endpoint">🔐 Authentication</div>
                    <div class="endpoint">👤 User Management</div>
                    <div class="endpoint">📊 Portfolio</div>
                    <div class="endpoint">🎯 Risk Assessment</div>
                    <div class="endpoint">🎮 Gamification</div>
                    <div class="endpoint">📚 Education</div>
                    <div class="endpoint">📧 Newsletter</div>
                    <div class="endpoint">💳 Payments</div>
                    <div class="endpoint">⚙️ Admin</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(landingHTML);
};
exports.serveDocsLanding = serveDocsLanding;
/**
 * Middleware to add OpenAPI documentation to routes
 */
const documentRoute = (operation) => {
    return (req, res, next) => {
        // Store operation info in request for potential use
        req.openApiOperation = operation;
        next();
    };
};
exports.documentRoute = documentRoute;
/**
 * Security middleware for documentation endpoints
 */
const docsAuth = (req, res, next) => {
    // In production, you might want to restrict access to docs
    if (process.env.NODE_ENV === 'production' && process.env.DOCS_PASSWORD) {
        const auth = req.headers.authorization;
        if (!auth || auth !== `Bearer ${process.env.DOCS_PASSWORD}`) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Documentation access requires authentication in production'
            });
        }
    }
    next();
};
exports.docsAuth = docsAuth;
exports.default = {
    serveOpenApiSpec: exports.serveOpenApiSpec,
    serveSwaggerUI: exports.serveSwaggerUI,
    serveReDoc: exports.serveReDoc,
    serveDocsLanding: exports.serveDocsLanding,
    documentRoute: exports.documentRoute,
    docsAuth: exports.docsAuth
};
