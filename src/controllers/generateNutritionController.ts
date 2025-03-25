import { Request, Response } from "express";
import Post from "../models/post";
import getNutritionalValues from "../docs/geminiService"; // Gemini




export const getPostNutrition = async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = req.params.id;

        
        if (!postId) {
            res.status(400).json({ message: "Post ID is required" });
            return;
        }

      
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        
        const nutritionalData = await getNutritionalValues(post.recipeTitle, post.ingredients, post.instructions);

        if (!nutritionalData) {
            res.status(500).json({ message: "Failed to fetch nutritional values" });
            return;
        }

        res.status(200).json(nutritionalData);

    } catch (error) {
        console.error("Error retrieving nutritional information:", error);
        res.status(500).json({ message: "Error fetching nutritional values", error });
    }
};

