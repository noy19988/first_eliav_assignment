import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Saving a file in the uploads folder...");
    cb(null, "public/uploads/"); 
  },
  filename: (req, file, cb) => {
    const uniqueFilename = Date.now() + path.extname(file.originalname);
    console.log("Saved file name:", uniqueFilename);
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req: Request, res: Response): void => {
  console.log("Request to upload a photo has been received!");

  if (!req.file) {
    console.error("No file uploaded!");
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  console.log("File uploaded successfully:", req.file.filename);
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

export default router;