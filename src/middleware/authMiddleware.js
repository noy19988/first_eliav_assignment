"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var jsonwebtoken_1 = require("jsonwebtoken");
dotenv_1.default.config();
var authMiddleware = function (req, res, next) {
    try {
        var authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(403).json({ message: 'Access denied. No token provided.' });
            return;
        }
        var token = authHeader.split(' ')[1];
        var decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.userId };
        console.log('Decoded userId from token:', decoded.userId);
        next();
    }
    catch (err) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};
exports.default = authMiddleware;
