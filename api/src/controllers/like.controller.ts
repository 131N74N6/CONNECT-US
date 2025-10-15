import { Request, Response } from "express";
import { Like } from "../models/like.model";

async function dislikeByUser(req: Request, res:Response) {
    try {
        const getUserId = req.params.id;
        await Like.deleteOne({ user_id: getUserId });
        res.status(201).json({ message: 'disliked' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getAllLikes(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const getPostId = req.params.id;
        const getPostLike = await Like.find(
            { post_id: getPostId },
            { created_at: 1, post_id: 1, user_id: 1, username: 1 }
        ).limit(limit).skip(skip);

        const likesTotal = await Like.find({ post_id: getPostId }).countDocuments();

        res.json({
            likes_total: likesTotal,
            likes: getPostLike
        });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function giveLike(req: Request, res: Response) {
    try {
        const likePost = new Like(req.body);
        await likePost.save();
        res.status(201).json({ message: 'like' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export { 
    dislikeByUser, 
    getAllLikes, 
    giveLike 
}