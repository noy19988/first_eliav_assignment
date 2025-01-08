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

// קבלת כל הפוסטים
// export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
//     const { author, limit } = req.query;  // הכנס את הפרמטרים כראוי
//     console.log("Getting all posts - Author:", author, "Limit:", limit);
//     console.log("Full query parameters:", req.query);

//     try {
//         // אם יש author (למשל אם הוא לא ריק או undefined)
//         if (author) {
//             const posts = await Post.find({ author: author as string });
//             if (posts.length === 0) {
//                 console.log(`No posts found for author: ${author}`);
//                 res.status(404).json({ message: `No posts found for author: ${author}` });
//                 return;
//             }
//             res.status(200).json(posts);
//             return;
//         }

//         // אם אין author, תחזיר את כל הפוסטים
//         const posts = await Post.find().limit(Number(limit) || 10);  // ברירת מחדל ל-10 פוסטים
//         console.log(`Found ${posts.length} posts`);
//         res.status(200).json(posts);
//     } catch (error) {
//         console.error('Error fetching posts:', error);
//         res.status(500).json({ message: 'Error fetching posts', error });
//     }
// };

// // קבלת פוסט לפי ID
// export const getPostById = async (req: Request, res: Response): Promise<void> => {
//     const postId = req.params.id;

//     console.log("Getting post by ID at func:", postId);

//     // בדיקת תקינות ה-ID לפני ביצוע השאילתה
//     if (!mongoose.Types.ObjectId.isValid(postId)) {
//         res.status(400).json({ message: 'Invalid ID format' });
//         return;
//     }

//     try {
//         const post = await Post.findById(postId);
//         if (!post) {
//             res.status(404).json({ message: 'Post not found' });
//             return;
//         }
//         res.status(200).json(post);
//     } catch (error) {
//         console.error('Error fetching post:', error);
//         res.status(500).json({ message: 'Error fetching post', error });
//     }
// };

// קבלת פוסטים לפי שולח
// export const getPostsBySender = async (req: Request, res: Response): Promise<void> => {
//     const sender = req.params.sender;
//     console.log("Getting posts by sender at getPostsBySender:", sender);

//     // בדיקת תקינות ה-ID של השולח
//     if (!mongoose.Types.ObjectId.isValid(sender)) {
//         res.status(400).json({ message: 'Invalid sender ID format' });
//         return;
//     }

//     try {
//         // אם ה-ID תקני, מחפשים את הפוסטים של השולח
//         const posts = await Post.find({ author: sender });
//         if (posts.length === 0) {
//             res.status(404).json({ message: `No posts found for sender: ${sender}` });
//             return;
//         }

//         res.status(200).json(posts);
//     } catch (error) {
//         console.error('Error fetching posts by sender:', error);
//         res.status(500).json({ message: 'Error fetching posts by sender', error });
//     }
// };


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
