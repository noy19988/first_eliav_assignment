declare global {
    namespace Express {
        interface Request {
            user?: { userId: string };
        }
    }
}

import { Request, Response } from 'express';
import Comment from '../models/comment';
import Post from '../models/post';
import User from '../models/user';
import mongoose from 'mongoose';

export const createComment = async (req: Request, res: Response): Promise<void> => {
    const { postId, content } = req.body;
    const userId = req.user?.userId;

    if (!content || content.trim() === '') {
        res.status(400).json({ message: 'Content is required' });
        return;
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ message: 'Invalid postId' });
        return;
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const newComment = new Comment({
            content,
            postId,
            author: userId,
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Error creating comment', error });
    }
};

export const getCommentsByPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = req.params.postId;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            res.status(400).json({ message: 'Invalid postId' });
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const comments = await Comment.find({ postId }).populate("author", "username imgUrl");
        res.status(200).json(comments);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        res.status(500).json({ error: errorMessage });
    }
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
        // בדיקה שה-ID תקין
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid comment ID' });
            return;
        }

        if (!req.body.content || req.body.content.trim() === '') {
            res.status(400).json({ message: 'Content is required' });
            return;
        }

        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        // בדיקה של הרשאות
        if (comment.author.toString() !== req.user?.userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        const updatedComment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
        // בדיקה שה-ID תקין
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid comment ID' });
            return;
        }

        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        // בדיקה של הרשאות
        if (comment.author.toString() !== req.user?.userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};