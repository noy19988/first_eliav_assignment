"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        console.log("Saving a file in the uploads folder...");
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueFilename = Date.now() + path_1.default.extname(file.originalname);
        console.log("Saved file name:", uniqueFilename);
        cb(null, uniqueFilename);
    },
});
const upload = (0, multer_1.default)({ storage });
router.post("/upload", upload.single("file"), (req, res) => {
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
exports.default = router;
//# sourceMappingURL=fileRoutes.js.map