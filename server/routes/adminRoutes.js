const express = require("express");
const router = express.Router();
const Hospital = require("../models/Hospital");
const Emergency = require("../models/Emergency");
const Ambulance = require("../models/Ambulance");

// 1. Get aggregate platform stats for Admin dashboard
router.get("/stats", async (req, res) => {
  try {
    const totalEmergencies = await Emergency.countDocuments();
    const activeEmergencies = await Emergency.countDocuments({
      status: { $in: ['reported', 'dispatched', 'en_route_to_hospital', 'diverted'] }
    });
    const completedEmergencies = await Emergency.countDocuments({ status: 'completed' });

    const hospitals = await Hospital.find();
    const totalHospitals = hospitals.length;
    
    let totalGeneralBeds = 0;
    let availableGeneralBeds = 0;
    let totalIcuBeds = 0;
    let availableIcuBeds = 0;

    hospitals.forEach(h => {
      totalGeneralBeds += (h.totalGeneralBeds || 0);
      availableGeneralBeds += (h.availableGeneralBeds || 0);
      totalIcuBeds += (h.totalIcuBeds || 0);
      availableIcuBeds += (h.availableIcuBeds || 0);
    });

    const ambulances = await Ambulance.find();
    const totalAmbulances = ambulances.length;

    res.status(200).json({
      totalEmergencies,
      activeEmergencies,
      completedEmergencies,
      totalHospitals,
      totalAmbulances,
      totalGeneralBeds,
      availableGeneralBeds,
      totalIcuBeds,
      availableIcuBeds
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch admin stats." });
  }
});

// 2. Aggregate system logs from all emergencies & activities
router.get("/logs", async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .select("emergencyCode patientName timeline createdAt updatedAt status assignedAmbulance destinationHospital hospitalStatus")
      .sort({ updatedAt: -1 })
      .limit(50);

    const logs = [];

    emergencies.forEach(em => {
      if (em.timeline && Array.isArray(em.timeline)) {
        em.timeline.forEach(event => {
          logs.push({
            id: `${em._id}-${event.timestamp || event.createdAt || Math.random()}`,
            emergencyCode: em.emergencyCode,
            patientName: em.patientName || 'Unknown',
            event: typeof event === 'string' ? event : event.event,
            source: event.source || 'MediLink Core',
            timestamp: event.timestamp || em.updatedAt || em.createdAt,
            hospital: em.destinationHospital?.name || null,
            ambulance: em.assignedAmbulance || null,
            status: em.status
          });
        });
      }
    });

    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json(logs);
  } catch (error) {
    console.error("Admin Logs Error:", error);
    res.status(500).json({ error: "Failed to fetch system logs." });
  }
});

module.exports = router;
