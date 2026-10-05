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

// Patient Submission Route
router.post("/", createEmergency);

// Dashboard Feed Routes
router.get("/", getAllEmergencies);
router.get("/:id", getEmergency);

// Dispatch & EMT Action Routes
router.put("/:id/assign", assignAmbulance);
router.put("/:id/prp", updateEmergency);
router.put("/:id/vitals", pushVitals);

module.exports = router;