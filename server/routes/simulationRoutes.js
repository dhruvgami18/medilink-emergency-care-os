const express = require("express");
const router = express.Router();
const { triggerSimulatedEmergency } = require("../controllers/simulationController");

router.post("/trigger-incoming", triggerSimulatedEmergency);

module.exports = router;
