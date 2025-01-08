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
exports.deleteComment = exports.updateComment = exports.getCommentsByPost = exports.addComment = exports.createComment = void 0;
const comment_1 = __importDefault(require("../models/comment"));
const post_1 = __importDefault(require("../models/post"));
const user_1 = __importDefault(require("../models/user"));
// יצירת תגובה חדשה
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { postId, content } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // בהנחה ש-authMiddleware מגדיר userId ב-req.user
    console.log('Entering createComment function...');
    console.log('Received postId:', postId); // הדפסה לבדיקה
    console.log('Received content:', content); // הדפסה לבדיקה
    console.log('Received userId:', userId); // הדפסה לבדיקה
    try {
        const post = yield post_1.default.findById(postId);
        console.log('Fetched post:', post);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        const user = yield user_1.default.findById(userId);
        console.log('Fetched user:', user);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const newComment = new comment_1.default({
            content,
            postId,
            author: userId,
        });
        yield newComment.save();
        res.status(201).json({ message: 'Comment created successfully', comment: newComment });
    }
    catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Error creating comment', error });
    }
});
exports.createComment = createComment;
// הוספת תגובה
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = new comment_1.default(req.body);
        yield comment.save();
        res.status(201).send(comment);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
exports.addComment = addComment;
// קבלת תגובות לפי פוסט
const getCommentsByPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield comment_1.default.find({ postId: req.params.postId });
        res.status(200).send(comments);
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.getCommentsByPost = getCommentsByPost;
// עדכון תגובה
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield comment_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!comment) {
            res.status(404).send({ error: 'Comment not found' });
            return;
        }
        res.status(200).send(comment);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
exports.updateComment = updateComment;
// מחיקת תגובה
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield comment_1.default.findByIdAndDelete(req.params.id);
        if (!comment) {
            res.status(404).send({ error: 'Comment not found' });
            return;
        }
        res.status(200).send({ message: 'Comment deleted' });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
exports.deleteComment = deleteComment;
