const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, // מזהה הפוסט שאליו שייכת התגובה
    content: { type: String, required: true }, // תוכן התגובה
    author: { type: String, required: true }, // כותב התגובה
    createdAt: { type: Date, default: Date.now }, // תאריך יצירה
});


module.exports = mongoose.model('Comment', commentSchema);
