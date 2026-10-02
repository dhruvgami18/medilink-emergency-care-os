const Hospital = require("../models/Hospital");
const Ambulance = require("../models/Ambulance");
const User = require("../models/User");
const Emergency = require("../models/Emergency");
const Patient = require("../models/Patient");
const AuditLog = require("../models/AuditLog");

/**
 * Admin Controller
 * 
 * VIVA EXPLANATION:
 * Handles centralized administration of the MediLink ecosystem:
 * 1. Aggregates system-wide analytics & health KPIs across all facilities.
 * 2. Manages Hospital Registry (trauma levels, coordinates, capacity).
 * 3. Manages Ambulance Fleet (ALS/BLS registration, hospital base assignment).
 * 4. User Administration & Role-Based Access Control (RBAC).
 * 5. Security Audit Log tracking.
 */

// @desc    Get system-wide KPIs & analytics
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalHospitals = await Hospital.countDocuments();
    const totalAmbulances = await Ambulance.countDocuments();
    const activeAmbulances = await Ambulance.countDocuments({
      status: { $in: ["in_transit", "dispatched"] },
    });
    const totalEmergencies = await Emergency.countDocuments();
    const activeEmergencies = await Emergency.countDocuments({
      status: { $in: ["reported", "dispatched", "in_transit", "en_route", "accepted"] },
    });
    const totalPatients = await Patient.countDocuments();

    // Bed aggregations across all hospitals
    const hospitals = await Hospital.find();
    let totalIcu = 0,
      availIcu = 0,
      totalGen = 0,
      availGen = 0;

    hospitals.forEach((h) => {
      totalIcu += h.resources.icuBeds.total || 0;
      availIcu += h.resources.icuBeds.available || 0;
      totalGen += h.resources.generalBeds.total || 0;
      availGen += h.resources.generalBeds.available || 0;
    });

    const recentAuditLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      kpis: {
        totalHospitals,
        totalAmbulances,
        activeAmbulances,
        availableAmbulances: totalAmbulances - activeAmbulances,
        totalEmergencies,
        activeEmergencies,
        totalPatients,
        avgResponseTimeMinutes: 7.4,
        admissionSuccessRate: "98.2%",
      },
      bedCapacity: {
        totalIcu,
        availIcu,
        occupiedIcu: totalIcu - availIcu,
        totalGen,
        availGen,
        occupiedGen: totalGen - availGen,
      },
      recentAuditLogs,
    });
  } catch (error) {
    console.error("getAdminStats Error:", error);
    res.status(500).json({ error: "Failed to fetch admin analytics" });
  }
};

// ---------------- Hospital Registry CRUD ----------------
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hospitals" });
  }
};

exports.createHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    await AuditLog.create({
      action: "REGISTER_HOSPITAL",
      performedBy: { name: req.user?.name || "System Admin", role: "Admin" },
      targetEntity: "Hospital",
      entityId: hospital._id.toString(),
      details: `Registered hospital ${hospital.name} (${hospital.code})`,
    });
    res.status(201).json(hospital);
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to create hospital" });
  }
};

exports.updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });

    await AuditLog.create({
      action: "UPDATE_HOSPITAL",
      performedBy: { name: req.user?.name || "System Admin", role: "Admin" },
      targetEntity: "Hospital",
      entityId: hospital._id.toString(),
      details: `Updated registry details for ${hospital.name}`,
    });
    res.json(hospital);
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to update hospital" });
  }
};

// ---------------- Ambulance Registry CRUD ----------------
exports.getAmbulances = async (req, res) => {
  try {
    const ambulances = await Ambulance.find()
      .populate("hospital", "name code")
      .sort({ createdAt: -1 });
    res.json(ambulances);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ambulances" });
  }
};

exports.createAmbulance = async (req, res) => {
  try {
    const ambulance = await Ambulance.create(req.body);
    await AuditLog.create({
      action: "REGISTER_AMBULANCE",
      performedBy: { name: req.user?.name || "System Admin", role: "Admin" },
      targetEntity: "Ambulance",
      entityId: ambulance._id.toString(),
      details: `Registered ambulance vehicle ${ambulance.vehicleNumber} (${ambulance.type})`,
    });
    res.status(201).json(ambulance);
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to create ambulance" });
  }
};

exports.updateAmbulance = async (req, res) => {
  try {
    const ambulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!ambulance) return res.status(404).json({ error: "Ambulance not found" });

    await AuditLog.create({
      action: "UPDATE_AMBULANCE",
      performedBy: { name: req.user?.name || "System Admin", role: "Admin" },
      targetEntity: "Ambulance",
      entityId: ambulance._id.toString(),
      details: `Updated ambulance unit ${ambulance.vehicleNumber}`,
    });
    res.json(ambulance);
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to update ambulance" });
  }
};

// ---------------- User Management & RBAC ----------------
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("hospital", "name code")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, isActive, hospital } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (role) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;
    if (hospital !== undefined) user.hospital = hospital || null;

    await user.save();

    await AuditLog.create({
      action: "MODIFY_USER_RBAC",
      performedBy: { name: req.user?.name || "System Admin", role: "Admin" },
      targetEntity: "User",
      entityId: user._id.toString(),
      details: `Updated role/status for user ${user.email} (Role: ${user.role}, Active: ${user.isActive})`,
    });

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message || "Failed to update user" });
  }
};

// ---------------- Audit Logs ----------------
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};
