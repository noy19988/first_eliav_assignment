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
        validate: {
            validator: async function (postId) {
                const post = await mongoose_1.default.model('Post').findById(postId);
                return post != null; // לוודא שהפוסט קיים
            },
            message: 'Post not found',
        }
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User', // קישור למשתמש שיצר את התגובה
        required: true,
        validate: {
            validator: async function (authorId) {
                const user = await mongoose_1.default.model('User').findById(authorId);
                return user != null; // לוודא שהמשתמש קיים
            },
            message: 'User not found',
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
// ייצוא המודל
const Comment = mongoose_1.default.model("Comment", commentSchema);
exports.default = Comment;
