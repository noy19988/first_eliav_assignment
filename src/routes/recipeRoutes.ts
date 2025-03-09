import express from "express";
import asyncHandler from "express-async-handler";
import { searchRecipes, getRecipeDetails } from "../controllers/recipeController";

const router = express.Router();

/**
 * 📌 חיפוש מתכונים לפי שם
 */
router.get("/search", asyncHandler(searchRecipes));

/**
 * 📌 שליפת כל הפרטים של מתכון לפי ID
 */
router.get("/:id", asyncHandler(getRecipeDetails));

export default router;
