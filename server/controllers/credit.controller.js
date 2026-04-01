import User from "../models/user.model.js";
import CreditHistory from "../models/creditHistory.model.js";

// Feature costs (can also be kept in env or another config file)
export const CREDIT_COSTS = {
  'Resume Analysis': 10,
  'Mock Interview': 25,
  'Video Interview': 50,
  'Company Questions': 5,
  'Placement Prediction': 15
};

export const REWARD_AMOUNTS = {
  'Daily Reward': 5,
  'Referral Reward': 20
};

// ── GET CURRENT CREDITS ───────────────────────────────────────
export const getCredits = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('credits lastDailyRewardAt referralCode');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, credits: user.credits, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error fetching credits: ${error.message}` });
  }
};

// ── USE FEATURE & DEDUCT CREDITS ──────────────────────────────
export const useFeature = async (req, res) => {
  try {
    const { feature } = req.body;
    
    if (!CREDIT_COSTS[feature]) {
      return res.status(400).json({ success: false, message: "Invalid feature name" });
    }

    const cost = CREDIT_COSTS[feature];
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.credits < cost) {
      return res.status(402).json({ 
        success: false, 
        message: `Insufficient credits. Need ${cost} but have ${user.credits}.` 
      });
    }

    // Deduct credits
    user.credits -= cost;
    await user.save();

    // Log the transaction
    await CreditHistory.create({
      userId: user._id,
      feature: feature,
      creditsDeducted: cost,
      description: `Used ${cost} credits for ${feature}`
    });

    return res.status(200).json({ 
      success: true, 
      message: `You used ${cost} credits for ${feature}. Remaining credits: ${user.credits}`,
      credits: user.credits
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: `Error using feature: ${error.message}` });
  }
};

// ── GET CREDIT HISTORY ────────────────────────────────────────
export const getCreditHistory = async (req, res) => {
  try {
    const history = await CreditHistory.find({ userId: req.userId })
                                       .sort({ createdAt: -1 });
    
    return res.status(200).json({ success: true, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error fetching history: ${error.message}` });
  }
};

// ── CLAIM DAILY REWARD ────────────────────────────────────────
export const claimDailyReward = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const now = new Date();
    // Check if last claim was today
    if (user.lastDailyRewardAt) {
      const lastClaim = new Date(user.lastDailyRewardAt);
      if (
        lastClaim.getDate() === now.getDate() &&
        lastClaim.getMonth() === now.getMonth() &&
        lastClaim.getFullYear() === now.getFullYear()
      ) {
        return res.status(400).json({ success: false, message: "Daily reward already claimed today" });
      }
    }

    const reward = REWARD_AMOUNTS['Daily Reward'];
    user.credits += reward;
    user.lastDailyRewardAt = now;
    await user.save();

    await CreditHistory.create({
      userId: user._id,
      feature: 'Daily Reward',
      creditsDeducted: -reward, // Negative means credits were added
      description: `Claimed daily reward of ${reward} credits`
    });

    return res.status(200).json({ 
      success: true, 
      message: `Daily reward claimed! +${reward} credits. Total: ${user.credits}`,
      credits: user.credits 
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: `Error claiming reward: ${error.message}` });
  }
};

// ── BONUS: ADD CREDITS (ADMIN) ────────────────────────────────
export const adminAddCredits = async (req, res) => {
  try {
    // In a real app, verify req.userId is an Admin here
    const { targetUserId, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    user.credits += amount;
    await user.save();

    await CreditHistory.create({
      userId: user._id,
      feature: 'Manual Add',
      creditsDeducted: -amount,
      description: `Admin manually added ${amount} credits`
    });

    return res.status(200).json({ 
      success: true, 
      message: `Successfully added ${amount} credits to user. Total: ${user.credits}` 
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: `Admin credit error: ${error.message}` });
  }
};
