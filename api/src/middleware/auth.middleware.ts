import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as JwtPayloadType } from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        user_id: string;
        token: string;
    };
}

export interface JwtPayload {
    user_id: string;
    token: string;
}

export async function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Access token required' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_TOKEN || 'your_secret_key') as JwtPayload;

        req.user = { user_id: decoded.user_id, token: token }
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) res.status(401).json({ message: 'Invalid or expired token' });
        else res.status(500).json({ message: 'Internal server error' });
    }
}

export async function checkOwnership(req: AuthRequest, res: Response, next: NextFunction) {
    try {        
        const requestedUserId = req.params.user_id;

        if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    
        if (!requestedUserId) return res.status(400).json({ message: 'User ID parameter required' });
        if (req.user.user_id !== requestedUserId) return res.status(403).json({ message: 'Access denied: You can only access your own resources' });
        
        next();
    } catch (error) {
        res.status(500).json({ message: 'Ownership verification failed' })
    }
}