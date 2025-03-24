"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var multer_1 = require("multer");
var path_1 = require("path");
var router = express_1.default.Router();
// 📌 הגדרת אחסון תמונות
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        console.log("📁 שמירת קובץ בתיקיית uploads...");
        cb(null, "public/uploads/"); // תיקיית העלאה
    },
    filename: function (req, file, cb) {
        var uniqueFilename = Date.now() + path_1.default.extname(file.originalname);
        console.log("📸 שם קובץ שנשמר:", uniqueFilename);
        cb(null, uniqueFilename);
    },
});
var upload = (0, multer_1.default)({ storage: storage });
// 📌 מסלול להעלאת תמונה בלבד
router.post("/upload", upload.single("file"), function (req, res) {
    console.log("📥 בקשה להעלאת תמונה התקבלה!");
    if (!req.file) {
        console.error("❌ לא הועלה קובץ!");
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
    console.log("✅ קובץ הועלה בהצלחה:", req.file.filename);
    var imageUrl = "".concat(req.protocol, "://").concat(req.get("host"), "/uploads/").concat(req.file.filename);
    res.status(200).json({ imageUrl: imageUrl });
});
exports.default = router;
