import User from '../models/user.model.js';

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    // We check either by a predefined admin email in .env OR an isAdmin boolean in DB
    const adminEmail = process.env.ADMIN_EMAIL || "yashmishra77738@gmail.com";
    
    if (user && (user.email === adminEmail || user.isAdmin === true)) {
      next();
    } else {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required." });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error in Admin Check" });
  }
};

export default isAdmin;
