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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAndFilterPosts = exports.getPostsByUser = exports.savePost = exports.deletePost = exports.getAllPosts = exports.updatePost = exports.createPost = void 0;
const post_1 = __importDefault(require("../models/post"));
const user_1 = __importDefault(require("../models/user"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { recipeTitle, category, difficulty, prepTime, ingredients, instructions } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = yield user_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        console.log("📥 יצירת פוסט חדש...");
        console.log("📂 קובץ שהתקבל:", req.file);
        let imageUrl = "";
        if (req.file) {
            imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
            console.log("✅ URL של התמונה שנשמר:", imageUrl);
        }
        else {
            console.log("⚠️ לא הועלתה תמונה!");
        }
        const newPost = new post_1.default({
            recipeTitle,
            category: typeof category === "string" ? JSON.parse(category) : category,
            imageUrl, // 📌 לוודא שהתמונה נשמרת כראוי
            difficulty,
            prepTime: Number(prepTime),
            ingredients: typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients,
            instructions: typeof instructions === "string" ? JSON.parse(instructions) : instructions,
            authorId: userId,
        });
        yield newPost.save();
        console.log("✅ פוסט נשמר בהצלחה:", newPost);
        res.status(201).json({ message: "Post created successfully", post: newPost });
    }
    catch (error) {
        console.error("❌ שגיאה ביצירת פוסט:", error);
        res.status(500).json({ message: "Error creating post", error });
    }
});
exports.createPost = createPost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const postId = req.params.id;
    console.log("🔄 עדכון פוסט עם ID:", postId);
    if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ message: "Invalid post ID" });
        return;
    }
    try {
        let post = yield post_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        console.log("📩 נתוני הבקשה שהתקבלו:", req.body);
        let imageUrl = post.imageUrl;
        if (req.file) {
            // מחיקת התמונה הישנה
            if (imageUrl) {
                const imagePath = path_1.default.join(__dirname, "../../public/uploads", path_1.default.basename(imageUrl));
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlinkSync(imagePath);
                    console.log(`🗑️ תמונה ישנה נמחקה: ${imagePath}`);
                }
            }
            // שמירת הנתיב החדש
            imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }
        const updates = {
            recipeTitle: req.body.recipeTitle || post.recipeTitle,
            category: req.body.category ? (typeof req.body.category === "string" ? JSON.parse(req.body.category) : req.body.category) : post.category,
            imageUrl: req.file ? imageUrl : post.imageUrl,
            difficulty: req.body.difficulty || post.difficulty,
            prepTime: req.body.prepTime ? Number(req.body.prepTime) : post.prepTime,
            ingredients: req.body.ingredients ? (typeof req.body.ingredients === "string" ? JSON.parse(req.body.ingredients) : req.body.ingredients) : post.ingredients,
            instructions: req.body.instructions ? (typeof req.body.instructions === "string" ? JSON.parse(req.body.instructions) : req.body.instructions) : post.instructions
        };
        const mongoUpdates = {};
        if (req.body.liked !== undefined) {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
            const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
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
        const updatedPost = yield post_1.default.findByIdAndUpdate(postId, Object.assign(Object.assign({}, updates), mongoUpdates), { new: true, runValidators: true });
        if (!updatedPost) {
            res.status(500).json({ message: "Failed to update post" });
            return;
        }
        console.log("✅ פוסט עודכן בהצלחה:", updatedPost);
        res.status(200).json({ message: "Post updated successfully", post: updatedPost });
    }
    catch (error) {
        console.error("❌ שגיאה בעדכון הפוסט:", error);
        res.status(500).json({ message: "Error updating post", error });
    }
});
exports.updatePost = updatePost;
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield post_1.default.find()
            .populate("authorId", "username imgUrl") // ✅ הוספת פרטי המשתמש (שם ותמונה)
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    }
    catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Error fetching posts", error });
    }
});
exports.getAllPosts = getAllPosts;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
        res.status(404).json({ message: "Invalid post ID" });
        return;
    }
    try {
        const post = yield post_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        // 🔥 מחיקת התמונה מהשרת אם קיימת
        if (post.imageUrl) {
            const imagePath = path_1.default.join(__dirname, "../../public/uploads", path_1.default.basename(post.imageUrl));
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
                console.log(`🗑️ תמונה נמחקה: ${imagePath}`);
            }
            else {
                console.log(`⚠️ קובץ תמונה לא נמצא: ${imagePath}`);
            }
        }
        yield post_1.default.findByIdAndDelete(postId);
        res.status(200).json({ message: "Post and associated image deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Error deleting post", error });
    }
});
exports.deletePost = deletePost;
const savePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const postId = req.params.id;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        try {
            const post = yield post_1.default.findById(postId);
            if (!post) {
                res.status(404).json({ message: "Post not found" });
                return;
            }
            const userIdObjectId = new mongoose_1.default.Types.ObjectId(userId);
            const isSaved = post.savedBy.some((id) => id.toString() === userId);
            if (isSaved) {
                post.savedBy = post.savedBy.filter((id) => id.toString() !== userId);
            }
            else {
                post.savedBy.push(userIdObjectId);
            }
            yield post.save();
            res.status(200).json({ message: isSaved ? "Post unsaved" : "Post saved" });
        }
        catch (error) {
            if (error.name === "CastError") {
                res.status(404).json({ message: "Post not found" });
            }
            else {
                console.error("Error saving/unsaving post:", error);
                res.status(500).json({ message: "Error saving/unsaving post", error });
            }
        }
    }
    catch (error) {
        console.error("Error saving/unsaving post:", error);
        res.status(500).json({ message: "Error saving/unsaving post", error });
    }
});
exports.savePost = savePost;
const getPostsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const posts = yield post_1.default.find({ authorId: userId })
            .populate("authorId", "username imgUrl")
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    }
    catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({ message: "Error fetching user posts", error });
    }
});
exports.getPostsByUser = getPostsByUser;
const searchAndFilterPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, difficulty, category } = req.query;
        let query = {};
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { recipeTitle: { $regex: searchRegex } },
                { ingredients: { $regex: searchRegex } },
                { instructions: { $regex: searchRegex } }
            ];
        }
        if (difficulty && typeof difficulty === 'string') {
            const normalizedDifficulty = difficulty.toLowerCase().trim();
            if (['easy', 'medium', 'hard'].includes(normalizedDifficulty)) {
                query.difficulty = normalizedDifficulty;
            }
            else {
                console.warn(`⚠️ ערך רמת קושי לא חוקי: ${difficulty}`);
            }
        }
        if (category) {
            const categories = category.split(',').map(cat => cat.trim());
            query.category = { $in: categories };
        }
        const posts = yield post_1.default.find(query)
            .populate("authorId", "username imgUrl")
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    }
    catch (error) {
        console.error("❌ שגיאה בחיפוש וסינון פוסטים:", error);
        res.status(500).json({ message: "שגיאה בחיפוש וסינון פוסטים", error });
    }
});
exports.searchAndFilterPosts = searchAndFilterPosts;
