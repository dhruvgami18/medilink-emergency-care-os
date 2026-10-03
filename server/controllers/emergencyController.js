const Emergency = require("../models/Emergency");
// Create a new emergency (Patient Submission)
exports.createEmergency = async (req, res) => {
  try {
    // Generate a random tracking code (e.g., EV-9A4K)
    const code = 'EV-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const newEmergency = new Emergency({
      emergencyCode: code,
      patientName: req.body.patientName || 'Unknown',
      chiefComplaint: req.body.chiefComplaint || 'Emergency Request',
      location: req.body.location || { lat: 23.0225, lng: 72.5714 },
      status: 'reported',
      timeline: [{ event: "Emergency Reported by Bystander", source: "System" }]
    });

    await newEmergency.save();
    
    // Return the code so the frontend can redirect to the tracker
    res.status(201).json({ emergencyCode: code, _id: newEmergency._id });
  } catch (error) {
    console.error("Create Emergency Error:", error);
    res.status(500).json({ error: "Failed to create emergency." });
  }
};
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