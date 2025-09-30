"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../utils/requireAuth");
const roleAuth_1 = require("../middleware/roleAuth");
exports.adminRouter = (0, express_1.Router)();
// In-memory users for demo; replace with DB in production
const users = [
    { uid: '1', email: 'admin@example.com', role: 'admin' },
    { uid: '2', email: 'user@example.com', role: 'user' },
    { uid: '3', email: 'paid@example.com', role: 'paiduser' },
];
// Require both authentication and 'admin' role
exports.adminRouter.get('/', (0, requireAuth_1.requireAuth)(['admin']), (0, roleAuth_1.requireRole)(['admin']), (req, res) => {
    res.json({ data: 'admin dashboard' });
});
// GET /api/admin/users - list all users
exports.adminRouter.get('/users', (0, requireAuth_1.requireAuth)(['admin']), (0, roleAuth_1.requireRole)(['admin']), (req, res) => {
    res.json({ users });
});
// POST /api/admin/role - update a user's role
exports.adminRouter.post('/role', (0, requireAuth_1.requireAuth)(['admin']), (0, roleAuth_1.requireRole)(['admin']), (req, res) => {
    const { uid, role } = req.body;
    const user = users.find(u => u.uid === uid);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    user.role = role;
    res.json({ success: true, user });
});
