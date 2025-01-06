import mongoose from "mongoose";

// Interface לייצוג מסמך פוסט
export interface IPost{
    title: string;
    content: string;
    author: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

// הגדרת הסכימה
const postSchema =new mongoose.Schema<IPost>({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // קישור למשתמש שיצר את הפוסט
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// ייצוא המודל
const Post =mongoose.model<IPost>("Post",postSchema);
export default Post;

