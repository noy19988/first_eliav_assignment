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
exports.deleteComment = exports.updateComment = exports.getCommentsByPost = exports.createComment = void 0;
const comment_1 = __importDefault(require("../models/comment"));
const post_1 = __importDefault(require("../models/post"));
const mongoose_1 = __importDefault(require("mongoose"));
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { postId, content } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!content || content.trim() === '') {
        res.status(400).json({ message: 'Content is required' });
        return;
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ message: 'Invalid postId' });
        return;
    }
    try {
        const post = yield post_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        const newComment = new comment_1.default({
            content,
            postId,
            author: userId,
        });
        yield newComment.save();
        res.status(201).json(newComment);
    }
    catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Error creating comment', error });
    }
});
exports.createComment = createComment;
const getCommentsByPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
            res.status(400).json({ message: 'Invalid postId' });
            return;
        }
        const post = yield post_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        const comments = yield comment_1.default.find({ postId }).populate("author", "username imgUrl");
        res.status(200).json(comments);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        res.status(500).json({ error: errorMessage });
    }
});
exports.getCommentsByPost = getCommentsByPost;
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // בדיקה שה-ID תקין
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid comment ID' });
            return;
        }
        if (!req.body.content || req.body.content.trim() === '') {
            res.status(400).json({ message: 'Content is required' });
            return;
        }
        const comment = yield comment_1.default.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        // בדיקה של הרשאות
        if (comment.author.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }
        const updatedComment = yield comment_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedComment);
    }
    catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.updateComment = updateComment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // בדיקה שה-ID תקין
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid comment ID' });
            return;
        }
        const comment = yield comment_1.default.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        // בדיקה של הרשאות
        if (comment.author.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }
        yield comment_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Comment deleted' });
    }
    catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.deleteComment = deleteComment;
