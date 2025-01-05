const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post', // קישור לפוסט שהתגובה שייכת לו
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // קישור למשתמש שיצר את התגובה
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Comment', commentSchema);
