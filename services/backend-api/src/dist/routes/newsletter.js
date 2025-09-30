"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// POST /api/newsletter
router.post('/', async (req, res) => {
    const { email } = req.body;
    // This is safer and less prone to ReDoS (still not RFC compliant)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address.' });
    }
    // TODO: Integrate with real newsletter provider (Mailchimp, ConvertKit, etc.)
    // For now, just log and simulate success
    const sanitizedEmail = email.replace(/[\n\r]/g, '');
    console.log('Newsletter signup:', sanitizedEmail);
    return res.json({ success: true });
});
exports.default = router;
