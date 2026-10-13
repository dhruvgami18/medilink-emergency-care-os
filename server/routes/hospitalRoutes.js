const express = require("express");
const router = express.Router();
const {
  getAllHospitals,
  getHospitalById,
  updateHospitalCapacity,
  getIncomingEmergencies,
  respondToEmergency,
  createHospital,
  deleteHospital
} = require("../controllers/hospitalController");

// Hospital List & Details
router.get("/", getAllHospitals);
router.post("/", createHospital);
router.get("/:id", getHospitalById);
router.delete("/:id", deleteHospital);

// Capacity Management (Beds, ICU, Blood Bank)
router.put("/:id/capacity", updateHospitalCapacity);

// Incoming EMT Emergencies
router.get("/:id/incoming", getIncomingEmergencies);

// ER Staff Accept or Divert/Reject Transfer
router.put("/emergencies/:emergencyId/respond", respondToEmergency);

module.exports = router;
