import { Router } from "express";
import { 
    deleteAllPosts, deleteSelectedPost, getAllPosts, getSearchedPost, 
    getSelectedPost, getSignedUserPosts, getUserTotalPost, insertNewPost 
} from "../controllers/post.controller";

const postRoutes = Router();

postRoutes.delete('/erase-all/:id', deleteAllPosts);

postRoutes.delete('/erase/:id', deleteSelectedPost);

postRoutes.get('/get-all', getAllPosts);

postRoutes.get('/signed-user/:id', getSignedUserPosts);

postRoutes.get('/selected/:id', getSelectedPost);

postRoutes.get('/post-total/:id', getUserTotalPost);

postRoutes.post('/add', insertNewPost);

postRoutes.post('/searched', getSearchedPost);

export default postRoutes;