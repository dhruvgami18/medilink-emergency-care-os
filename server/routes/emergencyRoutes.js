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

// FIX: Changed from "/:id/prp" to "/:id" to match standard REST updates and frontend calls
router.put("/:id", updateEmergency); 

router.put("/:id/vitals", pushVitals);

module.exports = router;