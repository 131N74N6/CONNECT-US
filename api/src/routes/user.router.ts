import { Router } from "express";
import { getAllUsers, signIn, signUp } from "../controllers/user.controller";

const userRoutes = Router();

userRoutes.get('/get-all', getAllUsers);

userRoutes.post('/sign-up', signUp);

userRoutes.post('/sign-in', signIn);

export default userRoutes;