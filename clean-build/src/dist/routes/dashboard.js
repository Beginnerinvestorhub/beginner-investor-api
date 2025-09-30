"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../utils/requireAuth");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.dashboardRouter = (0, express_1.Router)();
// Configure rate limiter: maximum 100 requests per 15 minutes
const dashboardRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply rate limiter
exports.dashboardRouter.use(dashboardRateLimiter);
exports.dashboardRouter.get('/', (0, requireAuth_1.requireAuth)(['user', 'paiduser']), (req, res) => {
    // Example: Return dashboard data
    res.json({ data: 'dashboard data' });
});
