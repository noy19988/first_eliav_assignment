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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getCommentsByPost = exports.createComment = void 0;
var comment_1 = require("../models/comment");
var post_1 = require("../models/post");
var mongoose_1 = require("mongoose");
var createComment = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, postId, content, userId, post, newComment, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, postId = _a.postId, content = _a.content;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
                if (!content || content.trim() === '') {
                    res.status(400).json({ message: 'Content is required' });
                    return [2 /*return*/];
                }
                if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
                    res.status(400).json({ message: 'Invalid postId' });
                    return [2 /*return*/];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 4, , 5]);
                return [4 /*yield*/, post_1.default.findById(postId)];
            case 2:
                post = _c.sent();
                if (!post) {
                    res.status(404).json({ message: 'Post not found' });
                    return [2 /*return*/];
                }
                newComment = new comment_1.default({
                    content: content,
                    postId: postId,
                    author: userId,
                });
                return [4 /*yield*/, newComment.save()];
            case 3:
                _c.sent();
                res.status(201).json(newComment);
                return [3 /*break*/, 5];
            case 4:
                error_1 = _c.sent();
                console.error('Error creating comment:', error_1);
                res.status(500).json({ message: 'Error creating comment', error: error_1 });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.createComment = createComment;
var getCommentsByPost = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var postId, post, comments, error_2, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                postId = req.params.postId;
                if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
                    res.status(400).json({ message: 'Invalid postId' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, post_1.default.findById(postId)];
            case 1:
                post = _a.sent();
                if (!post) {
                    res.status(404).json({ message: 'Post not found' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, comment_1.default.find({ postId: postId }).populate("author", "username imgUrl")];
            case 2:
                comments = _a.sent();
                res.status(200).json(comments);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                errorMessage = error_2 instanceof Error ? error_2.message : 'Server error';
                res.status(500).json({ error: errorMessage });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getCommentsByPost = getCommentsByPost;
var updateComment = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var comment, updatedComment, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                // בדיקה שה-ID תקין
                if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
                    res.status(400).json({ message: 'Invalid comment ID' });
                    return [2 /*return*/];
                }
                if (!req.body.content || req.body.content.trim() === '') {
                    res.status(400).json({ message: 'Content is required' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, comment_1.default.findById(req.params.id)];
            case 1:
                comment = _b.sent();
                if (!comment) {
                    res.status(404).json({ error: 'Comment not found' });
                    return [2 /*return*/];
                }
                // בדיקה של הרשאות
                if (comment.author.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                    res.status(403).json({ message: 'Unauthorized' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, comment_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true })];
            case 2:
                updatedComment = _b.sent();
                res.status(200).json(updatedComment);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                console.error('Error updating comment:', error_3);
                res.status(500).json({ error: 'Server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateComment = updateComment;
var deleteComment = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var comment, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                // בדיקה שה-ID תקין
                if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
                    res.status(400).json({ message: 'Invalid comment ID' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, comment_1.default.findById(req.params.id)];
            case 1:
                comment = _b.sent();
                if (!comment) {
                    res.status(404).json({ error: 'Comment not found' });
                    return [2 /*return*/];
                }
                // בדיקה של הרשאות
                if (comment.author.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                    res.status(403).json({ message: 'Unauthorized' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, comment_1.default.findByIdAndDelete(req.params.id)];
            case 2:
                _b.sent();
                res.status(200).json({ message: 'Comment deleted' });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                console.error('Error deleting comment:', error_4);
                res.status(500).json({ error: 'Server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deleteComment = deleteComment;
