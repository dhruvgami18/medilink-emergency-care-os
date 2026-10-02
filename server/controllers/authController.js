const User = require("../models/User");
const Hospital = require("../models/Hospital");
const jwt = require("jsonwebtoken");

// Helper to generate signed JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "medilink_emergency_super_secret_jwt_key_2026",
    { expiresIn: "30d" }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, hospitalId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Please provide all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // If role is Hospital and no hospitalId specified, default to first available hospital for convenience
    let assignedHospital = hospitalId;
    if (role === "Hospital" && !assignedHospital) {
      const defaultHosp = await Hospital.findOne();
      if (defaultHosp) assignedHospital = defaultHosp._id;
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      hospital: assignedHospital || null,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hospital: user.hospital,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" });
    }

    // Find user and include populated hospital details
    const user = await User.findOne({ email }).populate("hospital");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "Your account has been deactivated by the Administrator" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hospital: user.hospital,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("hospital");
    res.json(user);
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};
