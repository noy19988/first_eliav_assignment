"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const recipeController_1 = require("../controllers/recipeController");
const router = express_1.default.Router();
/**
 * 📌 חיפוש מתכונים לפי שם
 */
router.get("/search", (0, express_async_handler_1.default)(recipeController_1.searchRecipes));
/**
 * 📌 שליפת כל הפרטים של מתכון לפי ID
 */
router.get("/:id", (0, express_async_handler_1.default)(recipeController_1.getRecipeDetails));
exports.default = router;
//# sourceMappingURL=recipeRoutes.js.map