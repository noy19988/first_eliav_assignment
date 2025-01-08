"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getCommentsByPost = exports.createComment = void 0;
const comment_1 = __importDefault(require("../models/comment"));
const post_1 = __importDefault(require("../models/post"));
const mongoose_1 = __importDefault(require("mongoose"));
// יצירת תגובה חדשה
const createComment = async (req, res) => {
    var _a;
    const { postId, content } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    console.log('comment postid at func:', postId);
    console.log('comment content at func:', content);
    console.log('comment author at func:', userId);
    if (!content || content.trim() === '') {
        res.status(400).json({ message: 'Content is required' });
        return;
    }
    // בדוק אם ה-postId הוא אובייקט תקין של MongoDB
    if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ message: 'Invalid postId' });
        return;
    }
    try {
        const post = await post_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        // const user = await User.findById(userId);
        // if (!user) {
        //     res.status(404).json({ message: 'User not found' });
        //     return;
        // }
        const newComment = new comment_1.default({
            content,
            postId,
            author: userId,
        });
        await newComment.save();
        res.status(201).json(newComment);
    }
    catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Error creating comment', error });
    }
};
exports.createComment = createComment;
// קבלת תגובות לפי פוסט
const getCommentsByPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        console.log('inside the  getCommentsByPost function'); // לוג נוסף לבדיקה
        // בדוק אם הפוסט קיים
        const post = await post_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return; // יוצא מהפונקציה אם הפוסט לא נמצא
        }
        // חפש את התגובות לפוסט
        const comments = await comment_1.default.find({ postId });
        if (comments.length === 0) {
            res.status(404).json({ message: 'No comments found' });
            return; // יוצא מהפונקציה אם אין תגובות
        }
        // החזר את התגובות
        res.status(200).json(comments);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        res.status(500).json({ error: errorMessage });
    }
};
exports.getCommentsByPost = getCommentsByPost;
// עדכון תגובה
const updateComment = async (req, res) => {
    var _a, _b;
    console.log('updatecomment function'); // לוג נוסף לבדיקה
    try {
        const comment = await comment_1.default.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        // בדיקת אם המשתמש הוא בעל התגובה
        console.log('User from request:', (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId); // לוג נוסף לבדוק את ה-userId
        console.log('Comment author ID:', comment.author.toString()); // לוג נוסף לבדוק את ה-author ID
        if (comment.author.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId)) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }
        // בדיקת אם תוכן התגובה ריק
        if (!req.body.content || req.body.content.trim() === '') {
            res.status(400).json({ message: 'Content is required' });
            return;
        }
        // עדכון התגובה
        const updatedComment1 = await comment_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedComment1);
    }
    catch (error) {
        console.error('Error updating comment:', error);
        res.status(400).json({ error });
    }
};
exports.updateComment = updateComment;
// מחיקת תגובה
const deleteComment = async (req, res) => {
    var _a, _b;
    console.log('deletecomment function'); // לוג נוסף לבדיקה
    try {
        const comment = await comment_1.default.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        // בדיקת אם המשתמש הוא בעל התגובה
        console.log('User from request:', (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId); // לוג נוסף לבדוק את ה-userId
        console.log('Comment author ID:', comment.author.toString()); // לוג נוסף לבדוק את ה-author ID
        if (comment.author.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId)) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }
        // מחיקת התגובה
        await comment_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Comment deleted' });
    }
    catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error });
    }
};
exports.deleteComment = deleteComment;
