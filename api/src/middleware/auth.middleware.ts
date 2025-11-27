import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as JwtPayloadType } from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

interface AuthRequest extends Request {
    user?: {
        id: string; 
        email: string;
        username: string;
    };
}

interface CustomJwtPayload extends JwtPayloadType {
    id: string;
    email: string;
    username: string;
}

const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        // Periksa apakah header authorization ada dan berformat Bearer
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Access token required' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Verifikasi token
        let decoded: string | JwtPayloadType;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'jwt token');
        } catch (verifyError) {
            if (verifyError instanceof jwt.TokenExpiredError) {
                res.status(401).json({ message: 'Token expired' });
            } else if (verifyError instanceof jwt.JsonWebTokenError) {
                res.status(401).json({ message: 'Invalid token' });
            } else {
                res.status(401).json({ message: 'Token verification failed' });
            }
            return;
        }

        // Pastikan payload adalah objek dan memiliki id
        if (typeof decoded === 'string' || !decoded.id) {
            res.status(401).json({ message: 'Invalid token payload' });
            return;
        }

        // Cast ke interface yang benar
        const userPayload = decoded as CustomJwtPayload;

        // Simpan informasi user ke dalam request object
        req.user = {
            id: userPayload.id,
            email: userPayload.email,
            username: userPayload.username
        };

        next();
    } catch (error) {
        // Ini seharusnya tidak terjadi jika semua error di atas ditangani
        console.error('VerifyToken middleware error:', error);
        res.status(500).json({ message: 'Internal server error during token verification' });
    }
};

const checkOwnership = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        // Pastikan verifyToken telah berjalan dan req.user telah diset
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required before checking ownership' });
            return;
        }

        // Ambil user_id dari parameter URL (harus sesuai dengan nama parameter di route)
        // Kita asumsikan route param disebut 'id' sesuai dengan controller Anda (getSelectedUser, updateSelectedUser)
        const requestedId = req.params.id;

        if (!requestedId) {
            res.status(400).json({ message: 'Resource ID parameter required' });
            return;
        }

        // Bandingkan id user yang login dengan id yang diminta
        if (req.user.id !== requestedId) {
            res.status(403).json({ message: 'Access denied: You can only access your own resources' });
            return;
        }

        next();
    } catch (error) {
        console.error('CheckOwnership middleware error:', error);
        res.status(500).json({ message: 'Ownership verification failed' });
    }
};

export { verifyToken, checkOwnership };