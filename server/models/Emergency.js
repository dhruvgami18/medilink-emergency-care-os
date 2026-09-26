const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    trackingCode: { type: String, required: true, unique: true },
    reporterName: { type: String, required: true },
    reporterPhone: { type: String, required: true },
    patient: {
      age: { type: Number, min: 0 }, // Enforces 0 or higher at the database level
      gender: String,
      symptoms: [String],
      notes: String,
    },
    location: {
      lat: Number,
      lng: Number,
    },
    status: {
      type: String,
      enum: ["reported", "dispatched", "en_route", "arrived", "closed"],
      default: "reported",
    },
    timeline: [
      {
        event: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emergency", emergencySchema);