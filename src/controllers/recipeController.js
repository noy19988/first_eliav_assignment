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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecipeDetails = exports.searchRecipes = void 0;
var recipeApi_1 = require("../docs/recipeApi");
/**
 * 📌 חיפוש מתכונים לפי שם
 */
var searchRecipes = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var query, recipes, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                query = req.query.query;
                if (!query || query.trim().length === 0) {
                    res.status(400).json({ error: "Query parameter is required and must be a non-empty string." });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, recipeApi_1.fetchRecipesFromAPI)(query)];
            case 1:
                recipes = _a.sent();
                res.json({ recipes: recipes });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.searchRecipes = searchRecipes;
/**
 * 📌 שליפת כל הפרטים של מתכון לפי IDn
 */
var getRecipeDetails = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var recipeId, recipeDetails, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                recipeId = parseInt(req.params.id, 10);
                if (isNaN(recipeId)) {
                    res.status(400).json({ error: "Recipe ID must be a valid number." });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, recipeApi_1.fetchRecipeDetailsFromAPI)(recipeId)];
            case 1:
                recipeDetails = _a.sent();
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
                recipeDetails.extendedIngredients.forEach(function (ingredient) {
                    console.log("- ".concat(ingredient.name, ": ").concat(ingredient.amount, " ").concat(ingredient.unit));
                });
                // הדפסת תזונה אם קיימת
                if (recipeDetails.nutrition) {
                    console.log("Nutrition:");
                    recipeDetails.nutrition.nutrients.forEach(function (nutrient) {
                        console.log("".concat(nutrient.name, ": ").concat(nutrient.amount, " ").concat(nutrient.unit));
                    });
                }
                else {
                    console.log("No nutrition information available.");
                }
                // שליחת המידע חזרה ל-Frontend
                res.json({ recipeDetails: recipeDetails });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getRecipeDetails = getRecipeDetails;
