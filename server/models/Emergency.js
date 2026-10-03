const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
  emergencyCode: { 
    type: String, 
    required: true,
    unique: true 
  },
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
  
  status: { type: String, default: 'dispatched' }
}, { timestamps: true });

module.exports = mongoose.model("Emergency", emergencySchema);