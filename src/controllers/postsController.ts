import { Request, Response } from "express";
import Post from "../models/post";
import User from "../models/user";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

export const createPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { recipeTitle, category, difficulty, prepTime, ingredients, instructions } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        console.log("📥 יצירת פוסט חדש...");
        console.log("📂 קובץ שהתקבל:", req.file);

        let imageUrl = "";
        if (req.file) {
            imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
            console.log("✅ URL של התמונה שנשמר:", imageUrl);
        } else {
            console.log("⚠️ לא הועלתה תמונה!");
        }

        const newPost = new Post({
            recipeTitle,
            category: typeof category === "string" ? JSON.parse(category) : category,
            imageUrl, // 📌 לוודא שהתמונה נשמרת כראוי
            difficulty,
            prepTime: Number(prepTime),
            ingredients: typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients,
            instructions: typeof instructions === "string" ? JSON.parse(instructions) : instructions,
            authorId: userId,
        });

        await newPost.save();
        console.log("✅ פוסט נשמר בהצלחה:", newPost);

        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error("❌ שגיאה ביצירת פוסט:", error);
        res.status(500).json({ message: "Error creating post", error });
    }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(404).json({ message: "Invalid post ID" });
        return;
    }

    try {
        const post = await Post.findByIdAndUpdate(postId, req.body, { new: true });
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        res.status(200).json(post);
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(400).json({ message: "Error updating post", error });
    }
};

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find()
            .populate("authorId", "username imgUrl") // ✅ הוספת פרטי המשתמש (שם ותמונה)
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Error fetching posts", error });
    }
};


export const deletePost = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(404).json({ message: "Invalid post ID" });
        return;
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        // 🔥 מחיקת התמונה מהשרת אם קיימת
        if (post.imageUrl) {
            const imagePath = path.join(__dirname, "../../public/uploads", path.basename(post.imageUrl));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`🗑️ תמונה נמחקה: ${imagePath}`);
            } else {
                console.log(`⚠️ קובץ תמונה לא נמצא: ${imagePath}`);
            }
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: "Post and associated image deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Error deleting post", error });
    }
};

