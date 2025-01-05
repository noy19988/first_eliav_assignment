require('dotenv').config();
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // קריאת ה-Authorization Header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Missing or invalid Authorization header:', authHeader);
            return res.status(403).json({ message: 'Access denied. No token provided.' });
        }

        // הוצאת הטוקן מה-Header
        const token = authHeader.split(' ')[1];
        console.log('Authorization Header:', authHeader);
        console.log('Extracted Token:', token);

        // בדיקת הטוקן
        console.log('JWT_SECRET used for verification:', process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        // הוספת המשתמש לאובייקט הבקשה
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Error during token verification:', err.message);
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = authMiddleware;
