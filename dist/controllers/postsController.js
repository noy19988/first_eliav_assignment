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
exports.deletePost = exports.getPostsBySender = exports.updatePost = exports.getPostById = exports.getAllPosts = exports.addPost = exports.createPost = void 0;
const post_1 = __importDefault(require("../models/post"));
const user_1 = __importDefault(require("../models/user"));
// יצירת פוסט חדש
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, content } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // בהנחה ש-authMiddleware מגדיר userId ב-req.user
    try {
        const user = yield user_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const newPost = new post_1.default({
            title,
            content,
            author: userId,
        });
        yield newPost.save();
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post', error });
    }
});
exports.createPost = createPost;
// הוספת פוסט
const addPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = new post_1.default(req.body);
        yield post.save();
        res.status(201).send(post);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
exports.addPost = addPost;
// קבלת כל הפוסטים
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sender } = req.query;
        if (sender) {
            const posts = yield post_1.default.find({ author: sender });
            if (posts.length === 0) {
                res.status(404).send({ message: `No posts found for sender: ${sender}` });
                return;
            }
            res.status(200).send(posts);
            return;
        }
        const posts = yield post_1.default.find();
        res.status(200).send(posts);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
});
exports.getAllPosts = getAllPosts;
// קבלת פוסט לפי ID
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).send({ error: 'Post not found' });
            return;
        }
        res.status(200).send(post);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.getPostById = getPostById;
// עדכון פוסט
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) {
            res.status(404).send({ error: 'Post not found' });
            return;
        }
        res.status(200).send(post);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
exports.updatePost = updatePost;
// קבלת פוסטים לפי יוצר
const getPostsBySender = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = req.params.sender;
    try {
        if (!sender) {
            res.status(400).send({ message: 'Sender query parameter is required' });
            return;
        }
        const posts = yield post_1.default.find({ author: sender });
        if (posts.length === 0) {
            res.status(404).send({ message: `No posts found for sender: ${sender}` });
            return;
        }
        res.status(200).send(posts);
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
});
exports.getPostsBySender = getPostsBySender;
// מחיקת פוסט
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_1.default.findByIdAndDelete(req.params.id);
        if (!post) {
            res.status(404).send({ error: 'Post not found' });
            return;
        }
        res.status(200).send({ message: 'Post deleted successfully' });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.deletePost = deletePost;
