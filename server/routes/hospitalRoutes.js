const express = require("express");
const router = express.Router();
const {
  getHospitalDashboard,
  getIncomingEmergencies,
  acceptEmergencyCase,
  updateHospitalResources,
  updateERStatus,
  searchPatients,
} = require("../controllers/hospitalController");

// Public/Demo endpoints (accessible for viva evaluation and staff)
router.get("/dashboard", getHospitalDashboard);
router.get("/dashboard/:id", getHospitalDashboard);
router.get("/:id/incoming", getIncomingEmergencies);
router.post("/emergency/:id/accept", acceptEmergencyCase);
router.put("/:id/resources", updateHospitalResources);
router.put("/:id/status", updateERStatus);
router.get("/patients/search", searchPatients);

module.exports = router;
