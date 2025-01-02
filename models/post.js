const mongoose = require('mongoose');

// הגדרת הסכמה לפוסט
const postSchema = new mongoose.Schema({
    title: { type: String, required: true }, // כותרת הפוסט
    content: { type: String, required: true }, // תוכן הפוסט
    sender: { type: String, required: true }, // שולח הפוסט
    createdAt: { type: Date, default: Date.now }, // תאריך יצירה
});

// ייצוא המודל
module.exports = mongoose.model('Post', postSchema);
