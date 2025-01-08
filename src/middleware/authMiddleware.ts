import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

interface CustomJwtPayload extends JwtPayload {
    userId: string;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(403).json({ message: 'Access denied. No token provided.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;

        // הוסף את ה-userId ל-req.user
        req.user = { userId: decoded.userId };
        console.log('Decoded userId from token:', decoded.userId);
        next();
    } catch (err: unknown) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

export default authMiddleware;
