import mongoose, { Types } from "mongoose";

export interface IUser{
    _id:string 
    username: string;
    email: string;
    password: string;
    refreshTokens: string[];
    createdAt: Date;
}

const userSchema =new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshTokens: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User =mongoose.model<IUser>("User",userSchema);
export default User;
