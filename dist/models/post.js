"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// הגדרת הסכימה
const postSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User', // קישור למשתמש שיצר את הפוסט
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
// ייצוא המודל
const Post = mongoose_1.default.model("Post", postSchema);
exports.default = Post;
