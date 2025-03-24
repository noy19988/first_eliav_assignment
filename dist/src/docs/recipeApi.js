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
exports.fetchRecipeDetailsFromAPI = exports.fetchRecipesFromAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = "https://api.spoonacular.com/recipes";
/**
 * 📌 מבצע חיפוש מתכונים לפי שם
 */
const fetchRecipesFromAPI = (query) => __awaiter(void 0, void 0, void 0, function* () {
    if (!API_KEY) {
        throw new Error("Spoonacular API Key is missing. Please set SPOONACULAR_API_KEY in your .env file.");
    }
    try {
        const response = yield axios_1.default.get(`${BASE_URL}/complexSearch`, {
            params: {
                query,
                number: 10,
                apiKey: API_KEY,
            },
        });
        return response.data.results.map((recipe) => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
        }));
    }
    catch (error) {
        console.error("❌ Error fetching recipes from Spoonacular API:", error);
        throw new Error("Failed to fetch recipes.");
    }
});
exports.fetchRecipesFromAPI = fetchRecipesFromAPI;
/**
 * 📌 מביא את כל הפרטים של מתכון לפי `id`
 */
const fetchRecipeDetailsFromAPI = (recipeId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!API_KEY) {
        throw new Error("Spoonacular API Key is missing. Please set SPOONACULAR_API_KEY in your .env file.");
    }
    try {
        const response = yield axios_1.default.get(`${BASE_URL}/${recipeId}/information`, {
            params: { apiKey: API_KEY },
        });
        const data = response.data;
        return {
            id: data.id,
            title: data.title,
            image: data.image,
            readyInMinutes: data.readyInMinutes,
            servings: data.servings,
            summary: data.summary,
            instructions: data.instructions,
            extendedIngredients: data.extendedIngredients.map((ing) => ({
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit,
            })),
            nutrition: data.nutrition || null,
        };
    }
    catch (error) {
        console.error("❌ Error fetching recipe details from Spoonacular API:", error);
        throw new Error("Failed to fetch recipe details.");
    }
});
exports.fetchRecipeDetailsFromAPI = fetchRecipeDetailsFromAPI;
//# sourceMappingURL=recipeApi.js.map