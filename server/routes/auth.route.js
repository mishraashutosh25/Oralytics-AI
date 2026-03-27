import express from "express";
import { googleAuth, githubAuth, logOut } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/google", googleAuth);
authRouter.post("/github", githubAuth);   
authRouter.get("/logout", logOut);

export default authRouter;