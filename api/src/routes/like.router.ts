import { Router } from "express";
import { dislikeByUser, getAllLikes, giveLike } from "../controllers/like.controller";

const likeRoutes = Router();

likeRoutes.get('/get-all/:id', getAllLikes);

likeRoutes.post('/add', giveLike);

likeRoutes.delete('/erased/:id', dislikeByUser);

export default likeRoutes;