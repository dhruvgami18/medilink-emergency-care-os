const mongoose = require("mongoose");

/**
 * AuditLog Schema
 * 
 * VIVA EXPLANATION:
 * - Provides non-repudiation, compliance, and security monitoring for the Admin role.
 * - Records every critical event: Bed allocations, resource updates, user role changes, and emergency acceptances.
 * - Captures who performed the action, their role, timestamp, and human-readable details.
 */
const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      // e.g. "ACCEPT_EMERGENCY", "UPDATE_RESOURCES", "CHANGE_USER_ROLE", "REGISTER_HOSPITAL", "SIMULATION_TRIGGERED"
    },
    performedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String, default: "System Admin" },
      role: { type: String, default: "Admin" },
    },
    targetEntity: {
      type: String,
      required: true, // e.g. "Emergency", "Hospital", "User", "Ambulance"
    },
    entityId: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
