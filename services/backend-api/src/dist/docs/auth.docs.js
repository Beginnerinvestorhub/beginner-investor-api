"use strict";
/**
 * OpenAPI Documentation for Authentication Routes
 * Comprehensive API documentation with examples and validation schemas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authPaths = void 0;
exports.authPaths = {
    '/api/auth/register': {
        post: {
            tags: ['Authentication'],
            summary: 'Register a new user account',
            description: `
Register a new user account with email and password authentication.

**Features:**
- Email validation and uniqueness check
- Password strength validation (8+ chars, uppercase, lowercase, number, special char)
- Input sanitization to prevent XSS attacks
- Rate limiting: 10 requests per 15 minutes per IP
- Terms of service acceptance required

**Security:**
- All inputs are sanitized and validated
- Passwords are hashed using bcrypt
- Email verification may be required (configurable)
      `,
            operationId: 'registerUser',
            security: [], // No authentication required for registration
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/RegisterRequest'
                        },
                        examples: {
                            validRegistration: {
                                summary: 'Valid registration request',
                                value: {
                                    email: 'newuser@example.com',
                                    password: 'SecurePassword123!',
                                    firstName: 'Jane',
                                    lastName: 'Smith',
                                    acceptedTerms: true,
                                    marketingOptIn: false
                                }
                            },
                            premiumUser: {
                                summary: 'Premium user registration',
                                value: {
                                    email: 'premium@example.com',
                                    password: 'StrongPassword456!',
                                    firstName: 'John',
                                    lastName: 'Investor',
                                    acceptedTerms: true,
                                    marketingOptIn: true
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'User registered successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/SuccessResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                $ref: '#/components/schemas/AuthResponse'
                                            }
                                        }
                                    }
                                ]
                            },
                            examples: {
                                success: {
                                    summary: 'Successful registration',
                                    value: {
                                        success: true,
                                        message: 'User registered successfully',
                                        data: {
                                            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                            user: {
                                                id: 'user_123456789',
                                                email: 'newuser@example.com',
                                                role: 'user',
                                                profile: {
                                                    firstName: 'Jane',
                                                    lastName: 'Smith'
                                                },
                                                createdAt: '2024-01-20T10:30:00.000Z'
                                            },
                                            expiresIn: 86400
                                        },
                                        timestamp: '2024-01-20T10:30:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                '400': {
                    $ref: '#/components/responses/ValidationError'
                },
                '409': {
                    description: 'Email already exists',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            },
                            example: {
                                error: 'EMAIL_EXISTS',
                                message: 'An account with this email already exists',
                                statusCode: 409,
                                timestamp: '2024-01-20T10:30:00.000Z',
                                path: '/api/auth/register'
                            }
                        }
                    }
                },
                '429': {
                    $ref: '#/components/responses/RateLimitError'
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError'
                }
            }
        }
    },
    '/api/auth/login': {
        post: {
            tags: ['Authentication'],
            summary: 'Authenticate user and obtain JWT token',
            description: `
Authenticate a user with email and password credentials.

**Features:**
- Email and password validation
- JWT token generation with configurable expiration
- Optional "remember me" functionality for extended sessions
- Rate limiting: 10 requests per 15 minutes per IP
- Account lockout protection after failed attempts

**Security:**
- Passwords are verified using bcrypt
- JWT tokens include user ID and role
- Input sanitization to prevent injection attacks
- Failed login attempt tracking
      `,
            operationId: 'loginUser',
            security: [], // No authentication required for login
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/LoginRequest'
                        },
                        examples: {
                            basicLogin: {
                                summary: 'Basic login',
                                value: {
                                    email: 'user@example.com',
                                    password: 'SecurePassword123!',
                                    rememberMe: false
                                }
                            },
                            rememberMe: {
                                summary: 'Login with extended session',
                                value: {
                                    email: 'user@example.com',
                                    password: 'SecurePassword123!',
                                    rememberMe: true
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Login successful',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/SuccessResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                $ref: '#/components/schemas/AuthResponse'
                                            }
                                        }
                                    }
                                ]
                            },
                            examples: {
                                success: {
                                    summary: 'Successful login',
                                    value: {
                                        success: true,
                                        message: 'Login successful',
                                        data: {
                                            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                            user: {
                                                id: 'user_123456789',
                                                email: 'user@example.com',
                                                role: 'user',
                                                profile: {
                                                    firstName: 'John',
                                                    lastName: 'Doe',
                                                    investmentExperience: 'beginner',
                                                    riskTolerance: 'moderate'
                                                },
                                                createdAt: '2024-01-15T08:00:00.000Z',
                                                lastLogin: '2024-01-20T10:30:00.000Z'
                                            },
                                            expiresIn: 86400
                                        },
                                        timestamp: '2024-01-20T10:30:00.000Z'
                                    }
                                }
                            }
                        }
                    }
                },
                '400': {
                    $ref: '#/components/responses/ValidationError'
                },
                '401': {
                    description: 'Invalid credentials',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            },
                            example: {
                                error: 'INVALID_CREDENTIALS',
                                message: 'Invalid email or password',
                                statusCode: 401,
                                timestamp: '2024-01-20T10:30:00.000Z',
                                path: '/api/auth/login'
                            }
                        }
                    }
                },
                '423': {
                    description: 'Account locked due to too many failed attempts',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            },
                            example: {
                                error: 'ACCOUNT_LOCKED',
                                message: 'Account temporarily locked due to too many failed login attempts. Try again in 15 minutes.',
                                statusCode: 423,
                                details: {
                                    lockoutExpiresAt: '2024-01-20T10:45:00.000Z',
                                    remainingMinutes: 15
                                },
                                timestamp: '2024-01-20T10:30:00.000Z',
                                path: '/api/auth/login'
                            }
                        }
                    }
                },
                '429': {
                    $ref: '#/components/responses/RateLimitError'
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError'
                }
            }
        }
    },
    '/api/auth/logout': {
        post: {
            tags: ['Authentication'],
            summary: 'Logout user and invalidate JWT token',
            description: `
Logout the current user and invalidate their JWT token.

**Features:**
- JWT token invalidation (if token blacklisting is implemented)
- Session cleanup
- Optional device logout (logout from all devices)

**Security:**
- Requires valid JWT token
- Token is added to blacklist (if implemented)
      `,
            operationId: 'logoutUser',
            security: [{ BearerAuth: [] }],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                logoutAllDevices: {
                                    type: 'boolean',
                                    description: 'Logout from all devices',
                                    default: false
                                }
                            }
                        },
                        examples: {
                            singleDevice: {
                                summary: 'Logout current device only',
                                value: {
                                    logoutAllDevices: false
                                }
                            },
                            allDevices: {
                                summary: 'Logout from all devices',
                                value: {
                                    logoutAllDevices: true
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Logout successful',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse'
                            },
                            example: {
                                success: true,
                                message: 'Logout successful',
                                timestamp: '2024-01-20T10:30:00.000Z'
                            }
                        }
                    }
                },
                '401': {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError'
                }
            }
        }
    },
    '/api/auth/refresh': {
        post: {
            tags: ['Authentication'],
            summary: 'Refresh JWT token',
            description: `
Refresh an expired or near-expired JWT token.

**Features:**
- Token refresh without re-authentication
- Extended session management
- Automatic token rotation

**Security:**
- Requires valid refresh token
- Old tokens are invalidated
- Rate limiting applies
      `,
            operationId: 'refreshToken',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['refreshToken'],
                            properties: {
                                refreshToken: {
                                    type: 'string',
                                    description: 'Valid refresh token',
                                    example: 'refresh_token_abc123...'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Token refreshed successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/SuccessResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    token: {
                                                        type: 'string',
                                                        description: 'New JWT access token'
                                                    },
                                                    refreshToken: {
                                                        type: 'string',
                                                        description: 'New refresh token'
                                                    },
                                                    expiresIn: {
                                                        type: 'integer',
                                                        description: 'Token expiration time in seconds'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': {
                    description: 'Invalid or expired refresh token',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            },
                            example: {
                                error: 'INVALID_REFRESH_TOKEN',
                                message: 'Invalid or expired refresh token',
                                statusCode: 401,
                                timestamp: '2024-01-20T10:30:00.000Z',
                                path: '/api/auth/refresh'
                            }
                        }
                    }
                },
                '429': {
                    $ref: '#/components/responses/RateLimitError'
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError'
                }
            }
        }
    },
    '/api/auth/forgot-password': {
        post: {
            tags: ['Authentication'],
            summary: 'Request password reset',
            description: `
Request a password reset email for a user account.

**Features:**
- Email validation
- Password reset token generation
- Email delivery with reset link
- Rate limiting to prevent abuse

**Security:**
- Reset tokens expire after 1 hour
- Tokens are single-use only
- Email validation required
      `,
            operationId: 'forgotPassword',
            security: [], // No authentication required
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
                                    description: 'User email address',
                                    example: 'user@example.com'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Password reset email sent (always returns success for security)',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse'
                            },
                            example: {
                                success: true,
                                message: 'If an account with that email exists, a password reset link has been sent.',
                                timestamp: '2024-01-20T10:30:00.000Z'
                            }
                        }
                    }
                },
                '400': {
                    $ref: '#/components/responses/ValidationError'
                },
                '429': {
                    $ref: '#/components/responses/RateLimitError'
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError'
                }
            }
        }
    },
    '/api/auth/reset-password': {
        post: {
            tags: ['Authentication'],
            summary: 'Reset password with token',
            description: `
Reset user password using a valid reset token.

**Features:**
- Token validation and expiration check
- Password strength validation
- Automatic token invalidation after use
- Optional automatic login after reset

**Security:**
- Reset tokens are single-use and expire after 1 hour
- New password must meet strength requirements
- All existing sessions are invalidated
      `,
            operationId: 'resetPassword',
            security: [], // No authentication required
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['token', 'newPassword'],
                            properties: {
                                token: {
                                    type: 'string',
                                    description: 'Password reset token from email',
                                    example: 'reset_token_abc123...'
                                },
                                newPassword: {
                                    type: 'string',
                                    minLength: 8,
                                    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
                                    description: 'New password meeting strength requirements',
                                    example: 'NewSecurePassword123!'
                                },
                                autoLogin: {
                                    type: 'boolean',
                                    description: 'Automatically log in user after password reset',
                                    default: false
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Password reset successful',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/SuccessResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    autoLogin: {
                                                        type: 'boolean',
                                                        description: 'Whether user was automatically logged in'
                                                    },
                                                    token: {
                                                        type: 'string',
                                                        description: 'JWT token (if autoLogin is true)'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '400': {
                    description: 'Invalid or expired reset token',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            },
                            example: {
                                error: 'INVALID_RESET_TOKEN',
                                message: 'Invalid or expired password reset token',
                                statusCode: 400,
                                timestamp: '2024-01-20T10:30:00.000Z',
                                path: '/api/auth/reset-password'
                            }
                        }
                    }
                },
                '429': {
                    $ref: '#/components/responses/RateLimitError'
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError'
                }
            }
        }
    },
    '/api/auth/verify-email': {
        post: {
            tags: ['Authentication'],
            summary: 'Verify email address',
            description: `
Verify user email address using verification token.

**Features:**
- Email verification token validation
- Account activation
- Automatic login after verification (optional)

**Security:**
- Verification tokens expire after 24 hours
- Tokens are single-use only
      `,
            operationId: 'verifyEmail',
            security: [], // No authentication required
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['token'],
                            properties: {
                                token: {
                                    type: 'string',
                                    description: 'Email verification token',
                                    example: 'verify_token_abc123...'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Email verified successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse'
                            },
                            example: {
                                success: true,
                                message: 'Email verified successfully',
                                timestamp: '2024-01-20T10:30:00.000Z'
                            }
                        }
                    }
                },
                '400': {
                    description: 'Invalid or expired verification token',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            },
                            example: {
                                error: 'INVALID_VERIFICATION_TOKEN',
                                message: 'Invalid or expired email verification token',
                                statusCode: 400,
                                timestamp: '2024-01-20T10:30:00.000Z',
                                path: '/api/auth/verify-email'
                            }
                        }
                    }
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError'
                }
            }
        }
    }
};
exports.default = exports.authPaths;
