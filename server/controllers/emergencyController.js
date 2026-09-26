const Emergency = require("../models/Emergency");
const generateTrackingCode = require("../utils/generateTrackingCode");

exports.createEmergency = async (req, res) => {
  try {
    const { reporterName, reporterPhone, patient, location } = req.body;

    const emergency = await Emergency.create({
      trackingCode: generateTrackingCode(),
      reporterName,
      reporterPhone,
      patient,
      location,
      timeline: [{ event: "Emergency reported" }],
    });

    res.status(201).json({
      emergencyId: emergency._id,
      trackingCode: emergency.trackingCode,
      status: emergency.status,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create emergency report." });
  }
};

exports.getEmergencyByTrackingCode = async (req, res) => {
  try {
    const emergency = await Emergency.findOne({ trackingCode: req.params.code });
    if (!emergency) return res.status(404).json({ error: "Not found." });
    res.json(emergency);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch emergency." });
  }
};