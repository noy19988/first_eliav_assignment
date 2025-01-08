// הרחבת Request לאובייקט user
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

// יצירת תגובה חדשה
export const createComment = async (req: Request, res: Response): Promise<void> => {
    const { postId, content } = req.body;
    const userId = req.user?.userId;


    console.log('comment postid at func:', postId);
    console.log('comment content at func:', content);
    console.log('comment author at func:', userId);

    if (!content || content.trim() === '') {
        res.status(400).json({ message: 'Content is required' });
        return;
    }

    // בדוק אם ה-postId הוא אובייקט תקין של MongoDB
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

        // const user = await User.findById(userId);
        // if (!user) {
        //     res.status(404).json({ message: 'User not found' });
        //     return;
        // }

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



// קבלת תגובות לפי פוסט
export const getCommentsByPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = req.params.postId;
        console.log('inside the  getCommentsByPost function'); // לוג נוסף לבדיקה
        // בדוק אם הפוסט קיים
        const post = await Post.findById(postId);
        if (!post) {      
            res.status(404).json({ message: 'Post not found' });
            return; // יוצא מהפונקציה אם הפוסט לא נמצא
        }

        // חפש את התגובות לפוסט
        const comments = await Comment.find({ postId });
        
        if (comments.length === 0) {
            res.status(404).json({ message: 'No comments found' });
            return; // יוצא מהפונקציה אם אין תגובות
        }

        // החזר את התגובות
        res.status(200).json(comments);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        res.status(500).json({ error: errorMessage });
    }
};

// עדכון תגובה
export const updateComment = async (req: Request, res: Response): Promise<void> => {
    console.log('updatecomment function'); // לוג נוסף לבדיקה
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        // בדיקת אם המשתמש הוא בעל התגובה
        console.log('User from request:', req.user?.userId);  // לוג נוסף לבדוק את ה-userId
        console.log('Comment author ID:', comment.author.toString());  // לוג נוסף לבדוק את ה-author ID
        if (comment.author.toString() !== req.user?.userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }


         // בדיקת אם תוכן התגובה ריק
         if (!req.body.content || req.body.content.trim() === '') {
            res.status(400).json({ message: 'Content is required' });
            return;
        }

        // עדכון התגובה
        const updatedComment1 = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedComment1);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(400).json({ error });
    }
};

// מחיקת תגובה
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    console.log('deletecomment function'); // לוג נוסף לבדיקה
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }

        // בדיקת אם המשתמש הוא בעל התגובה
        console.log('User from request:', req.user?.userId);  // לוג נוסף לבדוק את ה-userId
        console.log('Comment author ID:', comment.author.toString());  // לוג נוסף לבדוק את ה-author ID
        if (comment.author.toString() !== req.user?.userId) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        // מחיקת התגובה
        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error });
    }

    
};
