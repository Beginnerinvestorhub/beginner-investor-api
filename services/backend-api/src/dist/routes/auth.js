"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validation_1 = require("../middleware/validation");
const validationSchemas_1 = require("../schemas/validationSchemas");
exports.authRouter = (0, express_1.Router)();
// Rate limiting for auth endpoints
const authRateLimit = (0, validation_1.validateRateLimit)(15 * 60 * 1000, 5, 'Too many authentication attempts');
const generalAuthRateLimit = (0, validation_1.validateRateLimit)(15 * 60 * 1000, 10);
// Login endpoint with comprehensive validation
exports.authRouter.post('/login', authRateLimit, (0, validation_1.validate)(validationSchemas_1.validationSchemas.auth.login), async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        // Sanitize email input
        const sanitizedEmail = validation_1.sanitize.email(email);
        // TODO: Use Firebase Auth REST API or Admin SDK to verify credentials
        // For demo, accept any credentials with proper validation
        // Simulate user lookup and role assignment
        const user = {
            uid: 'demo_' + Date.now(),
            email: sanitizedEmail,
            role: 'user',
            lastLogin: new Date().toISOString()
        };
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                error: 'Server configuration error',
                message: 'Authentication service temporarily unavailable'
            });
        }
        const tokenExpiry = rememberMe ? '30d' : '1h';
        const token = jsonwebtoken_1.default.sign({ uid: user.uid, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: tokenExpiry });
        // Log successful login (in production, use proper logging service)
        console.log(`Successful login: ${sanitizedEmail} at ${new Date().toISOString()}`);
        res.json({
            token,
            user: {
                uid: user.uid,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            },
            expiresIn: tokenExpiry
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Authentication failed',
            message: 'An error occurred during login. Please try again.'
        });
    }
});
// User registration endpoint
exports.authRouter.post('/register', generalAuthRateLimit, (0, validation_1.validate)(validationSchemas_1.validationSchemas.auth.register), async (req, res) => {
    try {
        const { email, password, firstName, lastName, acceptTerms, marketingOptIn } = req.body;
        // Sanitize inputs
        const sanitizedEmail = validation_1.sanitize.email(email);
        const sanitizedFirstName = validation_1.sanitize.html(firstName);
        const sanitizedLastName = validation_1.sanitize.html(lastName);
        // Check if user already exists (in production, check database)
        // For demo purposes, simulate user creation
        const newUser = {
            uid: 'user_' + Date.now(),
            email: sanitizedEmail,
            firstName: sanitizedFirstName,
            lastName: sanitizedLastName,
            role: 'user',
            marketingOptIn,
            createdAt: new Date().toISOString(),
            emailVerified: false
        };
        // In production: Create user in Firebase Auth and database
        // await admin.auth().createUser({ email: sanitizedEmail, password });
        console.log(`New user registered: ${sanitizedEmail} at ${new Date().toISOString()}`);
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                uid: newUser.uid,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                createdAt: newUser.createdAt
            },
            nextStep: 'Please check your email to verify your account'
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: 'An error occurred during registration. Please try again.'
        });
    }
});
// Forgot password endpoint
exports.authRouter.post('/forgot-password', generalAuthRateLimit, (0, validation_1.validate)(validationSchemas_1.validationSchemas.auth.forgotPassword), async (req, res) => {
    try {
        const { email } = req.body;
        const sanitizedEmail = validation_1.sanitize.email(email);
        // In production: Generate password reset token and send email
        // For demo: Always return success (don't reveal if email exists)
        console.log(`Password reset requested for: ${sanitizedEmail}`);
        res.json({
            message: 'If an account with that email exists, a password reset link has been sent.',
            email: sanitizedEmail
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            error: 'Password reset failed',
            message: 'An error occurred. Please try again.'
        });
    }
});
// Reset password endpoint
exports.authRouter.post('/reset-password', generalAuthRateLimit, (0, validation_1.validate)(validationSchemas_1.validationSchemas.auth.resetPassword), async (req, res) => {
    try {
        const { token, password } = req.body;
        // In production: Verify token and update password
        // For demo: Accept any token
        console.log(`Password reset completed for token: ${token.substring(0, 8)}...`);
        res.json({
            message: 'Password reset successfully',
            nextStep: 'You can now log in with your new password'
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            error: 'Password reset failed',
            message: 'Invalid or expired reset token'
        });
    }
});
// OAuth login endpoint
exports.authRouter.post('/oauth', generalAuthRateLimit, (req, res) => {
    // TODO: Implement OAuth flow (Google, Facebook, etc.)
    res.status(501).json({
        error: 'OAuth not implemented',
        message: 'OAuth authentication is not yet available',
        supportedMethods: ['email/password']
    });
});
