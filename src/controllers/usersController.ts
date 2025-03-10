import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User, { IUser } from '../models/user';
import { OAuth2Client } from 'google-auth-library';
import path from "path";
import fs from "fs";



dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRET';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);






export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }

        const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            imgUrl: "https://example.com/default-profile.png", // 🔹 קישור לתמונה דיפולטיבית
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Error registering user', error: (error as Error).message });
    }
};


export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ message: 'No Google token provided' });
            return;
        }

        // אימות ה-token מול Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            res.status(400).json({ message: 'Invalid Google token' });
            return;
        }

        const { sub: googleId, email, name, picture } = payload;

        // חיפוש משתמש קיים לפי email
        let user = await User.findOne({ email });

        if (!user) {
            // יצירת משתמש חדש אם לא קיים
            user = new User({
                googleId,
                username: name,
                email,
                imgUrl: picture,
                password: await bcrypt.hash(googleId, 10), // יוצרים סיסמה רנדומלית על בסיס ה-Google ID
                refreshTokens: [],
            });
            await user.save();
        }

        // יצירת טוקנים
        const { token: accessToken, refreshToken } = generateTokens(user._id.toString());

        // שמירת ה-refresh token במערכת
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.status(200).json({
            message: 'Google Login successful',
            token: accessToken,
            refreshToken,
            userId: user._id,
            username: user.username,
            imgUrl: user.imgUrl,
        });
    } catch (error) {
        console.error('Google authentication failed:', error);
        if (error instanceof Error && error.message.includes('invalid')) {
            res.status(400).json({ message: 'Invalid Google token', error: (error as Error).message });
            return;
        }
        res.status(500).json({ message: 'Error authenticating with Google', error: (error as Error).message });
    }
};


const generateTokens = (userId: string): { token: string; refreshToken: string } => {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '3d' });
    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { token, refreshToken };
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(400).json({ message: 'Wrong password' });
            return;
        }

        const { token, refreshToken } = generateTokens(user._id.toString());
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.status(200).json({ message: 'Login successful', token, refreshToken, userId: user._id });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in', error: (error as Error).message });
    }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    console.log("logoutUser called");
    let refreshToken = req.headers['authorization']?.split(' ')[1];

    if (!refreshToken) {
        refreshToken = req.body.refreshToken;
    }

    try {
        console.log("refreshToken:", refreshToken);
        if (!refreshToken) {
            res.status(400).json({ message: 'Refresh token is required' });
            return;
        }

        const user = await User.findOne({ refreshTokens: refreshToken });
        if (!user) {
            res.status(404).json({ message: 'Invalid refresh token' });
            return;
        }

        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out', error: (error as Error).message });
    }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as jwt.JwtPayload;

        const user = await User.findById(decoded.userId);
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            res.status(403).json({ message: 'Invalid refresh token' });
            return;
        }

        const { token, refreshToken: newRefreshToken } = generateTokens(user._id.toString());
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        res.status(200).json({ token, refreshToken: newRefreshToken });
    } catch (err) {
        res.status(403).json({ message: 'Invalid refresh token', error: (err as Error).message });
    }
};



export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("🔹 Update user request received!");
        console.log("🔹 Full Request Body:", req.body);
        console.log("🔹 Uploaded File:", req.file);

        if (!req.file) {
            console.warn("⚠️ No file uploaded! Updating only username.");
        }

        const updates: any = {};

        if (req.body.username) updates.username = req.body.username;

        if (req.file) {
            const fileExt = path.extname(req.file.originalname);
            const newFileName = `${req.params.id}${fileExt}`;
            const uploadPath = path.join("public/uploads/", newFileName);

            const user = await User.findById(req.params.id);
            if (user?.imgUrl && user.imgUrl !== "https://example.com/default-profile.png") {
                const oldImagePath = path.join("public", user.imgUrl);
                if (fs.existsSync(oldImagePath)) {
                    try {
                        fs.unlinkSync(oldImagePath);
                    } catch (err) {
                        console.error("❌ Failed to delete old image:", err);
                    }
                }
            }

            fs.renameSync(req.file.path, uploadPath);
            updates.imgUrl = `${req.protocol}://${req.get('host')}/uploads/${newFileName}`;
            console.log("🔹 Saving image URL in DB:", updates.imgUrl);
        }

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ message: "No data provided for update" });
            return;
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");

        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user", error: (error as Error).message });
    }
};




export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: (error as Error).message });
    }
};

export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({
            _id: user._id, 
            username: user.username,
            email: user.email,  // ✅ הוספת email
            imgUrl: user.imgUrl
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user details', error });
    }
};

export default {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    updateUser,
    getUserDetails,
    deleteUser,
    googleLogin,

};