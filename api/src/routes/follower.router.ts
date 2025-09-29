import { Router } from "express";
import { deleteAllFollowers, followOtherUser, getAllFollowers, unfollowOtherUser } from "../controllers/follower.controller";

const followerRoutes = Router();

followerRoutes.delete('/erase-all/:id', deleteAllFollowers);

followerRoutes.delete('/erase/:id', unfollowOtherUser);

followerRoutes.get('/get-all/:id', getAllFollowers);

followerRoutes.post('/add', followOtherUser);

export default followerRoutes;