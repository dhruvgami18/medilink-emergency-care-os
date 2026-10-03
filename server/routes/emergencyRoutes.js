const express = require("express");
const router = express.Router();
const { updateEmergency, pushVitals } = require("../controllers/emergencyController");

// Update the patient requirement profile (Intake Form Tab)
router.put("/:id", updateEmergency);

// Push live vitals (Live Vitals Tab)
router.put("/:id/vitals", pushVitals);

module.exports = router;