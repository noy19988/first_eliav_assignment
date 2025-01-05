const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Middleware לאימות
const {
    addComment,
    getCommentsByPost,
    updateComment,
    deleteComment
} = require('../controllers/commentsController');

// הוספת תגובה חדשה (דורש אימות)
router.post('/', authMiddleware, addComment);

// קבלת תגובות לפי פוסט ID
router.get('/post/:postId', getCommentsByPost);

// עדכון תגובה לפי ID (דורש אימות)
router.put('/:id', authMiddleware, updateComment);

// מחיקת תגובה לפי ID (דורש אימות)
router.delete('/:id', authMiddleware, deleteComment);

module.exports = router;
