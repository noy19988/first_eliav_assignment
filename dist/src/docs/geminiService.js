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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-pro-002";
// 📌 פונקציה לשליפת מידע תזונתי
const getNutritionalValues = (recipeTitle, ingredients, instructions) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        const prompt = `
            אני רוצה שתנתח את המידע התזונתי של המתכון הבא:
            שם המתכון: ${recipeTitle}
            רשימת מרכיבים: ${ingredients.join(", ")}
            אופן הכנה: ${instructions.join(". ")}
            
            אני צריך שתחזיר לי **רק אובייקט JSON נקי** בלי שום מלל נוסף, בפורמט הבא:
            {
              "calories": מספר קלוריות במתכון כולו,
              "protein": כמות חלבון בגרמים,
              "sugar": כמות סוכר בגרמים
            }
        `;
        // 📌 שליחת הבקשה ל-Gemini API
        const response = yield axios_1.default.post(apiUrl, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        // ✅ שליפת התשובה מ-Gemini API
        let textResponse = response.data.candidates[0].content.parts[0].text;
        // 🔥 טיפול במקרה שהתשובה עטופה ב-```json ``` והסרתה
        textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(textResponse); // החזרת JSON מסודר
    }
    catch (error) {
        console.error("❌ שגיאה בקריאה ל-Gemini API:", error);
        return null;
    }
});
exports.default = getNutritionalValues;
