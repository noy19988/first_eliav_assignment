import mongoose from "mongoose";

// Interface לייצוג מסמך תגובה
export interface IComment extends mongoose.Document {
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
        validate: {
            validator: async function(postId: mongoose.Schema.Types.ObjectId) {
                const post = await mongoose.model('Post').findById(postId);
                return post != null; // לוודא שהפוסט קיים
            },
            message: 'Post not found',
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // קישור למשתמש שיצר את התגובה
        required: true,
        validate: {
            validator: async function(authorId: mongoose.Schema.Types.ObjectId) {
                const user = await mongoose.model('User').findById(authorId);
                return user != null; // לוודא שהמשתמש קיים
            },
            message: 'User not found',
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// ייצוא המודל
const Comment = mongoose.model<IComment>("Comment", commentSchema);
export default Comment;
