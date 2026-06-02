import dotenv from 'dotenv';
import dns from 'node:dns/promises';

dotenv.config();

if (process.env.NODE_ENV !== 'production') {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    console.log('DNS servers: (1.1.1.1) or (8.8.8.8)');
}

import express from 'express';
import mongoose from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import { v2 } from "cloudinary";
import cors from 'cors';
import postRoutes from './routers/post.router';
import likeRoutes from './routers/like.router';
import commentRoutes from './routers/comment.router';
import userRoutes from './routers/user.router';
import followerRoutes from './routers/follower.router';
import authRoutes from './routers/auth.router';
import cookieParser from 'cookie-parser';

const app = express();

app.use(async (_: Request, __: Response, next: NextFunction) => {
    mongoose.connect((`${process.env.MONGODB_URL}`))
    .then(res => {
        if (res) console.log('Database connection succeffully');
    }).catch(err => {
        console.log("Database connection check failed:", err);
    });
    next();
});

v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: [
        "http://localhost:5173", 
        "http://localhost:1234", 
        "https://connect-us-ten-xi.vercel.app/", 
        "https://connect-us-be-five.vercel.app/"
    ]
}));
app.use('/api/comments', commentRoutes);
app.use('/api/followers', followerRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

if (process.env.NODE_ENV !== 'production') {
    app.listen(1234, () => console.log(`server running at http://localhost:1234`));
}

export default app;