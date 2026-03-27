// server/routes/placement.route.js
import express from "express";
import {
  predictPlacement,
  getPlacementStats,
  checkHealth,
} from "../controllers/placement.controller.js";

const placementRouter = express.Router();

placementRouter.post("/predict", predictPlacement);
placementRouter.get("/stats",   getPlacementStats);
placementRouter.get("/health",  checkHealth);

export default placementRouter;
