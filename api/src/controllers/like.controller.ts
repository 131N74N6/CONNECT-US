import { Request, Response } from "express";
import { Like } from "../models/like.model";
import { User } from "../models/user.model";

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

        res.json(getPostLike);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getTotalLikes(req: Request, res: Response): Promise<void> {
    try {
        const getPostId = req.params.id;
        const likesTotal = await Like.find({ post_id: getPostId }).countDocuments();
        res.json(likesTotal);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function giveLike(req: Request, res: Response): Promise<void> {
    try {
        const likePost = new Like(req.body);
        await likePost.save();
        res.status(201).json({ message: 'like' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function hasUserLiked(req: Request, res: Response): Promise<void> {
    try {
        const getUserId = req.params.id;
        const getCurrentUserId = await User.find({ _id: getUserId });
        const getLikesData = await Like.find({});
        const hasLiked = getLikesData.some(like => like.user_id === getCurrentUserId[0]._id);
        res.json(hasLiked);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export { 
    dislikeByUser, 
    getAllLikes, 
    getTotalLikes,
    giveLike, 
    hasUserLiked
}