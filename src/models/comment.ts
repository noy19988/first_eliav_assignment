import mongoose from "mongoose";

// Interface לייצוג מסמך תגובה
export interface IComment extends Document {
    content: string;
    postId: mongoose.Schema.Types.ObjectId;
    author: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

// הגדרת הסכימה
const commentSchema = new mongoose.Schema<IComment>({
    content: {
        type: String,
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post', // קישור לפוסט שהתגובה שייכת לו
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // קישור למשתמש שיצר את התגובה
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// ייצוא המודל
const Comment=mongoose.model<IComment>("Comment",commentSchema);
export default Comment;
