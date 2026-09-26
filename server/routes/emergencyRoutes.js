const express = require("express");
const router = express.Router();
const validateEmergency = require("../middleware/validateEmergency");
const { createEmergency } = require("../controllers/emergencyController");

router.post("/", validateEmergency, createEmergency);

module.exports = router;