"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.searchAndFilterPosts = exports.getPostsByUser = exports.savePost = exports.deletePost = exports.getAllPosts = exports.updatePost = exports.createPost = void 0;
var post_1 = require("../models/post");
var user_1 = require("../models/user");
var mongoose_1 = require("mongoose");
var path_1 = require("path");
var fs_1 = require("fs");
var createPost = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, recipeTitle, category, difficulty, prepTime, ingredients, instructions, userId, user, imageUrl, newPost, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                _a = req.body, recipeTitle = _a.recipeTitle, category = _a.category, difficulty = _a.difficulty, prepTime = _a.prepTime, ingredients = _a.ingredients, instructions = _a.instructions;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, user_1.default.findById(userId)];
            case 1:
                user = _c.sent();
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return [2 /*return*/];
                }
                console.log("📥 יצירת פוסט חדש...");
                console.log("📂 קובץ שהתקבל:", req.file);
                imageUrl = "";
                if (req.file) {
                    imageUrl = "".concat(req.protocol, "://").concat(req.get("host"), "/uploads/").concat(req.file.filename);
                    console.log("✅ URL של התמונה שנשמר:", imageUrl);
                }
                else {
                    console.log("⚠️ לא הועלתה תמונה!");
                }
                newPost = new post_1.default({
                    recipeTitle: recipeTitle,
                    category: typeof category === "string" ? JSON.parse(category) : category,
                    imageUrl: imageUrl, // 📌 לוודא שהתמונה נשמרת כראוי
                    difficulty: difficulty,
                    prepTime: Number(prepTime),
                    ingredients: typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients,
                    instructions: typeof instructions === "string" ? JSON.parse(instructions) : instructions,
                    authorId: userId,
                });
                return [4 /*yield*/, newPost.save()];
            case 2:
                _c.sent();
                console.log("✅ פוסט נשמר בהצלחה:", newPost);
                res.status(201).json({ message: "Post created successfully", post: newPost });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _c.sent();
                console.error("❌ שגיאה ביצירת פוסט:", error_1);
                res.status(500).json({ message: "Error creating post", error: error_1 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.createPost = createPost;
var updatePost = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var postId, post, imageUrl, imagePath, updates, mongoUpdates, userId, userId, updatedPost, error_2;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                postId = req.params.id;
                console.log("🔄 עדכון פוסט עם ID:", postId);
                if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
                    res.status(400).json({ message: "Invalid post ID" });
                    return [2 /*return*/];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 5]);
                return [4 /*yield*/, post_1.default.findById(postId)];
            case 2:
                post = _c.sent();
                if (!post) {
                    res.status(404).json({ message: "Post not found" });
                    return [2 /*return*/];
                }
                console.log("📩 נתוני הבקשה שהתקבלו:", req.body);
                imageUrl = post.imageUrl;
                if (req.file) {
                    // מחיקת התמונה הישנה
                    if (imageUrl) {
                        imagePath = path_1.default.join(__dirname, "../../public/uploads", path_1.default.basename(imageUrl));
                        if (fs_1.default.existsSync(imagePath)) {
                            fs_1.default.unlinkSync(imagePath);
                            console.log("\uD83D\uDDD1\uFE0F \u05EA\u05DE\u05D5\u05E0\u05D4 \u05D9\u05E9\u05E0\u05D4 \u05E0\u05DE\u05D7\u05E7\u05D4: ".concat(imagePath));
                        }
                    }
                    // שמירת הנתיב החדש
                    imageUrl = "".concat(req.protocol, "://").concat(req.get("host"), "/uploads/").concat(req.file.filename);
                }
                updates = {
                    recipeTitle: req.body.recipeTitle || post.recipeTitle,
                    category: req.body.category ? (typeof req.body.category === "string" ? JSON.parse(req.body.category) : req.body.category) : post.category,
                    imageUrl: req.file ? imageUrl : post.imageUrl,
                    difficulty: req.body.difficulty || post.difficulty,
                    prepTime: req.body.prepTime ? Number(req.body.prepTime) : post.prepTime,
                    ingredients: req.body.ingredients ? (typeof req.body.ingredients === "string" ? JSON.parse(req.body.ingredients) : req.body.ingredients) : post.ingredients,
                    instructions: req.body.instructions ? (typeof req.body.instructions === "string" ? JSON.parse(req.body.instructions) : req.body.instructions) : post.instructions
                };
                mongoUpdates = {};
                if (req.body.liked !== undefined) {
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                    if (userId) {
                        if (req.body.liked) {
                            mongoUpdates.$addToSet = { likedBy: userId };
                            mongoUpdates.$inc = { likes: 1 };
                        }
                        else {
                            mongoUpdates.$pull = { likedBy: userId };
                            mongoUpdates.$inc = { likes: -1 };
                        }
                    }
                }
                if (req.body.saved !== undefined) {
                    userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
                    if (userId) {
                        if (req.body.saved) {
                            mongoUpdates.$addToSet = { savedBy: userId };
                        }
                        else {
                            mongoUpdates.$pull = { savedBy: userId };
                        }
                    }
                }
                console.log("🆕 נתונים שנשלחו לעדכון:", updates, mongoUpdates);
                return [4 /*yield*/, post_1.default.findByIdAndUpdate(postId, __assign(__assign({}, updates), mongoUpdates), { new: true, runValidators: true })];
            case 3:
                updatedPost = _c.sent();
                if (!updatedPost) {
                    res.status(500).json({ message: "Failed to update post" });
                    return [2 /*return*/];
                }
                console.log("✅ פוסט עודכן בהצלחה:", updatedPost);
                res.status(200).json({ message: "Post updated successfully", post: updatedPost });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _c.sent();
                console.error("❌ שגיאה בעדכון הפוסט:", error_2);
                res.status(500).json({ message: "Error updating post", error: error_2 });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.updatePost = updatePost;
