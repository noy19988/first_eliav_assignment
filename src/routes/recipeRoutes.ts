import express from "express";
import asyncHandler from "express-async-handler";
import { searchRecipes, getRecipeDetails } from "../controllers/recipeController";

const router = express.Router();


router.get("/search", asyncHandler(searchRecipes));


router.get("/:id", asyncHandler(getRecipeDetails));

export default router;
