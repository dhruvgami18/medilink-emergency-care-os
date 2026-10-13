const mongoose = require("mongoose");

// Schema representing a Hospital partner in the MediLink Emergency Network
const hospitalSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  type: { 
    type: String, 
    default: 'General Hospital' // e.g., 'Level 1 Trauma Center', 'Cardiac Specialty'
  },
  address: { 
    type: String, 
    default: 'Ahmedabad, Gujarat' 
  },
  contact: { 
    type: String, 
    default: '+91 79 2630 1111' 
  },
  location: {
    lat: { type: Number, default: 23.0225 },
    lng: { type: Number, default: 72.5714 }
  },
  distance: { 
    type: String, 
    default: '3.5 km' 
  },
  eta: { 
    type: String, 
    default: '10 mins' 
  },
  
  // Real-time Bed Capacity (Updated manually by Hospital Staff)
  totalGeneralBeds: { 
    type: Number, 
    default: 50 
  },
  availableGeneralBeds: { 
    type: Number, 
    default: 12 
  },
  totalIcuBeds: { 
    type: Number, 
    default: 15 
  },
  availableIcuBeds: { 
    type: Number, 
    default: 4 
  },

  // Real-time Blood Bank Stock (Units available per blood group)
  bloodBank: {
    A_pos: { type: Number, default: 12 },
    A_neg: { type: Number, default: 4 },
    B_pos: { type: Number, default: 15 },
    B_neg: { type: Number, default: 3 },
    O_pos: { type: Number, default: 20 },
    O_neg: { type: Number, default: 5 },
    AB_pos: { type: Number, default: 8 },
    AB_neg: { type: Number, default: 2 }
  },

  // Operational status: 'Operational', 'Beds Full', 'Critical Diversion'
  status: { 
    type: String, 
    enum: ['Operational', 'Beds Full', 'Critical Diversion'],
    default: 'Operational' 
  },

  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model("Hospital", hospitalSchema);
