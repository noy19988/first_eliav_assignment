"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = void 0;
const post_1 = __importDefault(require("../models/post"));
const user_1 = __importDefault(require("../models/user"));
const mongoose_1 = __importDefault(require("mongoose"));
const createPost = async (req, res) => {
    var _a;
    const { title, content } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!title || !content) {
        res.status(400).json({ message: 'Title and Content are required' });
        return;
    }
    try {
        const user = await user_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const newPost = new post_1.default({
            title,
            content,
            author: userId,
        });
        await newPost.save();
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post', error });
    }
};
exports.createPost = createPost;
const updatePost = async (req, res) => {
    const postId = req.params.id;
    if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
        res.status(404).json({ message: 'Post not found' });
        return;
    }
    try {
        const post = await post_1.default.findByIdAndUpdate(postId, req.body, { new: true });
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        res.status(200).json(post);
    }
    catch (error) {
        console.error('Error updating post:', error);
        res.status(400).json({ message: 'Invalid post ID or other error', error });
        return;
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    const postId = req.params.id;
    if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
        res.status(404).json({ message: 'Post not found' });
        return;
    }
    try {
        const post = await post_1.default.findByIdAndDelete(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post', error });
    }
};
exports.deletePost = deletePost;
