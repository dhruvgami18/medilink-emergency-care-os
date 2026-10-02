const mongoose = require("mongoose");

/**
 * Patient Schema
 * 
 * VIVA EXPLANATION:
 * - Represents registered citizens / patients in the healthcare ecosystem.
 * - Identified by a unique UHID (Unique Health Identifier, e.g. "UHID-8921").
 * - Stores medical baseline: Blood group, known allergies, chronic conditions (e.g. Asthma, Diabetes).
 * - Enables instant lookups by Hospital Staff so receiving doctors know critical medical allergies before the ambulance arrives.
 */
const patientSchema = new mongoose.Schema(
  {
    uhid: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 130,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String },
    },
    allergies: [
      {
        type: String, // e.g. "Penicillin", "Peanuts", "Latex"
      },
    ],
    chronicConditions: [
      {
        type: String, // e.g. "Type 2 Diabetes", "Hypertension", "Asthma"
      },
    ],
    medicalNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
