import { Router } from "express";
import { dislike, getAllLikes, giveLike } from "../controllers/like.controller";

const likeRoutes = Router();

likeRoutes.get('/get-all/:id', getAllLikes);

likeRoutes.post('/add', giveLike);

likeRoutes.delete('/erase/:id', dislike);

export default likeRoutes;