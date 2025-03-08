import mongoose from "mongoose";

export interface IPost extends mongoose.Document {
    recipeTitle: string;
    category: string[];
    imageUrl: string;
    difficulty: string;
    prepTime: number;
    ingredients: string[];
    instructions: string[];
    authorId: mongoose.Schema.Types.ObjectId;
    likes: number;
    comments: mongoose.Schema.Types.ObjectId[];
    savedBy: mongoose.Schema.Types.ObjectId[];
    createdAt: Date;
}

const postSchema = new mongoose.Schema<IPost>({
    recipeTitle: { type: String, required: true },
    category: { type: [String], required: true },
    imageUrl: { type: String },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    prepTime: { type: Number, required: true, min: 1 },
    ingredients: { type: [String], required: true },
    instructions: { type: [String], required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: { type: Number, default: 0, min: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model<IPost>("Post", postSchema);
export default Post;
