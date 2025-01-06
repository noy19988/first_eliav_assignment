import mongoose, { Types } from "mongoose";

// Interface לייצוג מסמך משתמש
export interface IUser{
    _id:string 
    username: string;
    email: string;
    password: string;
    refreshTokens: string[];
    createdAt: Date;
}

// הגדרת הסכימה
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

// ייצוא המודל
const User =mongoose.model<IUser>("User",userSchema);
export default User;
