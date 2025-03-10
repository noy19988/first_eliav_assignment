"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDetails = exports.deleteUser = exports.updateUser = exports.refreshToken = exports.logoutUser = exports.loginUser = exports.googleLogin = exports.registerUser = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const google_auth_library_1 = require("google-auth-library");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRET';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
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
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = new user_1.default({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            imgUrl: "https://example.com/default-profile.png", // 🔹 קישור לתמונה דיפולטיבית
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
const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ message: 'No Google token provided' });
            return;
        }
        // אימות ה-token מול Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            res.status(400).json({ message: 'Invalid Google token' });
            return;
        }
        const { sub: googleId, email, name, picture } = payload;
        // חיפוש משתמש קיים לפי email
        let user = await user_1.default.findOne({ email });
        if (!user) {
            // יצירת משתמש חדש אם לא קיים
            user = new user_1.default({
                googleId,
                username: name,
                email,
                imgUrl: picture,
                password: await bcrypt_1.default.hash(googleId, 10), // יוצרים סיסמה רנדומלית על בסיס ה-Google ID
                refreshTokens: [],
            });
            await user.save();
        }
        // יצירת טוקנים
        const { token: accessToken, refreshToken } = generateTokens(user._id.toString());
        // שמירת ה-refresh token במערכת
        user.refreshTokens.push(refreshToken);
        await user.save();
        res.status(200).json({
            message: 'Google Login successful',
            token: accessToken,
            refreshToken,
            userId: user._id,
            username: user.username,
            imgUrl: user.imgUrl,
        });
    }
    catch (error) {
        console.error('Google authentication failed:', error);
        if (error instanceof Error && error.message.includes('invalid')) {
            res.status(400).json({ message: 'Invalid Google token', error: error.message });
            return;
        }
        res.status(500).json({ message: 'Error authenticating with Google', error: error.message });
    }
};
exports.googleLogin = googleLogin;
const generateTokens = (userId) => {
    const token = jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: '3d' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { token, refreshToken };
};
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await user_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
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
const logoutUser = async (req, res) => {
    var _a;
    console.log("logoutUser called");
    let refreshToken = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!refreshToken) {
        refreshToken = req.body.refreshToken;
    }
    try {
        console.log("refreshToken:", refreshToken);
        if (!refreshToken) {
            res.status(400).json({ message: 'Refresh token is required' });
            return;
        }
        const user = await user_1.default.findOne({ refreshTokens: refreshToken });
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
        res.status(403).json({ message: 'Invalid refresh token', error: err.message });
    }
};
exports.refreshToken = refreshToken;
const updateUser = async (req, res) => {
    try {
        console.log("🔹 Update user request received!");
        console.log("🔹 Full Request Body:", req.body);
        console.log("🔹 Uploaded File:", req.file);
        if (!req.file) {
            console.warn("⚠️ No file uploaded! Updating only username.");
        }
        const updates = {};
        if (req.body.username)
            updates.username = req.body.username;
        if (req.file) {
            const fileExt = path_1.default.extname(req.file.originalname);
            const newFileName = `${req.params.id}${fileExt}`;
            const uploadPath = path_1.default.join("public/uploads/", newFileName);
            const user = await user_1.default.findById(req.params.id);
            if ((user === null || user === void 0 ? void 0 : user.imgUrl) && user.imgUrl !== "https://example.com/default-profile.png") {
                const oldImagePath = path_1.default.join("public", user.imgUrl);
                if (fs_1.default.existsSync(oldImagePath)) {
                    try {
                        fs_1.default.unlinkSync(oldImagePath);
                    }
                    catch (err) {
                        console.error("❌ Failed to delete old image:", err);
                    }
                }
            }
            fs_1.default.renameSync(req.file.path, uploadPath);
            updates.imgUrl = `${req.protocol}://${req.get('host')}/uploads/${newFileName}`;
            console.log("🔹 Saving image URL in DB:", updates.imgUrl);
        }
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ message: "No data provided for update" });
            return;
        }
        const updatedUser = await user_1.default.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
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
        const user = await user_1.default.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email, // ✅ הוספת email
            imgUrl: user.imgUrl
        });
    }
    catch (error) {
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
    googleLogin: exports.googleLogin,
};
