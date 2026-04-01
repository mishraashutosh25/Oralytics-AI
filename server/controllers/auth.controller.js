import genToken from "../config/token.js";
import User from "../models/user.model.js";
import CreditHistory from "../models/creditHistory.model.js";
import crypto from "crypto";

const processSignup = async (name, email, referralCode) => {
  let referredBy = null;
  // If referral code exists, reward the referrer
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (referrer) {
      referredBy = referrer._id;
      referrer.credits += 20;
      await referrer.save();
      
      await CreditHistory.create({
        userId: referrer._id,
        feature: 'Referral Reward',
        creditsDeducted: -20,
        description: `Earned 20 credits from referring user`
      });
    }
  }

  // Generate a unique referral code for the new user
  const newRefCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  return await User.create({
    name,
    email,
    referralCode: newRefCode,
    referredBy
  });
};

export const googleAuth = async (req, res) => {
  try {
    const { name, email, referralCode } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await processSignup(name, email, referralCode);
    }

    let token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ success: true, user });

  } catch (error) {
    return res.status(500).json({ message: `Google auth error ${error}` });
  }
};

export const githubAuth = async (req, res) => {
  try {
    const { name, email, referralCode } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await processSignup(name, email, referralCode);
    }

    let token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ success: true, user });

  } catch (error) {
    return res.status(500).json({ message: `GitHub auth error ${error}` });
  }
};

export const logOut = async (req, res) => {
  try {
   res.clearCookie("token", {
  httpOnly: true,
  secure: true,
  sameSite: "None"
});

    return res.status(200).json({
      message: "Logged out successfully"
    });

  } catch (error) {
    return res.status(500).json({ message: `Logout error ${error}` });
  }
};
