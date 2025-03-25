import { Request, Response } from "express";
import Post from "../models/post";
import User from "../models/user";
import mongoose from "mongoose";
import { IPost } from "../models/post"; 
import getNutritionalValues from "../docs/geminiService"; 
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

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        console.log("Create a new post...");
        console.log("File received:", req.file);

        let imageUrl = "";
        if (req.file) {
            imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
            console.log("URL of the saved image:", imageUrl);
        } else {
            console.log("No image uploaded!");
        }

        const newPost = new Post({
            recipeTitle,
            category: typeof category === "string" ? JSON.parse(category) : category,
            imageUrl, 
            difficulty,
            prepTime: Number(prepTime),
            ingredients: typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients,
            instructions: typeof instructions === "string" ? JSON.parse(instructions) : instructions,
            authorId: userId,
        });

        await newPost.save();
        console.log("Post saved successfully:", newPost);

        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error("Error creating post:", error);
      
        if (error instanceof Error && error.name === 'ValidationError') {
          res.status(400).json({ message: 'Validation error', error });
        } else {
          res.status(500).json({ message: "Error creating post", error });
        }
      }
      
      
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    console.log("Post update with ID:", postId);

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ message: "Invalid post ID" });
        return;
    }

    try {
        let post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        console.log("Request data received:", req.body);

        let imageUrl = post.imageUrl;
        if (req.file) {
            if (imageUrl) {
                const imagePath = path.join(__dirname, "../../public/uploads", path.basename(imageUrl));
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`Old photo deleted:${imagePath}`);
                }
            }
            imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        const updates: Partial<IPost> = {
            recipeTitle: req.body.recipeTitle || post.recipeTitle,
            category: req.body.category ? (typeof req.body.category === "string" ? JSON.parse(req.body.category) : req.body.category) : post.category,
            imageUrl: req.file ? imageUrl : post.imageUrl,
            difficulty: req.body.difficulty || post.difficulty,
            prepTime: req.body.prepTime ? Number(req.body.prepTime) : post.prepTime,
            ingredients: req.body.ingredients ? (typeof req.body.ingredients === "string" ? JSON.parse(req.body.ingredients) : req.body.ingredients) : post.ingredients,
            instructions: req.body.instructions ? (typeof req.body.instructions === "string" ? JSON.parse(req.body.instructions) : req.body.instructions) : post.instructions
        };

        const mongoUpdates: any = {};

        if (req.body.liked !== undefined) {
            const userId = req.user?.userId;
            if (userId) {
                if (req.body.liked) {
                    mongoUpdates.$addToSet = { likedBy: userId };
                    mongoUpdates.$inc = { likes: 1 };
                } else {
                    mongoUpdates.$pull = { likedBy: userId };
                    mongoUpdates.$inc = { likes: -1 };
                }
            }
        }

        if (req.body.saved !== undefined) {
            const userId = req.user?.userId;
            if (userId) {
                if (req.body.saved) {
                    mongoUpdates.$addToSet = { savedBy: userId };
                } else {
                    mongoUpdates.$pull = { savedBy: userId };
                }
            }
        }

        console.log("Data sent for update:", updates, mongoUpdates);

        const updatedPost = await Post.findByIdAndUpdate(postId, { ...updates, ...mongoUpdates }, { new: true, runValidators: true });

        if (!updatedPost) {
            res.status(500).json({ message: "Failed to update post" });
            return;
        }

        console.log("Post updated successfully:", updatedPost);
        res.status(200).json({ message: "Post updated successfully", post: updatedPost });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Error updating post", error });
    }
};



export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find()
            .populate("authorId", "username imgUrl") 
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

        if (post.imageUrl) {
            const imagePath = path.join(__dirname, "../../public/uploads", path.basename(post.imageUrl));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`Image deleted:${imagePath}`);
            } else {
                console.log(`Post not found: ${imagePath}`);
            }
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: "Post and associated image deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Error deleting post", error });
    }
};


export const savePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = req.params.id;
        const userId = req.user?.userId;

        
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        try {
            const post = await Post.findById(postId);
            if (!post) {
                res.status(404).json({ message: "Post not found" });
                return;
            }

            const userIdObjectId = new mongoose.Types.ObjectId(userId);

            const isSaved = post.savedBy.some((id) => id.toString() === userId);

            if (isSaved) {
                post.savedBy = post.savedBy.filter((id) => id.toString() !== userId);
            } else {
                post.savedBy.push(userIdObjectId as unknown as mongoose.Schema.Types.ObjectId);
            }

            await post.save();

            res.status(200).json({ message: isSaved ? "Post unsaved" : "Post saved" });
        } catch (error: any) {
            if (error.name === "CastError") {
                res.status(404).json({ message: "Post not found" });
            } else {
                console.error("Error saving/unsaving post:", error);
                res.status(500).json({ message: "Error saving/unsaving post", error });
            }
        }
    } catch (error) {
        console.error("Error saving/unsaving post:", error);
        res.status(500).json({ message: "Error saving/unsaving post", error });
    }
};

  export const getPostsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }

        const posts = await Post.find({ authorId: userId })
            .populate("authorId", "username imgUrl")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({ message: "Error fetching user posts", error });
    }
};



export const searchAndFilterPosts = async (req: Request, res: Response) => {
    try {
        const { search, difficulty, category } = req.query;

        let query: any = {};

        if (search) {
            const searchRegex = new RegExp(search as string, 'i');
            query.$or = [
                { recipeTitle: { $regex: searchRegex } },
                { ingredients: { $regex: searchRegex } },
                { instructions: { $regex: searchRegex } }
            ];
        }

        if (difficulty && typeof difficulty === 'string') {
            const normalizedDifficulty = difficulty.toLowerCase().trim();
            if (['easy', 'medium', 'hard'].includes(normalizedDifficulty)) {
                query.difficulty = normalizedDifficulty;
            } else {
                console.warn(`Difficulty level value is not legal: ${difficulty}`);
            }
        }

        if (category) {
            const categories = (category as string).split(',').map(cat => cat.trim());
            query.category = { $in: categories };
        }

        const posts = await Post.find(query)
            .populate("authorId", "username imgUrl")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error searching and filtering posts:", error);
        res.status(500).json({ message: "Error searching and filtering posts", error });
    }
};



export const getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: "Error fetching post", error });
    }
};





