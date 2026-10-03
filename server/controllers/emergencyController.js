const Emergency = require("../models/Emergency");

exports.getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({ createdAt: -1 });
    res.status(200).json(emergencies);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emergencies." });
  }
};

exports.getEmergency = async (req, res) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: req.params.id } 
      : { emergencyCode: req.params.id };

    const emergency = await Emergency.findOne(query);
    if (!emergency) return res.status(404).json({ error: "Emergency not found" });
    
    res.status(200).json(emergency);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.assignAmbulance = async (req, res) => {
  try {
    const { assignedAmbulance } = req.body;
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { emergencyCode: req.params.id };

    const updatedEmergency = await Emergency.findOneAndUpdate(
      query,
      {
        $set: {            assignedAmbulance: assignedAmbulance,           status: 'dispatched'          },$push: { 
          timeline: { event: `${assignedAmbulance} Dispatched to Scene`, source: "Dispatch HQ" } 
        }
      },
      { new: true }
    );
    res.status(200).json({ data: updatedEmergency });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign ambulance." });
  }
};

exports.updateEmergency = async (req, res) => {
  try {
    const { prp } = req.body;
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { emergencyCode: req.params.id };

    // Simulating the Matching Engine algorithm output
    const matchedHospital = "City General Hospital";

    const updatedEmergency = await Emergency.findOneAndUpdate(
      query,
      {
        $set: {           patientName: prp.patientName,           age: prp.age,           gender: prp.gender,           chiefComplaint: prp.chiefComplaint,           medicalHistory: prp.medicalHistory,           assignedHospital: matchedHospital,           status: 'en_route_to_hospital'         },$push: { 
          timeline: { event: `PRP Generated. Matched to ${matchedHospital}.`, source: "Field EMT" } 
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true } 
    );
    res.status(200).json({ data: updatedEmergency });
  } catch (error) {
    res.status(500).json({ error: "Failed to update emergency PRP." });
  }
};

exports.pushVitals = async (req, res) => {
  try {
    const { vitals } = req.body;
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { emergencyCode: req.params.id };

    const updatedEmergency = await Emergency.findOneAndUpdate(
      query,
      {
        $set: {
          "vitals.hr": vitals.hr,
          "vitals.bp": vitals.bp,
          "vitals.spo2": vitals.spo2
        },
        $push: { 
          timeline: { event: `Vitals Streamed (HR: ${vitals.hr}, BP: ${vitals.bp})`, source: "Field EMT" } 
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ data: updatedEmergency });
  } catch (error) {
    res.status(500).json({ error: "Failed to push vitals." });
  }
};