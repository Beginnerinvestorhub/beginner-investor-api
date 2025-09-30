"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(roles = []) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ error: 'Missing token' });
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // @ts-ignore
            req.user = decoded;
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            next();
        }
        catch (e) {
            // Only handle JWT errors here. Log unexpected errors for debugging.
            if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Invalid token' });
            }
            // Log unexpected errors and rethrow for global error handler
            console.error('Unexpected error in requireAuth:', e);
            throw e;
        }
    };
}
exports.requireAuth = requireAuth;
