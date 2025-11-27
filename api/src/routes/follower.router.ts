import { Router } from "express";
import { 
    followOtherUser, getCurrentUserFollowers, 
    getCurrentUserFollowing, hasUserFollowed, unfollowOtherUser, 
    userConnectionStats
} from "../controllers/follower.controller";
import { verifyToken } from "../middleware/auth.middleware";

const followerRoutes = Router();

followerRoutes.delete('/erase/:id', verifyToken, unfollowOtherUser);

followerRoutes.get('/get-all/:id', verifyToken, getCurrentUserFollowers);

followerRoutes.get('/has-followed', verifyToken, hasUserFollowed);

followerRoutes.get('/user-connection-stats/:id', verifyToken, userConnectionStats);

followerRoutes.get('/who-followed/:id', verifyToken, getCurrentUserFollowing);

followerRoutes.post('/add', verifyToken, followOtherUser);

export default followerRoutes;