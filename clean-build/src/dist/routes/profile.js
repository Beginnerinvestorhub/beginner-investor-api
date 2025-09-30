"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const requireAuth_1 = require("../middleware/requireAuth");
const validation_1 = require("../middleware/validation");
const validationSchemas_1 = require("../schemas/validationSchemas");
const router = express_1.default.Router();
// Rate limiting for profile endpoints
const profileRateLimit = (0, validation_1.validateRateLimit)(15 * 60 * 1000, 20, 'Too many profile requests');
const profiles = {};
// GET /api/profile - get current user's profile
router.get('/', profileRateLimit, requireAuth_1.requireAuth, (0, validation_1.validate)(validationSchemas_1.validationSchemas.profile.getUserProfile), (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User authentication required'
            });
        }
        const userProfile = profiles[userId] || {};
        // Add metadata
        const profileWithMetadata = Object.assign(Object.assign({}, userProfile), { profileComplete: Object.keys(userProfile).length > 0, lastUpdated: userProfile.updatedAt || null });
        res.json({
            success: true,
            profile: profileWithMetadata
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Profile retrieval failed',
            message: 'An error occurred while retrieving your profile'
        });
    }
});
// PUT /api/profile - update current user's profile
/**
 * Updates the current user's profile with comprehensive validation.
 * Extracts user ID from the request object, validates all input data,
 * sanitizes inputs, and updates the profile store.
 *
 * @param {Request} req - The Express request object, containing user ID and profile data in the body.
 * @param {Response} res - The Express response object, used to send back the success status or error.
 */
router.put('/', profileRateLimit, requireAuth_1.requireAuth, (0, validation_1.validate)(validationSchemas_1.validationSchemas.profile.updateProfile), (req, res) => {
    var _a, _b, _c, _d;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User authentication required'
            });
        }
        const { firstName, lastName, phone, dateOfBirth, address, preferences, 
        // Legacy fields for backward compatibility
        name, riskTolerance, goals } = req.body;
        // Sanitize text inputs
        const sanitizedData = {};
        if (firstName)
            sanitizedData.firstName = validation_1.sanitize.html(firstName);
        if (lastName)
            sanitizedData.lastName = validation_1.sanitize.html(lastName);
        if (phone)
            sanitizedData.phone = validation_1.sanitize.phone(phone);
        if (dateOfBirth)
            sanitizedData.dateOfBirth = dateOfBirth;
        // Handle address with sanitization
        if (address) {
            sanitizedData.address = {
                street: address.street ? validation_1.sanitize.html(address.street) : undefined,
                city: address.city ? validation_1.sanitize.html(address.city) : undefined,
                state: address.state ? validation_1.sanitize.html(address.state) : undefined,
                zipCode: address.zipCode,
                country: address.country ? address.country.toUpperCase() : undefined
            };
        }
        // Handle preferences
        if (preferences) {
            sanitizedData.preferences = {
                emailNotifications: (_b = preferences.emailNotifications) !== null && _b !== void 0 ? _b : true,
                smsNotifications: (_c = preferences.smsNotifications) !== null && _c !== void 0 ? _c : false,
                marketingEmails: (_d = preferences.marketingEmails) !== null && _d !== void 0 ? _d : false,
                theme: preferences.theme || 'auto',
                language: preferences.language || 'en'
            };
        }
        // Legacy field handling
        if (name) {
            const nameParts = validation_1.sanitize.html(name).split(' ');
            if (!sanitizedData.firstName)
                sanitizedData.firstName = nameParts[0];
            if (!sanitizedData.lastName && nameParts.length > 1) {
                sanitizedData.lastName = nameParts.slice(1).join(' ');
            }
        }
        if (riskTolerance)
            sanitizedData.riskTolerance = riskTolerance;
        if (goals)
            sanitizedData.goals = validation_1.sanitize.html(goals);
        // Add timestamp
        sanitizedData.updatedAt = new Date().toISOString();
        // Merge with existing profile
        profiles[userId] = Object.assign(Object.assign({}, profiles[userId]), sanitizedData);
        console.log(`Profile updated for user: ${userId} at ${sanitizedData.updatedAt}`);
        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: profiles[userId],
            updatedFields: Object.keys(sanitizedData).filter(key => key !== 'updatedAt')
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: 'Profile update failed',
            message: 'An error occurred while updating your profile'
        });
    }
});
// DELETE /api/profile - delete current user's profile
router.delete('/', profileRateLimit, requireAuth_1.requireAuth, (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User authentication required'
            });
        }
        // Check if profile exists
        if (!profiles[userId]) {
            return res.status(404).json({
                error: 'Profile not found',
                message: 'No profile data found to delete'
            });
        }
        // Delete profile
        delete profiles[userId];
        console.log(`Profile deleted for user: ${userId} at ${new Date().toISOString()}`);
        res.json({
            success: true,
            message: 'Profile deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete profile error:', error);
        res.status(500).json({
            error: 'Profile deletion failed',
            message: 'An error occurred while deleting your profile'
        });
    }
});
exports.default = router;
