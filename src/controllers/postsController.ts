import { Request, Response } from 'express';
import Post, { IPost } from '../models/post';
import User from '../models/user';

// יצירת פוסט חדש
export const createPost = async (req: Request, res: Response): Promise<void> => {
    const { title, content } = req.body;
    const userId = req.user?.userId; // בהנחה ש-authMiddleware מגדיר userId ב-req.user

    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const newPost = new Post({
            title,
            content,
            author: userId,
        });

        await newPost.save();
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post', error });
    }
};

// הוספת פוסט
export const addPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = new Post(req.body);
        await post.save();
        res.status(201).send(post);
    } catch (error) {
        res.status(400).send(error);
    }
};

// קבלת כל הפוסטים
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sender } = req.query;

        if (sender) {
            const posts = await Post.find({ author: sender as string });
            if (posts.length === 0) {
                res.status(404).send({ message: `No posts found for sender: ${sender}` });
                return;
            }
            res.status(200).send(posts);
            return;
        }

        const posts = await Post.find();
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send({ error: (error as Error).message });


    }
};

// קבלת פוסט לפי ID
export const getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).send({ error: 'Post not found' });
            return;
        }
        res.status(200).send(post);
    } catch (error) {
        res.status(500).send(error);
    }
};

// עדכון פוסט
export const updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) {
            res.status(404).send({ error: 'Post not found' });
            return;
        }
        res.status(200).send(post);
    } catch (error) {
        res.status(400).send(error);
    }
};

// קבלת פוסטים לפי יוצר
export const getPostsBySender = async (req: Request, res: Response): Promise<void> => {
    const sender = req.params.sender;

    try {
        if (!sender) {
            res.status(400).send({ message: 'Sender query parameter is required' });
            return;
        }

        const posts = await Post.find({ author: sender });
        if (posts.length === 0) {
            res.status(404).send({ message: `No posts found for sender: ${sender}` });
            return;
        }

        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send({ error: (error as Error).message });
    }
};

// מחיקת פוסט
export const deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            res.status(404).send({ error: 'Post not found' });
            return;
        }
        res.status(200).send({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
};
