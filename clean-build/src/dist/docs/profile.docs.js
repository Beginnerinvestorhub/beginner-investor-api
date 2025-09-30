"use strict";
/**
 * OpenAPI Documentation for Profile Routes
 * User profile management and settings endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilePaths = void 0;
exports.profilePaths = {
    '/api/profile': {
        get: {
            tags: ['User Management'],
            summary: 'Get current user profile',
            description: `
Retrieve the complete profile information for the authenticated user.

**Features:**
- Complete user profile data
- Investment preferences and goals
- Risk tolerance settings
- Account status and verification info

**Security:**
- Requires valid JWT token
- Users can only access their own profile
      `,
            operationId: 'getUserProfile',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'Profile retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/SuccessResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                $ref: '#/components/schemas/UserProfile'
                                            }
                                        }
                                    }
                                ]
                            },
                            examples: {
                                completeProfile: {
                                    summary: 'Complete user profile',
                                    value: {
                                        success: true,
                                        message: 'Profile retrieved successfully',
                                        data: {
                                            firstName: 'John',
                                            lastName: 'Doe',
                                            dateOfBirth: '1990-01-15',
                                            phoneNumber: '+1234567890',
                                            address: {
                                                street: '123 Main Street',
                                                city: 'New York',
                                                state: 'NY',
                                                zipCode: '10001',
                                                country: 'United States'
                                            },
                                            investmentExperience: 'beginner',
                                            riskTolerance: 'moderate',
                                            investmentGoals: ['retirement', 'wealth_building']
                                        },
                                        timestamp: '2024-01-20T10:30:00.000Z'
                                    }
                                },
                                incompleteProfile: {
                                    summary: 'Incomplete user profile',
                                    value: {
                                        success: true,
                                        message: 'Profile retrieved successfully',
                                        data: {
                                            firstName: 'Jane',
                                            lastName: 'Smith',
                                            investmentExperience: null,
                                            riskTolerance: null,
                                            investmentGoals: []
                                        },
                                        timestamp: '2024-01-20T10:30:00.000Z'
                                    }
                                }
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
        },
        put: {
            tags: ['User Management'],
            summary: 'Update user profile',
            description: `
Update the user's profile information with comprehensive validation.

**Features:**
- Partial or complete profile updates
- Input validation and sanitization
- Investment preference tracking
- Address validation
- Phone number format validation

**Security:**
- Requires valid JWT token
- All inputs are sanitized to prevent XSS
- Rate limiting: 20 requests per 15 minutes
      `,
            operationId: 'updateUserProfile',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UserProfile'
                        },
                        examples: {
                            basicUpdate: {
                                summary: 'Basic profile update',
                                value: {
                                    firstName: 'John',
                                    lastName: 'Doe',
                                    phoneNumber: '+1234567890',
                                    investmentExperience: 'intermediate',
                                    riskTolerance: 'moderate'
                                }
                            },
                            completeUpdate: {
                                summary: 'Complete profile update',
                                value: {
                                    firstName: 'John',
                                    lastName: 'Doe',
                                    dateOfBirth: '1990-01-15',
                                    phoneNumber: '+1234567890',
                                    address: {
                                        street: '123 Main Street',
                                        city: 'New York',
                                        state: 'NY',
                                        zipCode: '10001',
                                        country: 'United States'
                                    },
                                    investmentExperience: 'intermediate',
                                    riskTolerance: 'moderate',
                                    investmentGoals: ['retirement', 'wealth_building', 'income']
                                }
                            },
                            partialUpdate: {
                                summary: 'Partial profile update',
                                value: {
                                    riskTolerance: 'aggressive',
                                    investmentGoals: ['wealth_building']
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Profile updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/SuccessResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                $ref: '#/components/schemas/UserProfile'
                                            }
                                        }
                                    }
                                ]
                            },
                            example: {
                                success: true,
                                message: 'Profile updated successfully',
                                data: {
                                    firstName: 'John',
                                    lastName: 'Doe',
                                    dateOfBirth: '1990-01-15',
                                    phoneNumber: '+1234567890',
                                    address: {
                                        street: '123 Main Street',
                                        city: 'New York',
                                        state: 'NY',
                                        zipCode: '10001',
                                        country: 'United States'
                                    },
                                    investmentExperience: 'intermediate',
                                    riskTolerance: 'moderate',
                                    investmentGoals: ['retirement', 'wealth_building', 'income']
                                },
                                timestamp: '2024-01-20T10:30:00.000Z'
                            }
                        }
                    }
                },
                '400': {
                    $ref: '#/components/responses/ValidationError'
                },
                '401': {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                '429': {
                    $ref: '#/components/responses/RateLimitError'
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError'
                }
            }
        },
        delete: {
            tags: ['User Management'],
            summary: 'Delete user account',
            description: `
Permanently delete the user's account and all associated data.

**Features:**
- Complete account deletion
- Data anonymization where required by law
- Confirmation required
- Immediate logout from all devices

**Security:**
- Requires valid JWT token
- Password confirmation required
- Irreversible action with confirmation
- All user data is permanently deleted
      `,
            operationId: 'deleteUserAccount',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['password', 'confirmation'],
                            properties: {
                                password: {
                                    type: 'string',
                                    description: 'Current account password for confirmation',
                                    example: 'CurrentPassword123!'
                                },
                                confirmation: {
                                    type: 'string',
                                    enum: ['DELETE_MY_ACCOUNT'],
                                    description: 'Must be exactly "DELETE_MY_ACCOUNT" to confirm deletion',
                                    example: 'DELETE_MY_ACCOUNT'
                                },
                                reason: {
                                    type: 'string',
                                    description: 'Optional reason for account deletion',
                                    maxLength: 500,
                                    example: 'No longer need the service'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Account deleted successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse'
                            },
                            example: {
                                success: true,
                                message: 'Account deleted successfully. We\'re sorry to see you go!',
                                timestamp: '2024-01-20T10:30:00.000Z'
                            }
                        }
                    }
                },
                '400': {
                    description: 'Invalid password or confirmation',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            },
                            example: {
                                error: 'INVALID_CONFIRMATION',
                                message: 'Invalid password or confirmation text',
                                statusCode: 400,
                                details: {
                                    password: 'Current password is incorrect',
                                    confirmation: 'Must be exactly "DELETE_MY_ACCOUNT"'
                                },
                                timestamp: '2024-01-20T10:30:00.000Z',
                                path: '/api/profile'
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
    '/api/profile/preferences': {
        get: {
            tags: ['User Management'],
            summary: 'Get user preferences',
            description: `
Retrieve user preferences and settings.

**Features:**
- Investment preferences
- Notification settings
- Privacy settings
- Display preferences
      `,
            operationId: 'getUserPreferences',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'Preferences retrieved successfully',
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
                                                    notifications: {
                                                        type: 'object',
                                                        properties: {
                                                            email: {
                                                                type: 'boolean',
                                                                example: true
                                                            },
                                                            push: {
                                                                type: 'boolean',
                                                                example: false
                                                            },
                                                            sms: {
                                                                type: 'boolean',
                                                                example: false
                                                            },
                                                            marketingEmails: {
                                                                type: 'boolean',
                                                                example: true
                                                            }
                                                        }
                                                    },
                                                    privacy: {
                                                        type: 'object',
                                                        properties: {
                                                            profileVisibility: {
                                                                type: 'string',
                                                                enum: ['public', 'private', 'friends'],
                                                                example: 'private'
                                                            },
                                                            sharePortfolio: {
                                                                type: 'boolean',
                                                                example: false
                                                            },
                                                            allowAnalytics: {
                                                                type: 'boolean',
                                                                example: true
                                                            }
                                                        }
                                                    },
                                                    display: {
                                                        type: 'object',
                                                        properties: {
                                                            theme: {
                                                                type: 'string',
                                                                enum: ['light', 'dark', 'auto'],
                                                                example: 'auto'
                                                            },
                                                            currency: {
                                                                type: 'string',
                                                                example: 'USD'
                                                            },
                                                            dateFormat: {
                                                                type: 'string',
                                                                example: 'MM/DD/YYYY'
                                                            }
                                                        }
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
                    $ref: '#/components/responses/UnauthorizedError'
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError'
                }
            }
        },
        put: {
            tags: ['User Management'],
            summary: 'Update user preferences',
            description: `
Update user preferences and settings.

**Features:**
- Notification preferences
- Privacy settings
- Display preferences
- Partial updates supported
      `,
            operationId: 'updateUserPreferences',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                notifications: {
                                    type: 'object',
                                    properties: {
                                        email: { type: 'boolean' },
                                        push: { type: 'boolean' },
                                        sms: { type: 'boolean' },
                                        marketingEmails: { type: 'boolean' }
                                    }
                                },
                                privacy: {
                                    type: 'object',
                                    properties: {
                                        profileVisibility: {
                                            type: 'string',
                                            enum: ['public', 'private', 'friends']
                                        },
                                        sharePortfolio: { type: 'boolean' },
                                        allowAnalytics: { type: 'boolean' }
                                    }
                                },
                                display: {
                                    type: 'object',
                                    properties: {
                                        theme: {
                                            type: 'string',
                                            enum: ['light', 'dark', 'auto']
                                        },
                                        currency: { type: 'string' },
                                        dateFormat: { type: 'string' }
                                    }
                                }
                            }
                        },
                        examples: {
                            notificationUpdate: {
                                summary: 'Update notification preferences',
                                value: {
                                    notifications: {
                                        email: true,
                                        push: false,
                                        sms: false,
                                        marketingEmails: false
                                    }
                                }
                            },
                            privacyUpdate: {
                                summary: 'Update privacy settings',
                                value: {
                                    privacy: {
                                        profileVisibility: 'private',
                                        sharePortfolio: false,
                                        allowAnalytics: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Preferences updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse'
                            },
                            example: {
                                success: true,
                                message: 'Preferences updated successfully',
                                timestamp: '2024-01-20T10:30:00.000Z'
                            }
                        }
                    }
                },
                '400': {
                    $ref: '#/components/responses/ValidationError'
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
    '/api/profile/change-password': {
        post: {
            tags: ['User Management'],
            summary: 'Change user password',
            description: `
Change the user's account password with current password verification.

**Features:**
- Current password verification
- New password strength validation
- Automatic logout from other devices (optional)
- Password history check (prevents reuse)

**Security:**
- Requires current password confirmation
- New password must meet strength requirements
- All existing sessions can be invalidated
- Rate limiting: 5 requests per 15 minutes
      `,
            operationId: 'changePassword',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['currentPassword', 'newPassword'],
                            properties: {
                                currentPassword: {
                                    type: 'string',
                                    description: 'Current account password',
                                    example: 'CurrentPassword123!'
                                },
                                newPassword: {
                                    type: 'string',
                                    minLength: 8,
                                    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
                                    description: 'New password meeting strength requirements',
                                    example: 'NewSecurePassword456!'
                                },
                                logoutOtherDevices: {
                                    type: 'boolean',
                                    description: 'Logout from all other devices after password change',
                                    default: true
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Password changed successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SuccessResponse'
                            },
                            example: {
                                success: true,
                                message: 'Password changed successfully. You have been logged out from other devices.',
                                timestamp: '2024-01-20T10:30:00.000Z'
                            }
                        }
                    }
                },
                '400': {
                    description: 'Invalid current password or weak new password',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            },
                            example: {
                                error: 'INVALID_PASSWORD',
                                message: 'Current password is incorrect or new password is too weak',
                                statusCode: 400,
                                details: {
                                    currentPassword: 'Current password is incorrect',
                                    newPassword: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character'
                                },
                                timestamp: '2024-01-20T10:30:00.000Z',
                                path: '/api/profile/change-password'
                            }
                        }
                    }
                },
                '401': {
                    $ref: '#/components/responses/UnauthorizedError'
                },
                '429': {
                    $ref: '#/components/responses/RateLimitError'
                },
                '500': {
                    $ref: '#/components/responses/InternalServerError'
                }
            }
        }
    }
};
exports.default = exports.profilePaths;
