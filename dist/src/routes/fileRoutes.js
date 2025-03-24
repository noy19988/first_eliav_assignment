"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// 📌 הגדרת אחסון תמונות
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        console.log("📁 שמירת קובץ בתיקיית uploads...");
        cb(null, "public/uploads/"); // תיקיית העלאה
    },
    filename: (req, file, cb) => {
        const uniqueFilename = Date.now() + path_1.default.extname(file.originalname);
        console.log("📸 שם קובץ שנשמר:", uniqueFilename);
        cb(null, uniqueFilename);
    },
});
const upload = (0, multer_1.default)({ storage });
// 📌 מסלול להעלאת תמונה בלבד
router.post("/upload", upload.single("file"), (req, res) => {
    console.log("📥 בקשה להעלאת תמונה התקבלה!");
    if (!req.file) {
        console.error("❌ לא הועלה קובץ!");
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
    console.log("✅ קובץ הועלה בהצלחה:", req.file.filename);
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});
exports.default = router;
//# sourceMappingURL=fileRoutes.js.map