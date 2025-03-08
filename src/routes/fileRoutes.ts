import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// 📌 הגדרת אחסון תמונות
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📁 שמירת קובץ בתיקיית uploads...");
    cb(null, "public/uploads/"); // תיקיית העלאה
  },
  filename: (req, file, cb) => {
    const uniqueFilename = Date.now() + path.extname(file.originalname);
    console.log("📸 שם קובץ שנשמר:", uniqueFilename);
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage });

// 📌 מסלול להעלאת תמונה בלבד
router.post("/upload", upload.single("file"), (req: Request, res: Response): void => {
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

export default router;


