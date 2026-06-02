import { Router } from "express";
import { signIn, signOut, signUp } from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post('/sign-in', signIn);
authRoutes.post('/sign-out', signOut);
authRoutes.post('/sign-up', signUp);

export default authRoutes;