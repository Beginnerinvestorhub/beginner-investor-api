"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchemas = exports.searchSchemas = exports.uploadSchemas = exports.gamificationSchemas = exports.adminSchemas = exports.newsletterSchemas = exports.simulationSchemas = exports.portfolioSchemas = exports.riskAssessmentSchemas = exports.profileSchemas = exports.authSchemas = void 0;
const joi_1 = __importDefault(require("joi"));
// Common validation patterns
const commonPatterns = {
    email: joi_1.default.string().email().lowercase().trim().max(255),
    password: joi_1.default.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).message('Password must contain at least 8 characters with uppercase, lowercase, number, and special character'),
    name: joi_1.default.string().trim().min(1).max(100).pattern(/^[a-zA-Z\s'-]+$/),
    phone: joi_1.default.string().pattern(/^\+?[\d\s\-\(\)]+$/).min(10).max(20),
    url: joi_1.default.string().uri({ scheme: ['http', 'https'] }),
    mongoId: joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/),
    uuid: joi_1.default.string().uuid(),
    positiveNumber: joi_1.default.number().positive(),
    percentage: joi_1.default.number().min(0).max(100),
    currency: joi_1.default.number().precision(2).positive(),
    date: joi_1.default.date().iso(),
    riskTolerance: joi_1.default.string().valid('conservative', 'moderate', 'aggressive'),
    investmentGoal: joi_1.default.string().valid('retirement', 'education', 'house', 'general', 'emergency'),
};
// Authentication schemas
exports.authSchemas = {
    login: {
        body: joi_1.default.object({
            email: commonPatterns.email.required(),
            password: joi_1.default.string().required().min(1).max(128),
            rememberMe: joi_1.default.boolean().default(false)
        })
    },
    register: {
        body: joi_1.default.object({
            email: commonPatterns.email.required(),
            password: commonPatterns.password.required(),
            confirmPassword: joi_1.default.string().required().valid(joi_1.default.ref('password')),
            firstName: commonPatterns.name.required(),
            lastName: commonPatterns.name.required(),
            acceptTerms: joi_1.default.boolean().valid(true).required(),
            marketingOptIn: joi_1.default.boolean().default(false)
        })
    },
    forgotPassword: {
        body: joi_1.default.object({
            email: commonPatterns.email.required()
        })
    },
    resetPassword: {
        body: joi_1.default.object({
            token: joi_1.default.string().required(),
            password: commonPatterns.password.required(),
            confirmPassword: joi_1.default.string().required().valid(joi_1.default.ref('password'))
        })
    },
    changePassword: {
        body: joi_1.default.object({
            currentPassword: joi_1.default.string().required(),
            newPassword: commonPatterns.password.required(),
            confirmPassword: joi_1.default.string().required().valid(joi_1.default.ref('newPassword'))
        })
    }
};
// User profile schemas
exports.profileSchemas = {
    updateProfile: {
        body: joi_1.default.object({
            firstName: commonPatterns.name.optional(),
            lastName: commonPatterns.name.optional(),
            phone: commonPatterns.phone.optional(),
            dateOfBirth: commonPatterns.date.optional(),
            address: joi_1.default.object({
                street: joi_1.default.string().max(255),
                city: joi_1.default.string().max(100),
                state: joi_1.default.string().max(50),
                zipCode: joi_1.default.string().pattern(/^\d{5}(-\d{4})?$/),
                country: joi_1.default.string().length(2).uppercase()
            }).optional(),
            preferences: joi_1.default.object({
                emailNotifications: joi_1.default.boolean().default(true),
                smsNotifications: joi_1.default.boolean().default(false),
                marketingEmails: joi_1.default.boolean().default(false),
                theme: joi_1.default.string().valid('light', 'dark', 'auto').default('auto'),
                language: joi_1.default.string().valid('en', 'es', 'fr').default('en')
            }).optional()
        })
    },
    getUserProfile: {
        params: joi_1.default.object({
            userId: commonPatterns.uuid.optional()
        })
    }
};
// Risk assessment schemas
exports.riskAssessmentSchemas = {
    submitAssessment: {
        body: joi_1.default.object({
            age: joi_1.default.number().integer().min(18).max(120).required(),
            income: commonPatterns.currency.required(),
            investmentExperience: joi_1.default.string().valid('none', 'beginner', 'intermediate', 'advanced').required(),
            riskTolerance: commonPatterns.riskTolerance.required(),
            investmentGoals: joi_1.default.array().items(commonPatterns.investmentGoal).min(1).max(5).required(),
            investmentHorizon: joi_1.default.number().integer().min(1).max(50).required(), // years
            liquidityNeeds: joi_1.default.string().valid('high', 'medium', 'low').required(),
            financialSituation: joi_1.default.object({
                monthlyIncome: commonPatterns.currency.required(),
                monthlyExpenses: commonPatterns.currency.required(),
                emergencyFund: commonPatterns.currency.required(),
                existingInvestments: commonPatterns.currency.default(0),
                debt: commonPatterns.currency.default(0)
            }).required(),
            questionnaire: joi_1.default.array().items(joi_1.default.object({
                questionId: joi_1.default.string().required(),
                answer: joi_1.default.alternatives().try(joi_1.default.string(), joi_1.default.number(), joi_1.default.boolean(), joi_1.default.array().items(joi_1.default.string())).required()
            })).min(1).required()
        })
    },
    getAssessment: {
        params: joi_1.default.object({
            assessmentId: commonPatterns.uuid.required()
        })
    }
};
// Portfolio schemas
exports.portfolioSchemas = {
    createPortfolio: {
        body: joi_1.default.object({
            name: joi_1.default.string().trim().min(1).max(100).required(),
            description: joi_1.default.string().max(500).optional(),
            riskProfile: commonPatterns.riskTolerance.required(),
            initialInvestment: commonPatterns.currency.required(),
            allocations: joi_1.default.array().items(joi_1.default.object({
                assetType: joi_1.default.string().valid('stocks', 'bonds', 'etf', 'mutual_fund', 'crypto', 'real_estate').required(),
                symbol: joi_1.default.string().uppercase().max(10).required(),
                allocation: commonPatterns.percentage.required(),
                amount: commonPatterns.currency.required()
            })).min(1).required()
        }).custom((value, helpers) => {
            // Validate that allocations sum to 100%
            const totalAllocation = value.allocations.reduce((sum, item) => sum + item.allocation, 0);
            if (Math.abs(totalAllocation - 100) > 0.01) {
                return helpers.error('any.custom', { message: 'Portfolio allocations must sum to 100%' });
            }
            return value;
        })
    },
    updatePortfolio: {
        params: joi_1.default.object({
            portfolioId: commonPatterns.uuid.required()
        }),
        body: joi_1.default.object({
            name: joi_1.default.string().trim().min(1).max(100).optional(),
            description: joi_1.default.string().max(500).optional(),
            allocations: joi_1.default.array().items(joi_1.default.object({
                assetType: joi_1.default.string().valid('stocks', 'bonds', 'etf', 'mutual_fund', 'crypto', 'real_estate').required(),
                symbol: joi_1.default.string().uppercase().max(10).required(),
                allocation: commonPatterns.percentage.required(),
                amount: commonPatterns.currency.required()
            })).min(1).optional()
        })
    },
    getPortfolio: {
        params: joi_1.default.object({
            portfolioId: commonPatterns.uuid.required()
        })
    },
    deletePortfolio: {
        params: joi_1.default.object({
            portfolioId: commonPatterns.uuid.required()
        })
    }
};
// Investment simulation schemas
exports.simulationSchemas = {
    runSimulation: {
        body: joi_1.default.object({
            portfolioId: commonPatterns.uuid.optional(),
            customPortfolio: joi_1.default.object({
                allocations: joi_1.default.array().items(joi_1.default.object({
                    assetType: joi_1.default.string().required(),
                    allocation: commonPatterns.percentage.required()
                })).required()
            }).optional(),
            simulationParameters: joi_1.default.object({
                timeHorizon: joi_1.default.number().integer().min(1).max(50).required(), // years
                initialInvestment: commonPatterns.currency.required(),
                monthlyContribution: commonPatterns.currency.default(0),
                inflationRate: joi_1.default.number().min(0).max(20).default(3), // percentage
                numberOfSimulations: joi_1.default.number().integer().min(100).max(10000).default(1000)
            }).required()
        }).xor('portfolioId', 'customPortfolio') // Either portfolioId OR customPortfolio, not both
    },
    getSimulation: {
        params: joi_1.default.object({
            simulationId: commonPatterns.uuid.required()
        })
    }
};
// Newsletter schemas
exports.newsletterSchemas = {
    subscribe: {
        body: joi_1.default.object({
            email: commonPatterns.email.required(),
            firstName: commonPatterns.name.optional(),
            interests: joi_1.default.array().items(joi_1.default.string().valid('stocks', 'bonds', 'crypto', 'real_estate', 'retirement', 'tax_planning')).max(10).optional(),
            frequency: joi_1.default.string().valid('daily', 'weekly', 'monthly').default('weekly')
        })
    },
    unsubscribe: {
        body: joi_1.default.object({
            email: commonPatterns.email.required(),
            token: joi_1.default.string().optional()
        })
    }
};
// Admin schemas
exports.adminSchemas = {
    getUserList: {
        query: joi_1.default.object({
            page: joi_1.default.number().integer().min(1).default(1),
            limit: joi_1.default.number().integer().min(1).max(100).default(20),
            search: joi_1.default.string().max(100).optional(),
            role: joi_1.default.string().valid('user', 'admin', 'paiduser').optional(),
            sortBy: joi_1.default.string().valid('createdAt', 'email', 'lastName').default('createdAt'),
            sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc')
        })
    },
    updateUserRole: {
        params: joi_1.default.object({
            userId: commonPatterns.uuid.required()
        }),
        body: joi_1.default.object({
            role: joi_1.default.string().valid('user', 'admin', 'paiduser').required(),
            reason: joi_1.default.string().max(500).optional()
        })
    },
    deleteUser: {
        params: joi_1.default.object({
            userId: commonPatterns.uuid.required()
        }),
        body: joi_1.default.object({
            reason: joi_1.default.string().max(500).required(),
            confirmDelete: joi_1.default.boolean().valid(true).required()
        })
    }
};
// Gamification schemas
exports.gamificationSchemas = {
    submitChallenge: {
        body: joi_1.default.object({
            challengeId: commonPatterns.uuid.required(),
            answer: joi_1.default.alternatives().try(joi_1.default.string().max(1000), joi_1.default.number(), joi_1.default.boolean(), joi_1.default.array().items(joi_1.default.string())).required(),
            timeSpent: joi_1.default.number().integer().min(0).max(7200).optional() // seconds, max 2 hours
        })
    },
    getLeaderboard: {
        query: joi_1.default.object({
            period: joi_1.default.string().valid('daily', 'weekly', 'monthly', 'all-time').default('weekly'),
            category: joi_1.default.string().valid('points', 'challenges', 'streak').default('points'),
            limit: joi_1.default.number().integer().min(1).max(100).default(10)
        })
    }
};
// File upload schemas
exports.uploadSchemas = {
    uploadAvatar: {
        // File validation will be handled by multer middleware
        body: joi_1.default.object({
            description: joi_1.default.string().max(255).optional()
        })
    }
};
// Search and filtering schemas
exports.searchSchemas = {
    searchAssets: {
        query: joi_1.default.object({
            q: joi_1.default.string().min(1).max(100).required(),
            type: joi_1.default.string().valid('stocks', 'etf', 'mutual_fund', 'crypto').optional(),
            limit: joi_1.default.number().integer().min(1).max(50).default(10),
            exchange: joi_1.default.string().max(10).optional()
        })
    }
};
// Export all schemas
exports.validationSchemas = {
    auth: exports.authSchemas,
    profile: exports.profileSchemas,
    riskAssessment: exports.riskAssessmentSchemas,
    portfolio: exports.portfolioSchemas,
    simulation: exports.simulationSchemas,
    newsletter: exports.newsletterSchemas,
    admin: exports.adminSchemas,
    gamification: exports.gamificationSchemas,
    upload: exports.uploadSchemas,
    search: exports.searchSchemas
};
