const Emergency = require("../models/Emergency");

// Generate PRP (Save Intake Form to MongoDB)
exports.updateEmergency = async (req, res) => {
  try {
    const { prp } = req.body;
    
    // Checks if the ID in the URL is a MongoDB ID or a custom string (like EV-992-K)
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: req.params.id } 
      : { emergencyCode: req.params.id };

    // findOneAndUpdate with upsert:true creates the document if it doesn't exist yet!
    const updatedEmergency = await Emergency.findOneAndUpdate(
      query,
      {
        $set: {
          patientName: prp.patientName,
          age: prp.age,
          gender: prp.gender,
          chiefComplaint: prp.chiefComplaint,
          medicalHistory: prp.medicalHistory,
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true } 
    );

    res.status(200).json({ 
      message: "Patient Requirement Profile (PRP) successfully saved to MongoDB.", 
      data: updatedEmergency 
    });
  } catch (error) {
    console.error("Database Update Error:", error);
    res.status(500).json({ error: "Failed to update emergency PRP in database." });
  }
};

// Stream Live Vitals (Save Vitals to MongoDB)
exports.pushVitals = async (req, res) => {
  try {
    const { vitals } = req.body;
    
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: req.params.id } 
      : { emergencyCode: req.params.id };

    const updatedEmergency = await Emergency.findOneAndUpdate(
      query,
      {
        $set: {
          "vitals.hr": vitals.hr,
          "vitals.bp": vitals.bp,
          "vitals.spo2": vitals.spo2
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ 
      message: "Live Vitals successfully updated in MongoDB.", 
      data: updatedEmergency 
    });
  } catch (error) {
    console.error("Database Vitals Error:", error);
    res.status(500).json({ error: "Failed to push vitals to database." });
  }
};