const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
  emergencyCode: { type: String, required: true, unique: true },
  
  // Intake Form (PRP) Data
  patientName: { type: String, default: 'Unknown' },
  age: { type: String, default: '' },
  gender: { type: String, default: 'Unknown' },
  chiefComplaint: { type: String, default: '' },
  medicalHistory: { type: String, default: '' },
  
  // Live Vitals Data
  vitals: {
    hr: { type: String, default: '' },
    bp: { type: String, default: '' },
    spo2: { type: String, default: '' }
  },
  
  // Logistics & Status
  status: { type: String, default: 'reported' },
  assignedAmbulance: { type: String, default: null },
  assignedHospital: { type: String, default: null },
  
  // Chronological Log
  timeline: [{
    event: String,
    source: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Emergency", emergencySchema);