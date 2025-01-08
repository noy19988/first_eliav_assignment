import mongoose from "mongoose";

export interface IPost{
    title: string;
    content: string;
    author: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

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
        ref: 'User', 
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Post =mongoose.model<IPost>("Post",postSchema);
export default Post;

