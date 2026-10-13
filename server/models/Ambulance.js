const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema({
  unitId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['ALS', 'BLS'], default: 'ALS' },
  status: { type: String, enum: ['Available', 'Dispatched', 'Maintenance'], default: 'Available' },
  driverName: { type: String, default: 'Paramedic Crew' },
  contact: { type: String, default: '+91 98765 43210' },
  baseStation: { type: String, default: 'Central Dispatch Depot' }
}, { timestamps: true });

module.exports = mongoose.model("Ambulance", ambulanceSchema);