var getAllPosts = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var posts, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, post_1.default.find()
                        .populate("authorId", "username imgUrl") // ✅ הוספת פרטי המשתמש (שם ותמונה)
                        .sort({ createdAt: -1 })];
            case 1:
                posts = _a.sent();
                res.status(200).json(posts);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error("Error fetching posts:", error_3);
                res.status(500).json({ message: "Error fetching posts", error: error_3 });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAllPosts = getAllPosts;
var deletePost = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var postId, post, imagePath, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                postId = req.params.id;
                if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
                    res.status(404).json({ message: "Invalid post ID" });
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, post_1.default.findById(postId)];
            case 2:
                post = _a.sent();
                if (!post) {
                    res.status(404).json({ message: "Post not found" });
                    return [2 /*return*/];
                }
                // 🔥 מחיקת התמונה מהשרת אם קיימת
                if (post.imageUrl) {
                    imagePath = path_1.default.join(__dirname, "../../public/uploads", path_1.default.basename(post.imageUrl));
                    if (fs_1.default.existsSync(imagePath)) {
                        fs_1.default.unlinkSync(imagePath);
                        console.log("\uD83D\uDDD1\uFE0F \u05EA\u05DE\u05D5\u05E0\u05D4 \u05E0\u05DE\u05D7\u05E7\u05D4: ".concat(imagePath));
                    }
                    else {
                        console.log("\u26A0\uFE0F \u05E7\u05D5\u05D1\u05E5 \u05EA\u05DE\u05D5\u05E0\u05D4 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0: ".concat(imagePath));
                    }
                }
                return [4 /*yield*/, post_1.default.findByIdAndDelete(postId)];
            case 3:
                _a.sent();
                res.status(200).json({ message: "Post and associated image deleted successfully" });
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                console.error("Error deleting post:", error_4);
                res.status(500).json({ message: "Error deleting post", error: error_4 });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.deletePost = deletePost;
var savePost = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var postId, userId_1, post, userIdObjectId, isSaved, error_5, error_6;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                postId = req.params.id;
                userId_1 = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId_1) {
                    res.status(401).json({ message: "Unauthorized" });
                    return [2 /*return*/];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, post_1.default.findById(postId)];
            case 2:
                post = _b.sent();
                if (!post) {
                    res.status(404).json({ message: "Post not found" });
                    return [2 /*return*/];
                }
                userIdObjectId = new mongoose_1.default.Types.ObjectId(userId_1);
                isSaved = post.savedBy.some(function (id) { return id.toString() === userId_1; });
                if (isSaved) {
                    post.savedBy = post.savedBy.filter(function (id) { return id.toString() !== userId_1; });
                }
                else {
                    post.savedBy.push(userIdObjectId);
                }
                return [4 /*yield*/, post.save()];
            case 3:
                _b.sent();
                res.status(200).json({ message: isSaved ? "Post unsaved" : "Post saved" });
                return [3 /*break*/, 5];
            case 4:
                error_5 = _b.sent();
                if (error_5.name === "CastError") {
                    res.status(404).json({ message: "Post not found" });
                }
                else {
                    console.error("Error saving/unsaving post:", error_5);
                    res.status(500).json({ message: "Error saving/unsaving post", error: error_5 });
                }
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_6 = _b.sent();
                console.error("Error saving/unsaving post:", error_6);
                res.status(500).json({ message: "Error saving/unsaving post", error: error_6 });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.savePost = savePost;
var getPostsByUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, posts, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                    res.status(400).json({ message: "Invalid user ID" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, post_1.default.find({ authorId: userId })
                        .populate("authorId", "username imgUrl")
                        .sort({ createdAt: -1 })];
            case 1:
                posts = _a.sent();
                res.status(200).json(posts);
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error("Error fetching user posts:", error_7);
                res.status(500).json({ message: "Error fetching user posts", error: error_7 });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getPostsByUser = getPostsByUser;
var searchAndFilterPosts = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, search, difficulty, category, query, searchRegex, normalizedDifficulty, categories, posts, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, search = _a.search, difficulty = _a.difficulty, category = _a.category;
                query = {};
                if (search) {
                    searchRegex = new RegExp(search, 'i');
                    query.$or = [
                        { recipeTitle: { $regex: searchRegex } },
                        { ingredients: { $regex: searchRegex } },
                        { instructions: { $regex: searchRegex } }
                    ];
                }
                if (difficulty && typeof difficulty === 'string') {
                    normalizedDifficulty = difficulty.toLowerCase().trim();
                    if (['easy', 'medium', 'hard'].includes(normalizedDifficulty)) {
                        query.difficulty = normalizedDifficulty;
                    }
                    else {
                        console.warn("\u26A0\uFE0F \u05E2\u05E8\u05DA \u05E8\u05DE\u05EA \u05E7\u05D5\u05E9\u05D9 \u05DC\u05D0 \u05D7\u05D5\u05E7\u05D9: ".concat(difficulty));
                    }
                }
                if (category) {
                    categories = category.split(',').map(function (cat) { return cat.trim(); });
                    query.category = { $in: categories };
                }
                return [4 /*yield*/, post_1.default.find(query)
                        .populate("authorId", "username imgUrl")
                        .sort({ createdAt: -1 })];
            case 1:
                posts = _b.sent();
                res.status(200).json(posts);
                return [3 /*break*/, 3];
            case 2:
                error_8 = _b.sent();
                console.error("❌ שגיאה בחיפוש וסינון פוסטים:", error_8);
                res.status(500).json({ message: "שגיאה בחיפוש וסינון פוסטים", error: error_8 });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.searchAndFilterPosts = searchAndFilterPosts;
