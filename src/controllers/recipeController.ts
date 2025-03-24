import { Request, Response, NextFunction } from "express";
import { fetchRecipesFromAPI, fetchRecipeDetailsFromAPI } from "../docs/recipeApi";

/**
 * 📌 חיפוש מתכונים לפי שם
 */
export const searchRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const query = req.query.query as string;
        if (!query || query.trim().length === 0) {
            res.status(400).json({ error: "Query parameter is required and must be a non-empty string." });
            return;
        }

        const recipes = await fetchRecipesFromAPI(query);
        res.json({ recipes });
    } catch (error) {
        next(error);
    }
};

/**
 * 📌 שליפת כל הפרטים של מתכון לפי IDn
 */
export const getRecipeDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipeId = parseInt(req.params.id, 10);
      if (isNaN(recipeId)) {
        res.status(400).json({ error: "Recipe ID must be a valid number." });
        return;
      }
  
      const recipeDetails = await fetchRecipeDetailsFromAPI(recipeId);
  
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
      } else {
        console.log("No nutrition information available.");
      }
  
      // שליחת המידע חזרה ל-Frontend
      res.json({ recipeDetails });
    } catch (error) {
      next(error);
    }
  };
  
