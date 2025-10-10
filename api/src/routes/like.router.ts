import { Router } from "express";
import { dislikeByOtherUser, dislikeByPostOwner, getAllLikes, giveLike } from "../controllers/like.controller";

const likeRoutes = Router();

likeRoutes.get('/get-all/:id', getAllLikes);

likeRoutes.post('/add', giveLike);

likeRoutes.delete('/erase-by-other/:id', dislikeByOtherUser);

likeRoutes.delete('/erase-by-owner/:id', dislikeByPostOwner);

export default likeRoutes;