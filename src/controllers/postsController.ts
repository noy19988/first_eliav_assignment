import { Request, Response } from 'express';
import Post from '../models/post';
import User from '../models/user';
import mongoose from 'mongoose';

// יצירת פוסט חדש
export const createPost = async (req: Request, res: Response): Promise<void> => {
    const { title, content } = req.body;
    const userId = req.user?.userId;

    console.log("Creating post - Request body:", req.body);

    if (!title || !content) {
        console.log("Title or content missing.");
        res.status(400).json({ message: 'Title and Content are required' });
        return;  // סיים את הפונקציה אחרי שליחת תשובה
    }

    try {
        console.log("Looking for user with ID:", userId);
        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found with ID:", userId);
            res.status(404).json({ message: 'User not found' });
            return;  // סיים את הפונקציה אחרי שליחת תשובה
        }

        const newPost = new Post({
            title,
            content,
            author: userId,
        });

        await newPost.save();
        console.log("Post created with ID:", newPost._id);
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post', error });
    }
};

// עדכון פוסט
export const updatePost = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(404).json({ message: 'Post not found' }); // החזר 404 אם ה-ID לא תקני
        return;
    }

    try {
        const post = await Post.findByIdAndUpdate(postId, req.body, { new: true });
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(400).json({ message: 'Invalid post ID or other error', error });
        return;
    }
};

// מחיקת פוסט
export const deletePost = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(404).json({ message: 'Post not found' }); // החזר 404 אם ה-ID לא תקני
        return;
    }

    try {
        const post = await Post.findByIdAndDelete(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post', error });
    }
};
