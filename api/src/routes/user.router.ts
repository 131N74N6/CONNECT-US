import { Router } from "express";
import { getSelectedUser, signIn, signUp, updateSelectedUser } from "../controllers/user.controller";

const userRoutes = Router();

userRoutes.get('/selected/:id', getSelectedUser);
userRoutes.post('/sign-up', signUp);
userRoutes.post('/sign-in', signIn);
userRoutes.put('/change/:id', updateSelectedUser);

export default userRoutes;