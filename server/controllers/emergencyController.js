const Emergency = require("../models/Emergency");

// 1. Create a new emergency (Patient Submission)
exports.createEmergency = async (req, res) => {
  try {
    const code = 'EV-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const newEmergency = new Emergency({
      emergencyCode: code,
      patientName: req.body.patientName || 'Unknown',
      chiefComplaint: req.body.chiefComplaint || 'Emergency Request',
      location: req.body.location || { lat: 23.0225, lng: 72.5714 }, // Default to map center if none
      status: 'reported',
      timeline: [{ event: "Emergency Reported via Medilink", source: "System" }]
    });

    await newEmergency.save();
    res.status(201).json({ emergencyCode: code, _id: newEmergency._id });
  } catch (error) {
    console.error("Create Emergency Error:", error);
    res.status(500).json({ error: "Failed to create emergency." });
  }
};

// 2. Fetch all
exports.getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({ createdAt: -1 });
    res.status(200).json(emergencies);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch emergencies." });
  }
};

// 3. Fetch single case (by ID or EV-XXXX code)
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

// 4. Dispatch Assignment
exports.assignAmbulance = async (req, res) => {
  try {
    const { assignedAmbulance } = req.body;
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { emergencyCode: req.params.id };

    const updatedEmergency = await Emergency.findOneAndUpdate(
      query,
      {
        $set: { assignedAmbulance: assignedAmbulance, status: 'dispatched' },$push: { timeline: { event: `${assignedAmbulance} Dispatched to Scene`, source: "Dispatch HQ" } }
      },
      { new: true }
    );
    res.status(200).json(updatedEmergency);
  } catch (error) {
    res.status(500).json({ error: "Failed to assign ambulance." });
  }
};

// 5. Dynamic Update (Handles both PRP Forms AND Hospital Assignments)
exports.updateEmergency = async (req, res) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { emergencyCode: req.params.id };
    
    let updateData = { $set: {} };
    let timelineEvent = null;

    // A. If EMT sends a PRP form update
    if (req.body.prp) {
      updateData.$set.patientName = req.body.prp.patientName;
      updateData.$set.age = req.body.prp.age;
      updateData.$set.gender = req.body.prp.gender;
      updateData.$set.chiefComplaint = req.body.prp.chiefComplaint;
      updateData.$set.medicalHistory = req.body.prp.medicalHistory;
      timelineEvent = "Patient Requirement Profile (PRP) Generated";
    }
    
    // B. If EMT selects a destination hospital
    if (req.body.destinationHospital) {
      updateData.$set.destinationHospital = req.body.destinationHospital;
      updateData.$set.status = req.body.status || 'en_route_to_hospital';
      timelineEvent = `Destination confirmed: ${req.body.destinationHospital.name}`;
    }

    if (timelineEvent) {
      updateData.$push = { timeline: { event: timelineEvent, source: "Field EMT" } };
    }

    const updatedEmergency = await Emergency.findOneAndUpdate(query, updateData, { new: true });
    res.status(200).json(updatedEmergency);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update emergency details." });
  }
};

// 6. Continuous Vitals Logging
exports.pushVitals = async (req, res) => {
  try {
    const { hr, bp, spo2, respRate, temp } = req.body;
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { emergencyCode: req.params.id };

    const updatedEmergency = await Emergency.findOneAndUpdate(
      query,
      {
        $push: {
          // Push to the vitalsLog array instead of overwriting a single object
          vitalsLog: { hr, bp, spo2, respRate, temp, recordedAt: new Date() },
          timeline: { event: `Vitals Streamed (HR: ${hr}, BP: ${bp})`, source: "Field EMT" }
        }
      },
      { new: true }
    );

    if (!updatedEmergency) return res.status(404).json({ error: "Case not found" });
    res.status(200).json(updatedEmergency);
  } catch (error) {
    console.error("CRITICAL VITALS ERROR:", error); 
    res.status(500).json({ error: "Failed to push vitals", details: error.message });
  }
};