import { Request, Response } from 'express';
import { Follower } from '../models/follower.model';

async function getCurrentUserFollowers(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 0;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = page * limit;
        
        const currentUserId = req.params.id;
        const showFollowers = await Follower.find(
            { followed_user_id: currentUserId }, 
            { user_id: 1, username: 1, created_at: 1 }
        ).limit(limit).skip(skip);

        const followerTotal = await Follower.find({ followed_user_id: currentUserId }).countDocuments();

        res.json({
            follower_total: followerTotal,
            followers: showFollowers
        });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getCurrentUserFollowing(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 0;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = page * limit;

        const currentUserId = req.params.id;
        const showFollowed = await Follower.find(
            { user_id: currentUserId },
            { followed_user_id: 1, followed_username: 1, created_at: 1 }
        ).limit(limit).skip(skip);

        const followedTotal = await Follower.find({ user_id: currentUserId }).countDocuments();

        res.json({
            followed_total: followedTotal,
            followed: showFollowed
        });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function followOtherUser(req: Request, res: Response): Promise<void> {
    try {
        const newFollower = new Follower(req.body);
        await newFollower.save();
        res.status(201).json({ message: 'new follower added' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function unfollowOtherUser(req: Request, res: Response): Promise<void> {
    try {
        const getSignedUserId = req.params.id;
        await Follower.deleteOne({ user_id: getSignedUserId });
        res.status(201).json({ message: 'successfully unfollow' });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

export { 
    getCurrentUserFollowers, 
    getCurrentUserFollowing, 
    followOtherUser, 
    unfollowOtherUser 
}