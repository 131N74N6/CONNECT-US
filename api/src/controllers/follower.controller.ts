import { Request, Response } from 'express';
import { Follower } from '../models/follower.model';

async function getCurrentUserFollowers(req: Request, res: Response): Promise<void> {
    try {
        const currentUserId = req.params.id;
        const showFollowers = await Follower.find({ other_user_id: currentUserId });
        const followersTotal = await Follower.find({ other_user_id: currentUserId }).countDocuments();
        res.json({
            data: showFollowers,
            followers_total: followersTotal
        });
    } catch (error) {
        res.status(500).json({ message: 'internal server error' });
    }
}

async function getCurrentUserFollowing(req: Request, res: Response): Promise<void> {
    try {
        const currentUserId = req.params.id;
        const showFollowed = await Follower.find({ user_id: currentUserId });
        const followedTotal = await Follower.find({ user_id: currentUserId }).countDocuments();
        res.json({
            data: showFollowed,
            followed_total: followedTotal
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