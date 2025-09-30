"use strict";
/**
 * OpenAPI/Swagger Configuration for Beginner Investor Hub API
 * Comprehensive API documentation with authentication, validation, and examples
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.openApiSpec = void 0;
exports.openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Beginner Investor Hub API',
        version: '1.0.0',
        description: `
# Beginner Investor Hub API Documentation

A comprehensive REST API for the Beginner Investor Hub platform, providing investment tools, portfolio management, risk assessment, and educational resources for beginner investors.

## Features
- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 📊 **Portfolio Management** - Track and analyze investment portfolios
- 🎯 **Risk Assessment** - Comprehensive risk profiling and analysis
- 🎮 **Gamification** - Investment challenges and leaderboards
- 📚 **Education** - Investment learning resources and courses
- 💳 **Payment Processing** - Stripe integration for premium features
- 📧 **Newsletter** - Investment news and insights subscription

## Security
All endpoints are secured with input validation, rate limiting, and proper authentication mechanisms.

## Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 10 requests per 15 minutes per IP
- **Payment**: 5 requests per 15 minutes per IP

## Error Handling
All endpoints return structured error responses with appropriate HTTP status codes and detailed error messages.
    `,
        contact: {
            name: 'Beginner Investor Hub API Support',
            url: 'https://beginnerinvestorhub.com/support',
            email: 'api-support@beginnerinvestorhub.com'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        },
        termsOfService: 'https://beginnerinvestorhub.com/terms'
    },
    servers: [
        {
            url: 'http://localhost:4000',
            description: 'Development server'
        },
        {
            url: 'https://backend-api-989d.onrender.com',
            description: 'Production server'
        },
        {
            url: 'https://api.beginnerinvestorhub.com',
            description: 'Production API (Custom Domain)'
        }
    ],
    // ==============================================================================
    // SECURITY SCHEMES
    // ==============================================================================
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT token obtained from /api/auth/login endpoint'
            },
            ApiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'X-API-Key',
                description: 'API key for service-to-service communication'
            }
        },
        // ==============================================================================
        // REUSABLE SCHEMAS
        // ==============================================================================
        schemas: {
            // Error Responses
            ErrorResponse: {
                type: 'object',
                required: ['error', 'message', 'statusCode'],
                properties: {
                    error: {
                        type: 'string',
                        description: 'Error type identifier'
                    },
                    message: {
                        type: 'string',
                        description: 'Human-readable error message'
                    },
                    statusCode: {
                        type: 'integer',
                        description: 'HTTP status code'
                    },
                    details: {
                        type: 'object',
                        description: 'Additional error details (validation errors, etc.)'
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Error timestamp'
                    },
                    path: {
                        type: 'string',
                        description: 'Request path that caused the error'
                    }
                },
                example: {
                    error: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    statusCode: 400,
                    details: {
                        email: 'Valid email is required',
                        password: 'Password must be at least 8 characters'
                    },
                    timestamp: '2024-01-20T10:30:00.000Z',
                    path: '/api/auth/register'
                }
            },
            // Success Response
            SuccessResponse: {
                type: 'object',
                required: ['success', 'message'],
                properties: {
                    success: {
                        type: 'boolean',
                        example: true
                    },
                    message: {
                        type: 'string',
                        description: 'Success message'
                    },
                    data: {
                        type: 'object',
                        description: 'Response data'
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            // User Schemas
            User: {
                type: 'object',
                required: ['id', 'email', 'role', 'createdAt'],
                properties: {
                    id: {
                        type: 'string',
                        description: 'Unique user identifier',
                        example: 'user_123456789'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'User email address',
                        example: 'investor@example.com'
                    },
                    role: {
                        type: 'string',
                        enum: ['user', 'premium', 'admin'],
                        description: 'User role determining access level',
                        example: 'user'
                    },
                    profile: {
                        $ref: '#/components/schemas/UserProfile'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Account creation timestamp'
                    },
                    lastLogin: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Last login timestamp'
                    }
                }
            },
            UserProfile: {
                type: 'object',
                properties: {
                    firstName: {
                        type: 'string',
                        maxLength: 50,
                        example: 'John'
                    },
                    lastName: {
                        type: 'string',
                        maxLength: 50,
                        example: 'Doe'
                    },
                    dateOfBirth: {
                        type: 'string',
                        format: 'date',
                        example: '1990-01-15'
                    },
                    phoneNumber: {
                        type: 'string',
                        pattern: '^\\+?[1-9]\\d{1,14}$',
                        example: '+1234567890'
                    },
                    address: {
                        $ref: '#/components/schemas/Address'
                    },
                    investmentExperience: {
                        type: 'string',
                        enum: ['beginner', 'intermediate', 'advanced'],
                        example: 'beginner'
                    },
                    riskTolerance: {
                        type: 'string',
                        enum: ['conservative', 'moderate', 'aggressive'],
                        example: 'moderate'
                    },
                    investmentGoals: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: ['retirement', 'wealth_building', 'income', 'education', 'emergency_fund']
                        },
                        example: ['retirement', 'wealth_building']
                    }
                }
            },
            Address: {
                type: 'object',
                properties: {
                    street: {
                        type: 'string',
                        maxLength: 100,
                        example: '123 Main Street'
                    },
                    city: {
                        type: 'string',
                        maxLength: 50,
                        example: 'New York'
                    },
                    state: {
                        type: 'string',
                        maxLength: 50,
                        example: 'NY'
                    },
                    zipCode: {
                        type: 'string',
                        pattern: '^\\d{5}(-\\d{4})?$',
                        example: '10001'
                    },
                    country: {
                        type: 'string',
                        maxLength: 50,
                        example: 'United States'
                    }
                }
            },
            // Authentication Schemas
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'User email address',
                        example: 'investor@example.com'
                    },
                    password: {
                        type: 'string',
                        minLength: 8,
                        description: 'User password (minimum 8 characters)',
                        example: 'SecurePassword123!'
                    },
                    rememberMe: {
                        type: 'boolean',
                        description: 'Extend session duration',
                        default: false
                    }
                }
            },
            RegisterRequest: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName', 'acceptedTerms'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'newuser@example.com'
                    },
                    password: {
                        type: 'string',
                        minLength: 8,
                        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
                        description: 'Password must contain at least 8 characters, uppercase, lowercase, number, and special character',
                        example: 'SecurePassword123!'
                    },
                    firstName: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 50,
                        example: 'Jane'
                    },
                    lastName: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 50,
                        example: 'Smith'
                    },
                    acceptedTerms: {
                        type: 'boolean',
                        description: 'Must be true to register',
                        example: true
                    },
                    marketingOptIn: {
                        type: 'boolean',
                        description: 'Opt-in for marketing communications',
                        default: false
                    }
                }
            },
            AuthResponse: {
                type: 'object',
                required: ['token', 'user', 'expiresIn'],
                properties: {
                    token: {
                        type: 'string',
                        description: 'JWT authentication token',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    },
                    user: {
                        $ref: '#/components/schemas/User'
                    },
                    expiresIn: {
                        type: 'integer',
                        description: 'Token expiration time in seconds',
                        example: 86400
                    },
                    refreshToken: {
                        type: 'string',
                        description: 'Refresh token for obtaining new access tokens'
                    }
                }
            },
            // Portfolio Schemas
            Portfolio: {
                type: 'object',
                required: ['id', 'userId', 'name', 'totalValue', 'holdings'],
                properties: {
                    id: {
                        type: 'string',
                        description: 'Portfolio unique identifier',
                        example: 'portfolio_123456'
                    },
                    userId: {
                        type: 'string',
                        description: 'Owner user ID',
                        example: 'user_123456789'
                    },
                    name: {
                        type: 'string',
                        maxLength: 100,
                        description: 'Portfolio name',
                        example: 'My Retirement Portfolio'
                    },
                    description: {
                        type: 'string',
                        maxLength: 500,
                        description: 'Portfolio description'
                    },
                    totalValue: {
                        type: 'number',
                        format: 'float',
                        minimum: 0,
                        description: 'Total portfolio value in USD',
                        example: 25000.50
                    },
                    holdings: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Holding'
                        }
                    },
                    performance: {
                        $ref: '#/components/schemas/PortfolioPerformance'
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time'
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            Holding: {
                type: 'object',
                required: ['symbol', 'quantity', 'averagePrice', 'currentPrice'],
                properties: {
                    symbol: {
                        type: 'string',
                        description: 'Stock/ETF symbol',
                        example: 'AAPL'
                    },
                    quantity: {
                        type: 'number',
                        format: 'float',
                        minimum: 0,
                        description: 'Number of shares',
                        example: 10.5
                    },
                    averagePrice: {
                        type: 'number',
                        format: 'float',
                        minimum: 0,
                        description: 'Average purchase price per share',
                        example: 150.25
                    },
                    currentPrice: {
                        type: 'number',
                        format: 'float',
                        minimum: 0,
                        description: 'Current market price per share',
                        example: 175.80
                    },
                    marketValue: {
                        type: 'number',
                        format: 'float',
                        description: 'Current market value of holding',
                        example: 1845.90
                    },
                    gainLoss: {
                        type: 'number',
                        format: 'float',
                        description: 'Unrealized gain/loss',
                        example: 268.28
                    },
                    gainLossPercent: {
                        type: 'number',
                        format: 'float',
                        description: 'Unrealized gain/loss percentage',
                        example: 17.02
                    }
                }
            },
            // Risk Assessment Schemas
            RiskAssessment: {
                type: 'object',
                required: ['userId', 'riskScore', 'riskLevel', 'responses'],
                properties: {
                    id: {
                        type: 'string',
                        example: 'risk_assessment_123'
                    },
                    userId: {
                        type: 'string',
                        example: 'user_123456789'
                    },
                    riskScore: {
                        type: 'integer',
                        minimum: 0,
                        maximum: 100,
                        description: 'Calculated risk score (0-100)',
                        example: 65
                    },
                    riskLevel: {
                        type: 'string',
                        enum: ['conservative', 'moderate', 'aggressive'],
                        example: 'moderate'
                    },
                    responses: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/RiskQuestionResponse'
                        }
                    },
                    recommendations: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        example: [
                            'Consider diversifying with index funds',
                            'Maintain 3-6 months emergency fund',
                            'Review portfolio quarterly'
                        ]
                    },
                    completedAt: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            // Gamification Schemas
            Challenge: {
                type: 'object',
                required: ['id', 'title', 'description', 'points', 'difficulty'],
                properties: {
                    id: {
                        type: 'string',
                        example: 'challenge_123'
                    },
                    title: {
                        type: 'string',
                        maxLength: 100,
                        example: 'First Investment'
                    },
                    description: {
                        type: 'string',
                        maxLength: 500,
                        example: 'Make your first investment of at least $100'
                    },
                    points: {
                        type: 'integer',
                        minimum: 0,
                        example: 100
                    },
                    difficulty: {
                        type: 'string',
                        enum: ['easy', 'medium', 'hard'],
                        example: 'easy'
                    },
                    category: {
                        type: 'string',
                        enum: ['investment', 'education', 'portfolio', 'social'],
                        example: 'investment'
                    },
                    requirements: {
                        type: 'object',
                        description: 'Challenge completion requirements'
                    },
                    isActive: {
                        type: 'boolean',
                        example: true
                    },
                    startDate: {
                        type: 'string',
                        format: 'date-time'
                    },
                    endDate: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            }
        },
        // ==============================================================================
        // REUSABLE RESPONSES
        // ==============================================================================
        responses: {
            UnauthorizedError: {
                description: 'Authentication required',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        },
                        example: {
                            error: 'UNAUTHORIZED',
                            message: 'Authentication required. Please provide a valid JWT token.',
                            statusCode: 401,
                            timestamp: '2024-01-20T10:30:00.000Z',
                            path: '/api/profile'
                        }
                    }
                }
            },
            ForbiddenError: {
                description: 'Insufficient permissions',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        },
                        example: {
                            error: 'FORBIDDEN',
                            message: 'Insufficient permissions to access this resource.',
                            statusCode: 403,
                            timestamp: '2024-01-20T10:30:00.000Z',
                            path: '/api/admin/users'
                        }
                    }
                }
            },
            ValidationError: {
                description: 'Input validation failed',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        },
                        example: {
                            error: 'VALIDATION_ERROR',
                            message: 'Input validation failed',
                            statusCode: 400,
                            details: {
                                email: 'Valid email is required',
                                password: 'Password must be at least 8 characters'
                            },
                            timestamp: '2024-01-20T10:30:00.000Z',
                            path: '/api/auth/register'
                        }
                    }
                }
            },
            RateLimitError: {
                description: 'Rate limit exceeded',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        },
                        example: {
                            error: 'RATE_LIMIT_EXCEEDED',
                            message: 'Too many requests from this IP, please try again later.',
                            statusCode: 429,
                            timestamp: '2024-01-20T10:30:00.000Z',
                            path: '/api/auth/login'
                        }
                    }
                }
            },
            InternalServerError: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ErrorResponse'
                        },
                        example: {
                            error: 'INTERNAL_SERVER_ERROR',
                            message: 'An unexpected error occurred. Please try again later.',
                            statusCode: 500,
                            timestamp: '2024-01-20T10:30:00.000Z',
                            path: '/api/portfolio'
                        }
                    }
                }
            }
        },
        // ==============================================================================
        // REUSABLE PARAMETERS
        // ==============================================================================
        parameters: {
            UserIdParam: {
                name: 'userId',
                in: 'path',
                required: true,
                description: 'User unique identifier',
                schema: {
                    type: 'string',
                    example: 'user_123456789'
                }
            },
            PaginationLimit: {
                name: 'limit',
                in: 'query',
                description: 'Number of items to return (max 100)',
                schema: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 100,
                    default: 20
                }
            },
            PaginationOffset: {
                name: 'offset',
                in: 'query',
                description: 'Number of items to skip',
                schema: {
                    type: 'integer',
                    minimum: 0,
                    default: 0
                }
            }
        }
    },
    // ==============================================================================
    // GLOBAL SECURITY
    // ==============================================================================
    security: [
        {
            BearerAuth: []
        }
    ],
    // ==============================================================================
    // TAGS FOR ORGANIZATION
    // ==============================================================================
    tags: [
        {
            name: 'Authentication',
            description: 'User authentication and authorization endpoints'
        },
        {
            name: 'User Management',
            description: 'User profile and account management'
        },
        {
            name: 'Portfolio',
            description: 'Investment portfolio management and tracking'
        },
        {
            name: 'Risk Assessment',
            description: 'Investment risk profiling and analysis'
        },
        {
            name: 'Gamification',
            description: 'Investment challenges, achievements, and leaderboards'
        },
        {
            name: 'Education',
            description: 'Investment learning resources and courses'
        },
        {
            name: 'Newsletter',
            description: 'Newsletter subscription and management'
        },
        {
            name: 'Payments',
            description: 'Stripe payment processing and subscription management'
        },
        {
            name: 'Admin',
            description: 'Administrative functions (admin access required)'
        },
        {
            name: 'Health',
            description: 'API health and monitoring endpoints'
        }
    ],
    // Paths will be added programmatically by route decorators
    paths: {}
};
