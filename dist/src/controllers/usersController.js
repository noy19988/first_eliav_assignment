"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDetails = exports.deleteUser = exports.updateUser = exports.refreshToken = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRET';
// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        const existingUser = await user_1.default.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        console.log('Password before hashing:', password);
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        console.log('Hashed password being saved:', hashedPassword);
        const newUser = new user_1.default({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};
exports.registerUser = registerUser;
// Generate tokens
const generateTokens = (userId) => {
    const token = jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: '3d' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { token, refreshToken };
};
// User login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt with:', email, password);
    try {
        const user = await user_1.default.findOne({ email: email.toLowerCase() });
        console.log('User fetched from DB:', user);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        console.log('Password provided:', password);
        console.log('Password stored in DB:', user.password);
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        console.log('Password validation result:', isPasswordValid);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Wrong password' });
            return;
        }
        const { token, refreshToken } = generateTokens(user._id.toString());
        user.refreshTokens.push(refreshToken);
        await user.save();
        res.status(200).json({ message: 'Login successful', token, refreshToken, userId: user._id });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};
exports.loginUser = loginUser;
// User logout
const logoutUser = async (req, res) => {
    const { refreshToken } = req.body;
    console.log('Received refreshToken:', refreshToken); // לוג נוסף לבדיקה
    try {
        const user = await user_1.default.findOne({ refreshTokens: refreshToken });
        console.log('User found:', user); // בדוק אם המשתמש מזוהה
        if (!user) {
            res.status(404).json({ message: 'Invalid refresh token' });
            return;
        }
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();
        res.status(200).json({ message: 'Logout successful' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging out', error: error.message });
    }
};
exports.logoutUser = logoutUser;
// Refresh token
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await user_1.default.findById(decoded.userId);
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            res.status(403).json({ message: 'Invalid refresh token' });
            return;
        }
        const { token, refreshToken: newRefreshToken } = generateTokens(user._id.toString());
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();
        res.status(200).json({ token, refreshToken: newRefreshToken });
    }
    catch (err) {
        console.error('Error refreshing token:', err);
        res.status(403).json({ message: 'Invalid refresh token', error: err.message });
    }
};
exports.refreshToken = refreshToken;
// Update user
const updateUser = async (req, res) => {
    const { username, email, password } = req.body;
    // לא מבצעים בדיקה אם שדה מסוים ריק, רק אם הוא נשלח ונמצא
    const updates = {};
    if (username)
        updates.username = username;
    if (email)
        updates.email = email;
    if (password)
        updates.password = await bcrypt_1.default.hash(password, 10);
    if (Object.keys(updates).length === 0) {
        res.status(400).json({ message: 'At least one field must be provided for update' });
        return;
    }
    try {
        const updatedUser = await user_1.default.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (req, res) => {
    try {
        console.log('Deleting user withID at func:', req.params.id); // לוג שמדפיס את ה-ID
        const deletedUser = await user_1.default.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};
exports.deleteUser = deleteUser;
const getUserDetails = async (req, res) => {
    try {
        console.log("Fetching user details for ID:", req.params.id); // הדפסה של ה-ID שנשלח בבקשה
        const user = await user_1.default.findById(req.params.id).select('-password'); // שליפת המשתמש לפי ID
        if (!user) {
            console.log("User not found with ID:", req.params.id); // הדפסה אם לא נמצא משתמש
            res.status(404).json({ message: 'User not found' });
            return;
        }
        console.log("User found:", user); // הדפסה אם המשתמש נמצא
        res.status(200).json(user); // החזרת פרטי המשתמש
    }
    catch (error) {
        console.error("Error retrieving user details:", error); // הדפסה אם יש שגיאה
        res.status(500).json({ message: 'Error retrieving user details', error });
    }
};
exports.getUserDetails = getUserDetails;
exports.default = {
    registerUser: exports.registerUser,
    loginUser: exports.loginUser,
    logoutUser: exports.logoutUser,
    refreshToken: exports.refreshToken,
    updateUser: exports.updateUser,
    getUserDetails: exports.getUserDetails,
    deleteUser: exports.deleteUser,
};
