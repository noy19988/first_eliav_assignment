"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserDetails = exports.deleteUser = exports.updateUser = exports.refreshToken = exports.logoutUser = exports.loginUser = exports.googleLogin = exports.registerUser = void 0;
var dotenv_1 = require("dotenv");
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var user_1 = require("../models/user");
var google_auth_library_1 = require("google-auth-library");
var path_1 = require("path");
var fs_1 = require("fs");
dotenv_1.default.config();
var JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET';
var JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRET';
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
var client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
var registerUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, password, existingUser, hashedPassword, newUser, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, username = _a.username, email = _a.email, password = _a.password;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                if (!username || !email || !password) {
                    res.status(400).json({ message: 'All fields are required' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, user_1.default.findOne({ $or: [{ email: email.toLowerCase() }, { username: username }] })];
            case 2:
                existingUser = _b.sent();
                if (existingUser) {
                    res.status(400).json({ message: 'User already exists' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 3:
                hashedPassword = _b.sent();
                newUser = new user_1.default({
                    username: username,
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    imgUrl: "https://example.com/default-profile.png", // 🔹 קישור לתמונה דיפולטיבית
                });
                return [4 /*yield*/, newUser.save()];
            case 4:
                _b.sent();
                res.status(201).json({ message: 'User registered successfully' });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                console.error('Error during registration:', error_1);
                res.status(500).json({ message: 'Error registering user', error: error_1.message });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.registerUser = registerUser;
var googleLogin = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, ticket, payload, googleId, email, name_1, picture, user, _a, _b, accessToken, refreshToken_1, error_2;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 7, , 8]);
                token = req.body.token;
                if (!token) {
                    res.status(400).json({ message: 'No Google token provided' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, client.verifyIdToken({
                        idToken: token,
                        audience: GOOGLE_CLIENT_ID,
                    })];
            case 1:
                ticket = _d.sent();
                payload = ticket.getPayload();
                if (!payload) {
                    res.status(400).json({ message: 'Invalid Google token' });
                    return [2 /*return*/];
                }
                googleId = payload.sub, email = payload.email, name_1 = payload.name, picture = payload.picture;
                return [4 /*yield*/, user_1.default.findOne({ email: email })];
            case 2:
                user = _d.sent();
                if (!!user) return [3 /*break*/, 5];
                _a = user_1.default.bind;
                _c = {
                    googleId: googleId,
                    username: name_1,
                    email: email,
                    imgUrl: picture
                };
                return [4 /*yield*/, bcrypt_1.default.hash(googleId, 10)];
            case 3:
                // יצירת משתמש חדש אם לא קיים
                user = new (_a.apply(user_1.default, [void 0, (_c.password = _d.sent(),
                        _c.refreshTokens = [],
                        _c)]))();
                return [4 /*yield*/, user.save()];
            case 4:
                _d.sent();
                _d.label = 5;
            case 5:
                _b = generateTokens(user._id.toString()), accessToken = _b.token, refreshToken_1 = _b.refreshToken;
                // שמירת ה-refresh token במערכת
                user.refreshTokens.push(refreshToken_1);
                return [4 /*yield*/, user.save()];
            case 6:
                _d.sent();
                res.status(200).json({
                    message: 'Google Login successful',
                    token: accessToken,
                    refreshToken: refreshToken_1,
                    userId: user._id,
                    username: user.username,
                    imgUrl: user.imgUrl,
                });
                return [3 /*break*/, 8];
            case 7:
                error_2 = _d.sent();
                console.error('Google authentication failed:', error_2);
                if (error_2 instanceof Error && error_2.message.includes('invalid')) {
                    res.status(400).json({ message: 'Invalid Google token', error: error_2.message });
                    return [2 /*return*/];
                }
                res.status(500).json({ message: 'Error authenticating with Google', error: error_2.message });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.googleLogin = googleLogin;
var generateTokens = function (userId) {
    var token = jsonwebtoken_1.default.sign({ userId: userId }, JWT_SECRET, { expiresIn: '3d' });
    var refreshToken = jsonwebtoken_1.default.sign({ userId: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { token: token, refreshToken: refreshToken };
};
var loginUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, isPasswordValid, _b, token, refreshToken_2, error_3;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 5, , 6]);
                return [4 /*yield*/, user_1.default.findOne({ email: email.toLowerCase() })];
            case 2:
                user = _c.sent();
                if (!user) {
                    res.status(404).json({ message: 'User not found' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.password)];
            case 3:
                isPasswordValid = _c.sent();
                if (!isPasswordValid) {
                    res.status(400).json({ message: 'Wrong password' });
                    return [2 /*return*/];
                }
                _b = generateTokens(user._id.toString()), token = _b.token, refreshToken_2 = _b.refreshToken;
                user.refreshTokens.push(refreshToken_2);
                return [4 /*yield*/, user.save()];
            case 4:
                _c.sent();
                res.status(200).json({ message: 'Login successful', token: token, refreshToken: refreshToken_2, userId: user._id });
                return [3 /*break*/, 6];
            case 5:
                error_3 = _c.sent();
                console.error('Error during login:', error_3);
                res.status(500).json({ message: 'Error logging in', error: error_3.message });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.loginUser = loginUser;
var logoutUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken, user, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("logoutUser called");
                refreshToken = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                if (!refreshToken) {
                    refreshToken = req.body.refreshToken;
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                console.log("refreshToken:", refreshToken);
                if (!refreshToken) {
                    res.status(400).json({ message: 'Refresh token is required' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, user_1.default.findOne({ refreshTokens: refreshToken })];
            case 2:
                user = _b.sent();
                if (!user) {
                    res.status(404).json({ message: 'Invalid refresh token' });
                    return [2 /*return*/];
                }
                user.refreshTokens = user.refreshTokens.filter(function (token) { return token !== refreshToken; });
                return [4 /*yield*/, user.save()];
            case 3:
                _b.sent();
                res.status(200).json({ message: 'Logout successful' });
                return [3 /*break*/, 5];
            case 4:
                error_4 = _b.sent();
                res.status(500).json({ message: 'Error logging out', error: error_4.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.logoutUser = logoutUser;
var refreshToken = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken, decoded, user, _a, token, newRefreshToken, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                refreshToken = req.body.refreshToken;
                if (!refreshToken) {
                    res.status(400).json({ message: 'Refresh token is required' });
                    return [2 /*return*/];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
                return [4 /*yield*/, user_1.default.findById(decoded.userId)];
            case 2:
                user = _b.sent();
                if (!user || !user.refreshTokens.includes(refreshToken)) {
                    res.status(403).json({ message: 'Invalid refresh token' });
                    return [2 /*return*/];
                }
                _a = generateTokens(user._id.toString()), token = _a.token, newRefreshToken = _a.refreshToken;
                user.refreshTokens = user.refreshTokens.filter(function (token) { return token !== refreshToken; });
                user.refreshTokens.push(newRefreshToken);
                return [4 /*yield*/, user.save()];
            case 3:
                _b.sent();
                res.status(200).json({ token: token, refreshToken: newRefreshToken });
                return [3 /*break*/, 5];
            case 4:
                err_1 = _b.sent();
                res.status(403).json({ message: 'Invalid refresh token', error: err_1.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.refreshToken = refreshToken;
var updateUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var updates, fileExt, newFileName, uploadPath, user, oldImagePath, updatedUser, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                console.log("🔹 Update user request received!");
                console.log("🔹 Full Request Body:", req.body);
                console.log("🔹 Uploaded File:", req.file);
                if (!req.file) {
                    console.warn("⚠️ No file uploaded! Updating only username.");
                }
                updates = {};
                if (req.body.username)
                    updates.username = req.body.username;
                if (!req.file) return [3 /*break*/, 2];
                fileExt = path_1.default.extname(req.file.originalname);
                newFileName = "".concat(req.params.id).concat(fileExt);
                uploadPath = path_1.default.join("public/uploads/", newFileName);
                return [4 /*yield*/, user_1.default.findById(req.params.id)];
            case 1:
                user = _a.sent();
                if ((user === null || user === void 0 ? void 0 : user.imgUrl) && user.imgUrl !== "https://example.com/default-profile.png") {
                    oldImagePath = path_1.default.join("public", user.imgUrl);
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
                updates.imgUrl = "".concat(req.protocol, "://").concat(req.get('host'), "/uploads/").concat(newFileName);
                console.log("🔹 Saving image URL in DB:", updates.imgUrl);
                _a.label = 2;
            case 2:
                if (Object.keys(updates).length === 0) {
                    res.status(400).json({ message: "No data provided for update" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, user_1.default.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password")];
            case 3:
                updatedUser = _a.sent();
                if (!updatedUser) {
                    res.status(404).json({ message: "User not found" });
                    return [2 /*return*/];
                }
                res.status(200).json(updatedUser);
                return [3 /*break*/, 5];
            case 4:
                error_5 = _a.sent();
                console.error("Error updating user:", error_5);
                res.status(500).json({ message: "Error updating user", error: error_5.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.updateUser = updateUser;
var deleteUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var deletedUser, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, user_1.default.findByIdAndDelete(req.params.id)];
            case 1:
                deletedUser = _a.sent();
                if (!deletedUser) {
                    res.status(404).json({ message: 'User not found' });
                    return [2 /*return*/];
                }
                res.status(200).json({ message: 'User deleted successfully' });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                res.status(500).json({ message: 'Error deleting user', error: error_6.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteUser = deleteUser;
var getUserDetails = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, user_1.default.findById(req.params.id).select('-password')];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.status(404).json({ message: 'User not found' });
                    return [2 /*return*/];
                }
                res.status(200).json({
                    _id: user._id,
                    username: user.username,
                    email: user.email, // ✅ הוספת email
                    imgUrl: user.imgUrl
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                res.status(500).json({ message: 'Error retrieving user details', error: error_7 });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
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
