import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {

    /* ── 1. Token extract karo ── */
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please log in."
      });
    }

    /* ── 2. Verify karo ── */
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {

      // Token expired
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again."
        });
      }

      // Token invalid/tampered
      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token. Please log in again."
        });
      }

      // Any other JWT error
      return res.status(401).json({
        success: false,
        message: "Authentication failed."
      });
    }

    /* ── 3. userId set karo ── */
    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload."
      });
    }

    req.userId = decoded.userId;

    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error in auth middleware: ${error.message}`
    });
  }
};

export default isAuth;