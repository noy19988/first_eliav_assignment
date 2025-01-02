const express = require('express');
const router = express.Router();
const Comment = require('../models/comment'); // ייבוא המודל לתגובות
const {
    addComment,
    getCommentsByPost,
    updateComment,
    deleteComment
} = require('../controllers/commentsController'); // ייבוא הפונקציות מה-Controller

// הוספת תגובה
router.post('/', addComment);

// קבלת כל התגובות לפוסט מסוים
router.get('/post/:postId', getCommentsByPost);

// עדכון תגובה
router.put('/:id', updateComment);

// מחיקת תגובה
router.delete('/:id', deleteComment);

module.exports = router;
