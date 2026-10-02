const mongoose = require("mongoose");

/**
 * Emergency Schema (Enhanced for MediLink Pre-Hospital Intelligence)
 * 
 * VIVA EXPLANATION:
 * - Preserves all public reporter fields (trackingCode, reporterName, reporterPhone, symptoms, location).
 * - Implements Relational References (`ref: 'Hospital'`, `ref: 'Ambulance'`, `ref: 'Patient'`).
 * - Embeds Patient Requirement Profile (PRP):
 *     1. Triage Color (Red = Critical, Yellow = Urgent, Green = Stable)
 *     2. Required Bed Type (ICU vs General)
 *     3. Required Medical Equipment (e.g., Ventilator, Defibrillator)
 *     4. In-transit Vital Signs timeline (Heart Rate, Blood Pressure, SpO2, GCS)
 * - Embeds Bed Allocation and Attending Doctor once accepted by Hospital ER staff.
 */
const emergencySchema = new mongoose.Schema(
  {
    // Public Reporter / Tracking fields (from Urvi's module)
    trackingCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    reporterName: {
      type: String,
      required: true,
    },
    reporterPhone: {
      type: String,
      required: true,
    },
    patient: {
      name: { type: String, default: "Unknown Patient" },
      age: { type: Number, min: 0 },
      gender: { type: String },
      symptoms: [String],
      notes: { type: String },
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, default: "Emergency Location" },
    },

    // Lifecycle Status
    status: {
      type: String,
      enum: [
        "reported",
        "dispatched",
        "en_route",
        "in_transit",
        "arrived",
        "accepted",
        "admitted",
        "closed",
      ],
      default: "reported",
    },

    // Relational Links (ObjectId references)
    assignedHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
    },
    assignedAmbulance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ambulance",
      default: null,
    },
    patientRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },

    // Triage & Patient Requirement Profile (PRP)
    triageScore: {
      type: String,
      enum: ["Red", "Yellow", "Green"],
      default: "Yellow", // Red = Immediate/Resuscitation, Yellow = Urgent, Green = Delayed
    },
    etaMinutes: {
      type: Number,
      default: 10,
    },
    prp: {
      suspectedCondition: {
        type: String,
        default: "Acute Trauma / Undiagnosed Emergency",
      },
      requiredBedType: {
        type: String,
        enum: ["ICU", "General"],
        default: "General",
      },
      equipmentNeeded: [
        {
          type: String, // e.g. "Ventilator", "Defibrillator", "Oxygen", "Suction Unit"
        },
      ],
      bloodRequired: {
        bloodGroup: { type: String, default: "O+" },
        units: { type: Number, default: 0 },
      },
      // In-transit vitals stream (Viva: Embedded array log for time-series vitals)
      vitalSigns: [
        {
          timestamp: { type: Date, default: Date.now },
          heartRate: { type: Number }, // bpm
          bloodPressure: { type: String }, // e.g. "120/80"
          spO2: { type: Number }, // % oxygen saturation
          respiratoryRate: { type: Number }, // breaths/min
          temperature: { type: Number }, // in Celsius
          gcs: { type: Number }, // Glasgow Coma Scale (3 - 15)
          notes: { type: String },
        },
      ],
    },

    // Hospital Acceptance & Bed Allocation
    allocatedBed: {
      type: String, // e.g. "ICU-03" or "GEN-12"
      default: null,
    },
    attendingDoctor: {
      type: String,
      default: null,
    },

    // Event Timeline
    timeline: [
      {
        event: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emergency", emergencySchema);