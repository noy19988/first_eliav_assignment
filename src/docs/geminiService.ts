import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-pro-002";

interface GeminiResponse {
    candidates: {
        content: {
            parts: {
                text: string;
            }[];
        };
    }[];
}

// 📌 פונקציה לשליפת מידע תזונתי
const getNutritionalValues = async (recipeTitle: string, ingredients: string[], instructions: string[]): Promise<{ calories: number; protein: number; sugar: number } | null> => {
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
        const response = await axios.post<GeminiResponse>(apiUrl, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        // ✅ שליפת התשובה מ-Gemini API
        let textResponse = response.data.candidates[0].content.parts[0].text;

        // 🔥 טיפול במקרה שהתשובה עטופה ב-```json ``` והסרתה
        textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(textResponse); // החזרת JSON מסודר

    } catch (error) {
        console.error("❌ שגיאה בקריאה ל-Gemini API:", error);
        return null;
    }
};

export default getNutritionalValues;
