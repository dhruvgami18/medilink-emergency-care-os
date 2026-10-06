const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
  emergencyCode: { type: String, required: true, unique: true },
  
  // Intake Form (PRP) Data
  patientName: { type: String, default: 'Unknown' },
  age: { type: String, default: '' },
  gender: { type: String, default: 'Unknown' },
  chiefComplaint: { type: String, default: '' },
  medicalHistory: { type: String, default: '' },
  
  // Location details for mapping
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  
  // Live Vitals Data (Changed to an Array for continuous logging)
  vitalsLog: [{
    hr: String,
    bp: String,
    spo2: String,
    respRate: String,
    temp: String,
    recordedAt: { type: Date, default: Date.now }
  }],
  
  // Logistics & Status
  status: { type: String, default: 'reported' },
  assignedAmbulance: { type: String, default: null },
  destinationHospital: { type: Object, default: null }, // Stores map/hospital object
  
  // Chronological Log
  timeline: [{
    event: String,
    source: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Emergency", emergencySchema);