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
var axios_1 = require("axios");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var GEMINI_API_KEY = process.env.GEMINI_API_KEY;
var GEMINI_MODEL = "gemini-1.5-pro-002";
// 📌 פונקציה לשליפת מידע תזונתי
var getNutritionalValues = function (recipeTitle, ingredients, instructions) { return __awaiter(void 0, void 0, void 0, function () {
    var apiUrl, prompt_1, response, textResponse, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/".concat(GEMINI_MODEL, ":generateContent?key=").concat(GEMINI_API_KEY);
                prompt_1 = "\n            \u05D0\u05E0\u05D9 \u05E8\u05D5\u05E6\u05D4 \u05E9\u05EA\u05E0\u05EA\u05D7 \u05D0\u05EA \u05D4\u05DE\u05D9\u05D3\u05E2 \u05D4\u05EA\u05D6\u05D5\u05E0\u05EA\u05D9 \u05E9\u05DC \u05D4\u05DE\u05EA\u05DB\u05D5\u05DF \u05D4\u05D1\u05D0:\n            \u05E9\u05DD \u05D4\u05DE\u05EA\u05DB\u05D5\u05DF: ".concat(recipeTitle, "\n            \u05E8\u05E9\u05D9\u05DE\u05EA \u05DE\u05E8\u05DB\u05D9\u05D1\u05D9\u05DD: ").concat(ingredients.join(", "), "\n            \u05D0\u05D5\u05E4\u05DF \u05D4\u05DB\u05E0\u05D4: ").concat(instructions.join(". "), "\n            \n            \u05D0\u05E0\u05D9 \u05E6\u05E8\u05D9\u05DA \u05E9\u05EA\u05D7\u05D6\u05D9\u05E8 \u05DC\u05D9 **\u05E8\u05E7 \u05D0\u05D5\u05D1\u05D9\u05D9\u05E7\u05D8 JSON \u05E0\u05E7\u05D9** \u05D1\u05DC\u05D9 \u05E9\u05D5\u05DD \u05DE\u05DC\u05DC \u05E0\u05D5\u05E1\u05E3, \u05D1\u05E4\u05D5\u05E8\u05DE\u05D8 \u05D4\u05D1\u05D0:\n            {\n              \"calories\": \u05DE\u05E1\u05E4\u05E8 \u05E7\u05DC\u05D5\u05E8\u05D9\u05D5\u05EA \u05D1\u05DE\u05EA\u05DB\u05D5\u05DF \u05DB\u05D5\u05DC\u05D5,\n              \"protein\": \u05DB\u05DE\u05D5\u05EA \u05D7\u05DC\u05D1\u05D5\u05DF \u05D1\u05D2\u05E8\u05DE\u05D9\u05DD,\n              \"sugar\": \u05DB\u05DE\u05D5\u05EA \u05E1\u05D5\u05DB\u05E8 \u05D1\u05D2\u05E8\u05DE\u05D9\u05DD\n            }\n        ");
                return [4 /*yield*/, axios_1.default.post(apiUrl, {
                        contents: [{ parts: [{ text: prompt_1 }] }]
                    })];
            case 1:
                response = _a.sent();
                textResponse = response.data.candidates[0].content.parts[0].text;
                // 🔥 טיפול במקרה שהתשובה עטופה ב-```json ``` והסרתה
                textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
                return [2 /*return*/, JSON.parse(textResponse)]; // החזרת JSON מסודר
            case 2:
                error_1 = _a.sent();
                console.error("❌ שגיאה בקריאה ל-Gemini API:", error_1);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.default = getNutritionalValues;
