import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

interface AuthRequest extends Request {
    user?: {
        user_id: string;
        token: string;
    };
}

interface JwtPayload {
    id: string;
    email: string;
    username: string;
    token: string;
}

async function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Access token required' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_TOKEN || 'your-jwt-key') as JwtPayload;

        req.user = { user_id: decoded.id, token: token }
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) res.status(401).json({ message: 'Invalid or expired token' });
        else res.status(500).json({ message: 'Internal server error' });
    }
}

async function checkOwnership(req: AuthRequest, res: Response, next: NextFunction) {
    try {        
        const requestedUserId = req.params.id;
    
        if (!requestedUserId) return res.status(400).json({ message: 'User ID parameter required' });
        if (req.user?.user_id !== requestedUserId) return res.status(403).json({ message: 'Access denied: You can only access your own resources' });
        
        next();
    } catch (error) {
        res.status(500).json({ message: 'Ownership verification failed' })
    }
}

export { checkOwnership, verifyToken }