import { Router } from "express";
import { dislikeByOtherUser, dislikeByPostOwner, getAllLikes, giveLike } from "../controllers/like.controller";

const likeRoutes = Router();

likeRoutes.get('/get-all/:id', getAllLikes);

likeRoutes.post('/add', giveLike);

likeRoutes.delete('/erased-by-other/:id', dislikeByOtherUser);

likeRoutes.delete('/erased-by-owner/:id', dislikeByPostOwner);

export default likeRoutes;