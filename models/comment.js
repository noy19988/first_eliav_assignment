const mongoose = require('mongoose');

// הגדרת הסכמה לתגובה
const commentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, // מזהה הפוסט שאליו שייכת התגובה
    content: { type: String, required: true }, // תוכן התגובה
    author: { type: String, required: true }, // כותב התגובה
    createdAt: { type: Date, default: Date.now }, // תאריך יצירה
});

// ייצוא המודל
module.exports = mongoose.model('Comment', commentSchema);
