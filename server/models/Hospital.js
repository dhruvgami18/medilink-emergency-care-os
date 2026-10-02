const mongoose = require("mongoose");

/**
 * Hospital Schema
 * 
 * VIVA EXPLANATION:
 * - Represents a receiving medical center in MediLink.
 * - Stores ER readiness status (Normal / Trauma Standby / Full Divert).
 * - Tracks critical real-time resources: ICU beds, General beds, Ventilators, Oxygen, and Blood Bank units.
 * - Embedded subdocuments (like resources.icuBeds) allow atomic increment/decrement when an incoming emergency reserves a bed.
 */
const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true, // e.g. "METRO-CENTRAL", "APOLLO-ER"
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    traumaLevel: {
      type: String,
      enum: ["Level 1", "Level 2", "Level 3"],
      default: "Level 1",
    },
    contactPhone: {
      type: String,
      required: true,
    },
    erStatus: {
      type: String,
      enum: ["Normal", "Trauma Standby", "Full Divert"],
      default: "Normal",
    },
    resources: {
      icuBeds: {
        total: { type: Number, default: 20 },
        available: { type: Number, default: 8 },
      },
      generalBeds: {
        total: { type: Number, default: 100 },
        available: { type: Number, default: 35 },
      },
      ventilators: {
        total: { type: Number, default: 15 },
        available: { type: Number, default: 6 },
      },
      oxygenCylinders: {
        total: { type: Number, default: 50 },
        available: { type: Number, default: 22 },
      },
      bloodInventory: [
        {
          bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
          },
          units: { type: Number, default: 10 },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
