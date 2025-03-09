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
 * 📌 שליפת כל הפרטים של מתכון לפי ID
 */
export const getRecipeDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const recipeId = parseInt(req.params.id, 10);
        if (isNaN(recipeId)) {
            res.status(400).json({ error: "Recipe ID must be a valid number." });
            return;
        }

        const recipeDetails = await fetchRecipeDetailsFromAPI(recipeId);
        res.json({ recipeDetails });
    } catch (error) {
        next(error);
    }
};
