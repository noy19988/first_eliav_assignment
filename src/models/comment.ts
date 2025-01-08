import mongoose from "mongoose";

export interface IComment extends mongoose.Document {
    content: string;
    postId: mongoose.Schema.Types.ObjectId;
    author: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

const commentSchema = new mongoose.Schema<IComment>({
    content: {
        type: String,
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post', 
        required: true,
        validate: {
            validator: async function(postId: mongoose.Schema.Types.ObjectId) {
                const post = await mongoose.model('Post').findById(postId);
                return post != null;
            },
            message: 'Post not found',
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
        validate: {
            validator: async function(authorId: mongoose.Schema.Types.ObjectId) {
                const user = await mongoose.model('User').findById(authorId);
                return user != null; 
            },
            message: 'User not found',
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = mongoose.model<IComment>("Comment", commentSchema);
export default Comment;
