const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authentication & Authorization Middleware
 * 
 * VIVA EXPLANATION:
 * - protect: Verifies the JSON Web Token (JWT) sent in the HTTP Authorization header (Bearer <token>).
 * - authorize: Enforces Role-Based Access Control (RBAC). Only users with designated roles (e.g. 'Hospital', 'Admin')
 *   are permitted to access protected endpoints.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "medilink_emergency_super_secret_jwt_key_2026"
      );
      req.user = await User.findById(decoded.id).select("-password").populate("hospital");
      if (!req.user) {
        return res.status(401).json({ error: "User not found or token expired" });
      }
      return next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({ error: "Not authorized, token invalid" });
    }
  }

  // Allow test / viva demo mode if explicitly enabled or if no token provided in demo routes
  return res.status(401).json({ error: "Not authorized, no token provided" });
};

// Role-Based Authorization filter
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden: Role '${req.user ? req.user.role : "Unknown"}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
