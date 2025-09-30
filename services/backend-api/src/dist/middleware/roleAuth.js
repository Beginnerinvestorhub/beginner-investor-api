"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient role' });
        }
        next();
    };
}
exports.requireRole = requireRole;
