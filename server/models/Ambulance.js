const mongoose = require("mongoose");

/**
 * Ambulance Schema
 * 
 * VIVA EXPLANATION:
 * - Represents emergency vehicles in the fleet registry.
 * - Distinguishes between ALS (Advanced Life Support - ventilators, defibrillators) and BLS (Basic Life Support).
 * - References Hospital via ObjectId (`ref: 'Hospital'`) to maintain relational integrity.
 * - Tracks live GPS coordinates and operational status (available, dispatched, in_transit, maintenance).
 */
const ambulanceSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true, // e.g. "AMB-101", "AMB-204"
    },
    type: {
      type: String,
      enum: ["ALS", "BLS"],
      default: "ALS", // ALS = Advanced Life Support, BLS = Basic Life Support
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    driverPhone: {
      type: String,
      required: true,
    },
    paramedicName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "dispatched", "in_transit", "maintenance"],
      default: "available",
    },
    currentLocation: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.2090 },
    },
    equipment: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ambulance", ambulanceSchema);
