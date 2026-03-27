// server/controllers/placement.controller.js
import PlacementService from "../services/placement.service.js";

export const predictPlacement = async (req, res) => {
  try {
    const result = await PlacementService.predict(req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Placement prediction error:", err.message);
    return res.status(503).json({
      success: false,
      message: "ML service unavailable. Is FastAPI server running?", // ← Flask → FastAPI
    });
  }
};

export const getPlacementStats = async (req, res) => {
  try {
    const stats = await PlacementService.getStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    return res.status(503).json({ 
      success: false, 
      message: "Service unavailable" 
    });
  }
};

export const checkHealth = async (req, res) => {
  try {
    const health = await PlacementService.checkHealth();
    return res.status(200).json({ success: true, data: health });
  } catch (err) {
    return res.status(503).json({ 
      success: false, 
      message: "FastAPI server is down" // ← Flask → FastAPI
    });
  }
};