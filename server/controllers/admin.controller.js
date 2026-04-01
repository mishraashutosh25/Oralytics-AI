import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import Payment from "../models/payment.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Users
    const totalUsers = await User.countDocuments();

    // 2. Total Sessions (Mocks Given)
    const totalSessions = await Interview.countDocuments({ status: "completed" });

    // 3. Total Audio/Video/Text Sessions breakdown
    const modeStats = await Interview.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: "$mode", count: { $sum: 1 } } }
    ]);
    const breakdown = { text: 0, voice: 0, video: 0 };
    modeStats.forEach(s => {
      if (s._id) breakdown[s._id] = s.count;
    });

    // 4. Total Revenue (from Razorpay captured payments)
    const revenueAgg = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);
    
    // Amount is stored in paise, so divide by 100
    const totalRevenueINR = revenueAgg.length > 0 ? (revenueAgg[0].totalAmount / 100) : 0;

    // 5. Recent signups (last 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt credits");

    // 6. Recent Payments
    const recentPayments = await Payment.find({ status: "paid" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .select("amount credits createdAt");

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSessions,
        totalRevenueINR,
        breakdown,
        recentUsers,
        recentPayments
      }
    });

  } catch (error) {
    console.error("Admin Stats Error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch admin statistics" });
  }
};
