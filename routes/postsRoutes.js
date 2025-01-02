const express = require('express');
const router = express.Router();

// דוגמאות לנתיבים:

// הוספת פוסט חדש
router.post('/', (req, res) => {
    res.send('Add a new post');
});

// קבלת כל הפוסטים
router.get('/', (req, res) => {
    res.send('Get all posts');
});

// קבלת פוסט לפי מזהה
router.get('/:id', (req, res) => {
    res.send(`Get post with ID: ${req.params.id}`);
});

// עדכון פוסט
router.put('/:id', (req, res) => {
    res.send(`Update post with ID: ${req.params.id}`);
});

// חיפוש פוסטים לפי שולח
router.get('/search', (req, res) => {
    const sender = req.query.sender;
    res.send(`Get posts by sender: ${sender}`);
});

module.exports = router;
