const express = require("express");
const router = express.Router();
const validateEmergency = require("../middleware/validateEmergency");
const { createEmergency, getEmergencyByTrackingCode } = require("../controllers/emergencyController");

router.post("/", validateEmergency, createEmergency);
router.get("/track/:code", getEmergencyByTrackingCode);

module.exports = router;