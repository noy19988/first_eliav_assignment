"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// הגדרת הסכימה
const commentSchema = new mongoose_1.default.Schema({
    content: {
        type: String,
        required: true,
    },
    postId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Post', // קישור לפוסט שהתגובה שייכת לו
        required: true,
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User', // קישור למשתמש שיצר את התגובה
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
// ייצוא המודל
const Comment = mongoose_1.default.model("Comment", commentSchema);
exports.default = Comment;
