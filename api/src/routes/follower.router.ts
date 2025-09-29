import { Router } from "express";
import { 
    deleteAllFollowers, followOtherUser, getSignedUserAllFollowers, 
    getSignedUserWhoFollowed, unfollowOtherUser 
} from "../controllers/follower.controller";

const followerRoutes = Router();

followerRoutes.delete('/erase-all/:id', deleteAllFollowers);

followerRoutes.delete('/erase/:id', unfollowOtherUser);

followerRoutes.get('/get-all/:id', getSignedUserAllFollowers);

followerRoutes.get('/who-followed/:id', getSignedUserWhoFollowed);

followerRoutes.post('/add', followOtherUser);

export default followerRoutes;