const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Middleware לאימות
const {
    addPost,
    getAllPosts,
    getPostById,
    updatePost,
    getPostsBySender,
    deletePost
} = require('../controllers/postsController');

// יצירת פוסט חדש (דורש אימות)
router.post('/', authMiddleware, addPost);

// קריאה לכל הפוסטים
router.get('/', getAllPosts);

// קריאה לפוסט לפי ID
router.get('/:id', getPostById);

// קריאה לפוסטים לפי sender
router.get('/sender/:sender', getPostsBySender);

// עדכון פוסט (דורש אימות)
router.put('/:id', authMiddleware, updatePost);

// מחיקת פוסט (דורש אימות)
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
