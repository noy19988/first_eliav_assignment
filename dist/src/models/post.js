"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    recipeTitle: { type: String, required: true },
    category: { type: [String], required: true },
    imageUrl: { type: String },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    prepTime: { type: Number, required: true, min: 1 },
    ingredients: { type: [String], required: true },
    instructions: { type: [String], required: true },
    authorId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    likes: { type: Number, default: 0, min: 0 },
    likedBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Comment" }],
    savedBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
});
const Post = mongoose_1.default.model("Post", postSchema);
exports.default = Post;
