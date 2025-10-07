import { Router } from "express";
import { 
    followOtherUser, getCurrentUserFollowers, 
    getCurrentUserFollowing, unfollowOtherUser 
} from "../controllers/follower.controller";

const followerRoutes = Router();

followerRoutes.delete('/erase/:id', unfollowOtherUser);

followerRoutes.get('/get-all/:id', getCurrentUserFollowers);

followerRoutes.get('/who-followed/:id', getCurrentUserFollowing);

followerRoutes.post('/add', followOtherUser);

export default followerRoutes;