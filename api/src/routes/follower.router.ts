import { Router } from "express";
import { 
    followOtherUser, getCurrentUserFollowers, 
    getCurrentUserFollowing, hasUserFollowed, unfollowOtherUser, 
    userConnectionStats
} from "../controllers/follower.controller";

const followerRoutes = Router();

followerRoutes.delete('/erase/:id', unfollowOtherUser);

followerRoutes.get('/get-all/:id', getCurrentUserFollowers);

followerRoutes.get('/has-followed/:id', hasUserFollowed);

followerRoutes.get('/user-connection-stats/:id', userConnectionStats);

followerRoutes.get('/who-followed/:id', getCurrentUserFollowing);

followerRoutes.post('/add', followOtherUser);

export default followerRoutes;