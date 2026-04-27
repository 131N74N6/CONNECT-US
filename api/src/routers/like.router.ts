import { Router } from "express";
import { dislikeByUser, getAllLikes, getTotalLikes, giveLike, hasUserLiked } from "../controllers/like.controller";
import { verifyToken } from "../middleware/auth.middleware";

const likeRoutes = Router();

likeRoutes.delete('/erase/:id', verifyToken, dislikeByUser);
likeRoutes.get('/has-liked', verifyToken, hasUserLiked);
likeRoutes.get('/likes-total/:id', verifyToken, getTotalLikes);
likeRoutes.get('/get-all/:id', verifyToken, getAllLikes);
likeRoutes.post('/add', verifyToken, giveLike);

export default likeRoutes;