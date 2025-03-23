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
exports.getPostNutrition = void 0;
const post_1 = __importDefault(require("../models/post"));
const geminiService_1 = __importDefault(require("../docs/geminiService")); // 📌 חיבור ל-Gemini
const getPostNutrition = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.id;
        // 🔹 בדיקה שה-ID תקין
        if (!postId) {
            res.status(400).json({ message: "Post ID is required" });
            return;
        }
        // 🔹 חיפוש הפוסט במסד הנתונים
        const post = yield post_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        // 🔥 קריאה ל-Gemini לקבלת מידע תזונתי
        const nutritionalData = yield (0, geminiService_1.default)(post.recipeTitle, post.ingredients, post.instructions);
        if (!nutritionalData) {
            res.status(500).json({ message: "Failed to fetch nutritional values" });
            return;
        }
        res.status(200).json(nutritionalData);
    }
    catch (error) {
        console.error("❌ שגיאה בשליפת מידע תזונתי:", error);
        res.status(500).json({ message: "Error fetching nutritional values", error });
    }
});
exports.getPostNutrition = getPostNutrition;
