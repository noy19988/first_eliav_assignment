const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, // מזהה הפוסט שאליו שייכת התגובה
    content: { type: String, required: true },
    author: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now }, 
});


module.exports = mongoose.model('Comment', commentSchema);
