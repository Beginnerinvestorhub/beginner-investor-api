"use strict";
/**
 * Documentation Aggregator
 * Combines all route documentation into a single OpenAPI specification
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeApiSpec = void 0;
const openapi_1 = require("../config/openapi");
const auth_docs_1 = __importDefault(require("./auth.docs"));
const profile_docs_1 = __importDefault(require("./profile.docs"));
// ==============================================================================
// ADDITIONAL ROUTE DOCUMENTATION (Simplified for remaining routes)
// ==============================================================================
const dashboardPaths = {
    '/api/dashboard': {
        get: {
            tags: ['Portfolio'],
            summary: 'Get user dashboard data',
            description: 'Retrieve comprehensive dashboard data including portfolio summary, recent transactions, and market insights.',
            operationId: 'getDashboard',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'Dashboard data retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            portfolioSummary: {
                                                type: 'object',
                                                properties: {
                                                    totalValue: { type: 'number', example: 25000.50 },
                                                    dayChange: { type: 'number', example: 125.75 },
                                                    dayChangePercent: { type: 'number', example: 0.51 },
                                                    totalGainLoss: { type: 'number', example: 2500.25 }
                                                }
                                            },
                                            recentTransactions: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        id: { type: 'string' },
                                                        type: { type: 'string', enum: ['buy', 'sell'] },
                                                        symbol: { type: 'string' },
                                                        quantity: { type: 'number' },
                                                        price: { type: 'number' },
                                                        date: { type: 'string', format: 'date-time' }
                                                    }
                                                }
                                            },
                                            marketInsights: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        title: { type: 'string' },
                                                        summary: { type: 'string' },
                                                        category: { type: 'string' },
                                                        date: { type: 'string', format: 'date-time' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/UnauthorizedError' },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    }
};
const gamificationPaths = {
    '/api/gamification/challenges': {
        get: {
            tags: ['Gamification'],
            summary: 'Get available challenges',
            description: 'Retrieve list of available investment challenges for the user.',
            operationId: 'getChallenges',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'status',
                    in: 'query',
                    description: 'Filter challenges by status',
                    schema: {
                        type: 'string',
                        enum: ['active', 'completed', 'available', 'all'],
                        default: 'active'
                    }
                },
                { $ref: '#/components/parameters/PaginationLimit' },
                { $ref: '#/components/parameters/PaginationOffset' }
            ],
            responses: {
                '200': {
                    description: 'Challenges retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Challenge' }
                                    },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            total: { type: 'integer' },
                                            limit: { type: 'integer' },
                                            offset: { type: 'integer' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/UnauthorizedError' },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    },
    '/api/gamification/leaderboard': {
        get: {
            tags: ['Gamification'],
            summary: 'Get leaderboard rankings',
            description: 'Retrieve leaderboard rankings for investment challenges and achievements.',
            operationId: 'getLeaderboard',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'period',
                    in: 'query',
                    description: 'Leaderboard time period',
                    schema: {
                        type: 'string',
                        enum: ['daily', 'weekly', 'monthly', 'all-time'],
                        default: 'monthly'
                    }
                },
                { $ref: '#/components/parameters/PaginationLimit' }
            ],
            responses: {
                '200': {
                    description: 'Leaderboard retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                rank: { type: 'integer', example: 1 },
                                                userId: { type: 'string' },
                                                username: { type: 'string', example: 'InvestorPro' },
                                                points: { type: 'integer', example: 1250 },
                                                level: { type: 'integer', example: 5 },
                                                achievements: { type: 'integer', example: 12 }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/UnauthorizedError' },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    }
};
const newsletterPaths = {
    '/api/newsletter/subscribe': {
        post: {
            tags: ['Newsletter'],
            summary: 'Subscribe to newsletter',
            description: 'Subscribe to investment news and insights newsletter.',
            operationId: 'subscribeNewsletter',
            security: [], // Public endpoint
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['email'],
                            properties: {
                                email: {
                                    type: 'string',
                                    format: 'email',
                                    example: 'subscriber@example.com'
                                },
                                preferences: {
                                    type: 'object',
                                    properties: {
                                        frequency: {
                                            type: 'string',
                                            enum: ['daily', 'weekly', 'monthly'],
                                            default: 'weekly'
                                        },
                                        topics: {
                                            type: 'array',
                                            items: {
                                                type: 'string',
                                                enum: ['market-news', 'investment-tips', 'portfolio-insights', 'education']
                                            },
                                            default: ['market-news', 'investment-tips']
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Newsletter subscription successful',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse'
                            },
                            example: {
                                success: true,
                                message: 'Successfully subscribed to newsletter. Please check your email to confirm subscription.',
                                timestamp: '2024-01-20T10:30:00.000Z'
                            }
                        }
                    }
                },
                '400': { $ref: '#/components/responses/ValidationError' },
                '409': {
                    description: 'Email already subscribed',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' },
                            example: {
                                error: 'ALREADY_SUBSCRIBED',
                                message: 'This email is already subscribed to our newsletter',
                                statusCode: 409
                            }
                        }
                    }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    }
};
const stripePaths = {
    '/api/stripe/create-payment-intent': {
        post: {
            tags: ['Payments'],
            summary: 'Create payment intent',
            description: 'Create a Stripe payment intent for premium subscription or services.',
            operationId: 'createPaymentIntent',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['amount', 'currency'],
                            properties: {
                                amount: {
                                    type: 'integer',
                                    description: 'Payment amount in cents',
                                    example: 2999,
                                    minimum: 50
                                },
                                currency: {
                                    type: 'string',
                                    description: 'Payment currency',
                                    example: 'usd',
                                    default: 'usd'
                                },
                                paymentMethodTypes: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    default: ['card'],
                                    example: ['card']
                                },
                                description: {
                                    type: 'string',
                                    description: 'Payment description',
                                    example: 'Premium subscription - Monthly'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Payment intent created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            clientSecret: {
                                                type: 'string',
                                                description: 'Client secret for payment confirmation',
                                                example: 'pi_1234567890_secret_abc123'
                                            },
                                            paymentIntentId: {
                                                type: 'string',
                                                example: 'pi_1234567890'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '400': { $ref: '#/components/responses/ValidationError' },
                '401': { $ref: '#/components/responses/UnauthorizedError' },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    }
};
const adminPaths = {
    '/api/admin/users': {
        get: {
            tags: ['Admin'],
            summary: 'Get all users (Admin only)',
            description: 'Retrieve list of all users with filtering and pagination. Requires admin role.',
            operationId: 'getAllUsers',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'role',
                    in: 'query',
                    description: 'Filter users by role',
                    schema: {
                        type: 'string',
                        enum: ['user', 'premium', 'admin']
                    }
                },
                {
                    name: 'status',
                    in: 'query',
                    description: 'Filter users by account status',
                    schema: {
                        type: 'string',
                        enum: ['active', 'inactive', 'suspended']
                    }
                },
                { $ref: '#/components/parameters/PaginationLimit' },
                { $ref: '#/components/parameters/PaginationOffset' }
            ],
            responses: {
                '200': {
                    description: 'Users retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/User' }
                                    },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            total: { type: 'integer' },
                                            limit: { type: 'integer' },
                                            offset: { type: 'integer' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/UnauthorizedError' },
                '403': { $ref: '#/components/responses/ForbiddenError' },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
    }
};
const healthPaths = {
    '/api/health': {
        get: {
            tags: ['Health'],
            summary: 'API health check',
            description: 'Check API health status and system information.',
            operationId: 'healthCheck',
            security: [], // Public endpoint
            responses: {
                '200': {
                    description: 'API is healthy',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: {
                                        type: 'string',
                                        example: 'ok'
                                    },
                                    timestamp: {
                                        type: 'string',
                                        format: 'date-time',
                                        example: '2024-01-20T10:30:00.000Z'
                                    },
                                    version: {
                                        type: 'string',
                                        example: '1.0.0'
                                    },
                                    environment: {
                                        type: 'string',
                                        example: 'production'
                                    },
                                    services: {
                                        type: 'object',
                                        properties: {
                                            database: {
                                                type: 'string',
                                                enum: ['healthy', 'unhealthy', 'unavailable'],
                                                example: 'healthy'
                                            },
                                            redis: {
                                                type: 'string',
                                                enum: ['healthy', 'unhealthy', 'unavailable'],
                                                example: 'healthy'
                                            },
                                            stripe: {
                                                type: 'string',
                                                enum: ['healthy', 'unhealthy', 'unavailable'],
                                                example: 'healthy'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '503': {
                    description: 'API is unhealthy',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'error' },
                                    message: { type: 'string', example: 'Database connection failed' },
                                    timestamp: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
// ==============================================================================
// COMBINE ALL DOCUMENTATION
// ==============================================================================
exports.completeApiSpec = Object.assign(Object.assign({}, openapi_1.openApiSpec), { paths: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, auth_docs_1.default), profile_docs_1.default), dashboardPaths), gamificationPaths), newsletterPaths), stripePaths), adminPaths), healthPaths) });
exports.default = exports.completeApiSpec;
