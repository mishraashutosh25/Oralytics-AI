import express from "express";
import { getDashboardStats } from "../controllers/admin.controller.js";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";

const adminRouter = express.Router();

adminRouter.get("/stats", isAuth, isAdmin, getDashboardStats);

export default adminRouter;
