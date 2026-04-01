import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { 
  getCredits, 
  useFeature, 
  getCreditHistory, 
  claimDailyReward, 
  adminAddCredits 
} from "../controllers/credit.controller.js";

const creditRouter = express.Router();

// 1. GET Current Credits
creditRouter.get("/", isAuth, getCredits);

// 2. GET Credit History (logs)
creditRouter.get("/history", isAuth, getCreditHistory);

// 3. POST Use Feature (deducts credits)
creditRouter.post("/use-feature", isAuth, useFeature);

// 4. POST Claim Daily Reward (+5)
creditRouter.post("/claim-daily-reward", isAuth, claimDailyReward);

// 5. BONUS: Admin manually adds credits
creditRouter.post("/admin-add", isAuth, adminAddCredits);

export default creditRouter;
