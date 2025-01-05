require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = 'your_token_here'; // טוקן לבדיקה
try {
    console.log('JWT_SECRET used for verification:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);
} catch (error) {
    console.error('Error during manual token verification:', error);
}
