"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../utils/requireAuth");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.userRouter = (0, express_1.Router)();
// Rate limiter: maximum 100 requests per 15 minutes
const userRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
exports.userRouter.get('/me', userRateLimiter, (0, requireAuth_1.requireAuth)(['user', 'admin', 'paiduser']), (req, res) => {
    // Example: Return user profile
    res.json({ user: req.user });
});
exports.userRouter.put('/me', userRateLimiter, (0, requireAuth_1.requireAuth)(['user', 'admin', 'paiduser']), (req, res) => {
    // Example: Update user profile
    res.json({ success: true });
});
