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

        const response = await axios.post<GeminiResponse>(apiUrl, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        let textResponse = response.data.candidates[0].content.parts[0].text;

        textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(textResponse); 

    } catch (error) {
        console.error("Error Gemini API:", error);
        return null;
    }
};

export default getNutritionalValues;
