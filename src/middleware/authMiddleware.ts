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
        console.log('Authorization Header:', authHeader); // לוג נוסף לבדיקה

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(403).json({ message: 'Access denied. No token provided.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;

        req.user = decoded;
        next();
    } catch (err: unknown) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};


export default authMiddleware;
