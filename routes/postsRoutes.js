const express = require('express');
const router = express.Router();
const Post = require('../models/post'); // ייבוא המודל לפוסטים
const {
    addPost,
    getAllPosts,
    getPostById,
    updatePost,
    getPostsBySender,
    deletePost // וודא שהפונקציה הזו מיובאת
} = require('../controllers/postsController'); // ייבוא הפונקציות מה-Controller

// הוספת פוסט חדש
router.post('/', addPost);

// קבלת כל הפוסטים
router.get('/', getAllPosts);

// קבלת פוסט לפי מזהה
router.get('/:id', getPostById);

// עדכון פוסט
router.put('/:id', updatePost);

// חיפוש פוסטים לפי שולח
router.get('/search', getPostsBySender);

// מחיקת פוסט
router.delete('/:id', deletePost); // לוודא שהפונקציה הזו קיימת ב-controller

module.exports = router;
