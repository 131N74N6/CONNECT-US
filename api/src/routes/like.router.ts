import { Router } from "express";
import { deleteAllLikes, dislike, getAllLikes, giveLike } from "../controllers/like.controller";

const likeRoutes = Router();

likeRoutes.get('/get-all/:id', getAllLikes);

likeRoutes.post('/add', giveLike);

likeRoutes.delete('/erase-all/:id', deleteAllLikes);

likeRoutes.delete('/erase/:id', dislike);

export default likeRoutes;