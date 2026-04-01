import User from "../models/user.model.js";
import CreditHistory from "../models/creditHistory.model.js";
import { CREDIT_COSTS } from "../controllers/credit.controller.js";

/**
 * Middleware to check and deduct credits for a specific feature.
 * Usage in routes:
 * router.post('/analyze-resume', isAuth, checkCredits('Resume Analysis'), analyzeResumeController)
 */
export const checkCredits = (feature) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId || req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized: No user ID found." });
      }

      const cost = CREDIT_COSTS[feature];
      if (!cost) {
        return res.status(400).json({ success: false, message: "Invalid feature specified." });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      if (user.credits < cost) {
        return res.status(402).json({ 
          success: false, 
          message: `Insufficient credits. Need ${cost} but have ${user.credits}.` 
        });
      }

      // Deduct credits and save
      user.credits -= cost;
      
      // Ensure credits never go negative
      if (user.credits < 0) user.credits = 0;

      await user.save();

      // Log transaction
      await CreditHistory.create({
        userId: user._id,
        feature: feature,
        creditsDeducted: cost,
        description: `Used ${cost} credits for ${feature}`
      });

      // Put cost info into req so controllers can optionally use it in response messaging
      req.creditCost = cost;
      req.remainingCredits = user.credits;

      // Proceed to controller
      next();

    } catch (error) {
      console.error(`Check credits middleware error: ${error.message}`);
      return res.status(500).json({ success: false, message: "Credit processing failed." });
    }
  };
};
