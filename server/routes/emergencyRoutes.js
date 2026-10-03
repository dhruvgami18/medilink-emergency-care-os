const express = require("express");
const router = express.Router();
const { 
  createEmergency,
  getAllEmergencies, 
  getEmergency, 
  assignAmbulance, 
  updateEmergency, 
  pushVitals 
} = require("../controllers/emergencyController");

// Dispatch Routes
router.post("/", createEmergency);
router.get("/", getAllEmergencies);
router.put("/:id/assign", assignAmbulance);

// Universal Fetch Route (Used by EMT and Patient Tracker)
router.get("/:id", getEmergency);

// EMT Action Routes
router.put("/:id", updateEmergency);
router.put("/:id/vitals", pushVitals);

module.exports = router;