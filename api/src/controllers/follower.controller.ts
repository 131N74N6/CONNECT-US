import { Request, Response } from 'express';
import { Follower } from '../models/follower.model';
import { User } from '../models/user.model';

async function getCurrentUserFollowers(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;
        
        const currentUserId = req.params.id;
        const showFollowers = await Follower.find(
            { followed_user_id: currentUserId }, 
            { user_id: 1, username: 1, created_at: 1 }
        ).limit(limit).skip(skip);

        res.json(showFollowers);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getCurrentUserFollowing(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const currentUserId = req.params.id;
        const showFollowed = await Follower.find(
            { user_id: currentUserId },
            { followed_user_id: 1, followed_username: 1, created_at: 1 }
        ).limit(limit).skip(skip);

        res.json(showFollowed);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function hasUserFollowed(req: Request, res: Response): Promise<void> {
    try {
        const currentUserId = req.params.id;
        const getCurrentUserId = await User.find({ _id: currentUserId });
        const getFollowersData = await Follower.find({});
        const isFollowed = getFollowersData.some(follower => follower.user_id === getCurrentUserId[0]._id);
        res.json(isFollowed);
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function userConnectionStats(req: Request, res: Response): Promise<void> {
    try {
        const currentUserId = req.params.id;
        const followerTotal = await Follower.find({ followed_user_id: currentUserId }).countDocuments();
        const followedTotal = await Follower.find({ user_id: currentUserId }).countDocuments();
        res.json({
            followed_total: followedTotal,
            follower_total: followerTotal,
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
    followOtherUser, 
    getCurrentUserFollowers, 
    getCurrentUserFollowing, 
    hasUserFollowed,
    unfollowOtherUser, 
    userConnectionStats
}