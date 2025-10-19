import { Router } from "express";
import { dislikeByUser, getAllLikes, getTotalLikes, giveLike, hasUserLiked } from "../controllers/like.controller";

const likeRoutes = Router();

likeRoutes.get('/has-liked', hasUserLiked);

likeRoutes.get('/likes-total/:id', getTotalLikes);

likeRoutes.get('/get-all/:id', getAllLikes);

likeRoutes.post('/add', giveLike);

likeRoutes.delete('/erase/:id', dislikeByUser);

export default likeRoutes;