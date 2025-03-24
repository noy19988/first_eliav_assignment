"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    content: {
        type: String,
        required: true,
    },
    postId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        validate: {
            validator: function (postId) {
                return __awaiter(this, void 0, void 0, function* () {
                    const post = yield mongoose_1.default.model('Post').findById(postId);
                    return post != null;
                });
            },
            message: 'Post not found',
        }
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: function (authorId) {
                return __awaiter(this, void 0, void 0, function* () {
                    const user = yield mongoose_1.default.model('User').findById(authorId);
                    return user != null;
                });
            },
            message: 'User not found',
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Comment = mongoose_1.default.model("Comment", commentSchema);
exports.default = Comment;
//# sourceMappingURL=comment.js.map