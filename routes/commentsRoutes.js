const express = require('express');
const router = express.Router();

// הוספת תגובה
router.post('/', (req, res) => {
    res.send('Add a new comment');
});

// קבלת כל התגובות לפוסט מסוים
router.get('/post/:postId', (req, res) => {
    res.send(`Get all comments for post ID: ${req.params.postId}`);
});

// עדכון תגובה
router.put('/:id', (req, res) => {
    res.send(`Update comment with ID: ${req.params.id}`);
});

// מחיקת תגובה
router.delete('/:id', (req, res) => {
    res.send(`Delete comment with ID: ${req.params.id}`);
});

module.exports = router;
