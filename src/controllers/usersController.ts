import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User, { IUser } from '../models/user';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'JWT_REFRESH_SECRET';

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
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Error registering user', error: (error as Error).message });
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
    const refreshToken = req.headers['authorization']?.split(' ')[1];

    try {
        if (!refreshToken) {
            res.status(400).json({ message: 'Refresh token is required' });
            return 
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
    const { username, email, password } = req.body;

    const updates: any = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);

    if (Object.keys(updates).length === 0) {
        res.status(400).json({ message: 'At least one field must be provided for update' });
        return;
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: (error as Error).message });
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
        res.status(200).json(user);
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
};
