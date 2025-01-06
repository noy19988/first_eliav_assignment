// הרחבת Request לאובייקט user
declare global {
    namespace Express {
        interface Request {
            user?: { userId: string };
        }
    }
}


import { Request, Response } from 'express';
import Comment, { IComment } from '../models/comment';
import Post from '../models/post';
import User from '../models/user';

// יצירת תגובה חדשה
export const createComment = async (req: Request, res: Response): Promise<void> => {
    const { postId, content } = req.body;
    const userId = req.user?.userId; // בהנחה ש-authMiddleware מגדיר userId ב-req.user

    try {
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const newComment = new Comment({
            content,
            postId,
            author: userId,
        });

        await newComment.save();
        res.status(201).json({ message: 'Comment created successfully', comment: newComment });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Error creating comment', error });
    }
};

// הוספת תגובה
export const addComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const comment = new Comment(req.body);
        await comment.save();
        res.status(201).send(comment);
    } catch (error) {
        res.status(400).send(error);
    }
};

// קבלת תגובות לפי פוסט
export const getCommentsByPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const comments = await Comment.find({ postId: req.params.postId });
        res.status(200).send(comments);
    } catch (error) {
        res.status(500).send(error);
    }
};

// עדכון תגובה
export const updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!comment) {
            res.status(404).send({ error: 'Comment not found' });
            return;
        }
        res.status(200).send(comment);
    } catch (error) {
        res.status(400).send(error);
    }
};

// מחיקת תגובה
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            res.status(404).send({ error: 'Comment not found' });
            return;
        }
        res.status(200).send({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).send(error);
    }
};
