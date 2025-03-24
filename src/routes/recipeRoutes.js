"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var express_async_handler_1 = require("express-async-handler");
var recipeController_1 = require("../controllers/recipeController");
var router = express_1.default.Router();
/**
 * 📌 חיפוש מתכונים לפי שם
 */
router.get("/search", (0, express_async_handler_1.default)(recipeController_1.searchRecipes));
/**
 * 📌 שליפת כל הפרטים של מתכון לפי ID
 */
router.get("/:id", (0, express_async_handler_1.default)(recipeController_1.getRecipeDetails));
exports.default = router;
