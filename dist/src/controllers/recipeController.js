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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecipeDetails = exports.searchRecipes = void 0;
const recipeApi_1 = require("../docs/recipeApi");
/**
 * 📌 חיפוש מתכונים לפי שם
 */
const searchRecipes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.query;
        if (!query || query.trim().length === 0) {
            res.status(400).json({ error: "Query parameter is required and must be a non-empty string." });
            return;
        }
        const recipes = yield (0, recipeApi_1.fetchRecipesFromAPI)(query);
        res.json({ recipes });
    }
    catch (error) {
        next(error);
    }
});
exports.searchRecipes = searchRecipes;
/**
 * 📌 שליפת כל הפרטים של מתכון לפי ID
 */
const getRecipeDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recipeId = parseInt(req.params.id, 10);
        if (isNaN(recipeId)) {
            res.status(400).json({ error: "Recipe ID must be a valid number." });
            return;
        }
        const recipeDetails = yield (0, recipeApi_1.fetchRecipeDetailsFromAPI)(recipeId);
        // הדפסת כל פרמטרי המתכון
        console.log("Fetched recipe details:");
        console.log("Title:", recipeDetails.title);
        console.log("Image:", recipeDetails.image);
        console.log("Ready in minutes:", recipeDetails.readyInMinutes);
        console.log("Servings:", recipeDetails.servings);
        console.log("Summary:", recipeDetails.summary);
        console.log("Instructions:", recipeDetails.instructions);
        // הדפסת רכיבים
        console.log("Ingredients:");
        recipeDetails.extendedIngredients.forEach(ingredient => {
            console.log(`- ${ingredient.name}: ${ingredient.amount} ${ingredient.unit}`);
        });
        // הדפסת תזונה אם קיימת
        if (recipeDetails.nutrition) {
            console.log("Nutrition:");
            recipeDetails.nutrition.nutrients.forEach(nutrient => {
                console.log(`${nutrient.name}: ${nutrient.amount} ${nutrient.unit}`);
            });
        }
        else {
            console.log("No nutrition information available.");
        }
        // שליחת המידע חזרה ל-Frontend
        res.json({ recipeDetails });
    }
    catch (error) {
        next(error);
    }
});
exports.getRecipeDetails = getRecipeDetails;
