// server/routes/placement.route.js
import express from "express";
import {
  predictPlacement,
  getPlacementStats,
  checkHealth,
} from "../controllers/placement.controller.js";
import isAuth from "../middlewares/isAuth.js";
import { checkCredits } from "../middlewares/credit.middleware.js";

const placementRouter = express.Router();

placementRouter.post("/predict", isAuth, checkCredits('Placement Prediction'), predictPlacement);
placementRouter.get("/stats",   getPlacementStats);
placementRouter.get("/health",  checkHealth);

export default placementRouter;
