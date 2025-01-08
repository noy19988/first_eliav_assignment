"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(403).json({ message: 'Access denied. No token provided.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // הוסף את ה-userId ל-req.user
        req.user = { userId: decoded.userId };
        console.log('Decoded userId from token:', decoded.userId);
        next();
    }
    catch (err) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};
exports.default = authMiddleware;
