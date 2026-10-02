const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getHospitals,
  createHospital,
  updateHospital,
  getAmbulances,
  createAmbulance,
  updateAmbulance,
  getUsers,
  updateUser,
  getAuditLogs,
} = require("../controllers/adminController");

// System KPIs
router.get("/stats", getAdminStats);

// Hospitals CRUD
router.get("/hospitals", getHospitals);
router.post("/hospitals", createHospital);
router.put("/hospitals/:id", updateHospital);

// Ambulances CRUD
router.get("/ambulances", getAmbulances);
router.post("/ambulances", createAmbulance);
router.put("/ambulances/:id", updateAmbulance);

// Users & RBAC
router.get("/users", getUsers);
router.put("/users/:id", updateUser);

// Audit Logs
router.get("/audit-logs", getAuditLogs);

module.exports = router;
