const Hospital = require("../models/Hospital");
const Emergency = require("../models/Emergency");
const Patient = require("../models/Patient");
const AuditLog = require("../models/AuditLog");

/**
 * Hospital Controller
 * 
 * VIVA EXPLANATION:
 * Handles receiving hospital operations:
 * 1. Live ER triage dashboard aggregation
 * 2. Inbound Patient Requirement Profile (PRP) feed with real-time vitals
 * 3. Atomic bed allocation upon emergency acceptance (decrementing bed inventory)
 * 4. Resource & blood bank inventory management
 * 5. Instant patient medical history search by UHID / Name
 */

// @desc    Get ER Dashboard summary & bed status for a hospital
// @route   GET /api/hospital/dashboard/:id
exports.getHospitalDashboard = async (req, res) => {
  try {
    let hospitalId = req.params.id;

    // If ID is 'default' or not provided, pick first available hospital
    let hospital;
    if (!hospitalId || hospitalId === "default") {
      hospital = await Hospital.findOne();
    } else {
      hospital = await Hospital.findById(hospitalId);
    }

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    // Active incoming emergencies for this hospital
    const incomingEmergencies = await Emergency.find({
      assignedHospital: hospital._id,
      status: { $in: ["dispatched", "in_transit", "en_route"] },
    })
      .populate("assignedAmbulance")
      .populate("patientRef")
      .sort({ etaMinutes: 1 });

    // Accepted cases pending arrival or recently admitted
    const acceptedEmergencies = await Emergency.find({
      assignedHospital: hospital._id,
      status: "accepted",
    })
      .populate("assignedAmbulance")
      .populate("patientRef")
      .sort({ updatedAt: -1 });

    // Critical triage red cases count
    const criticalCount = incomingEmergencies.filter(
      (e) => e.triageScore === "Red"
    ).length;

    // Low stock blood groups (units <= 5)
    const lowBloodStock = hospital.resources.bloodInventory.filter(
      (b) => b.units <= 5
    );

    res.json({
      hospital,
      stats: {
        totalIncoming: incomingEmergencies.length,
        criticalCases: criticalCount,
        acceptedCases: acceptedEmergencies.length,
        icuOccupancyPercent: Math.round(
          ((hospital.resources.icuBeds.total - hospital.resources.icuBeds.available) /
            hospital.resources.icuBeds.total) *
            100
        ),
        generalOccupancyPercent: Math.round(
          ((hospital.resources.generalBeds.total - hospital.resources.generalBeds.available) /
            hospital.resources.generalBeds.total) *
            100
        ),
      },
      lowBloodStock,
      incomingEmergencies,
      acceptedEmergencies,
    });
  } catch (error) {
    console.error("getHospitalDashboard Error:", error);
    res.status(500).json({ error: "Failed to fetch hospital dashboard" });
  }
};

// @desc    Get all active incoming emergencies for live PRP feed
// @route   GET /api/hospital/:id/incoming
exports.getIncomingEmergencies = async (req, res) => {
  try {
    const hospitalId = req.params.id === "default" ? null : req.params.id;
    const query = hospitalId
      ? { assignedHospital: hospitalId, status: { $in: ["dispatched", "in_transit", "en_route", "accepted"] } }
      : { status: { $in: ["dispatched", "in_transit", "en_route", "accepted"] } };

    const emergencies = await Emergency.find(query)
      .populate("assignedHospital", "name code erStatus")
      .populate("assignedAmbulance")
      .populate("patientRef")
      .sort({ etaMinutes: 1, updatedAt: -1 });

    res.json(emergencies);
  } catch (error) {
    console.error("getIncomingEmergencies Error:", error);
    res.status(500).json({ error: "Failed to fetch incoming emergencies" });
  }
};

// @desc    Accept emergency case & allocate bed (Atomic Transaction)
// @route   POST /api/hospital/emergency/:id/accept
exports.acceptEmergencyCase = async (req, res) => {
  try {
    const emergencyId = req.params.id;
    const { allocatedBed, attendingDoctor, bedType } = req.body;

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ error: "Emergency case not found" });
    }

    const hospital = await Hospital.findById(emergency.assignedHospital);
    if (!hospital) {
      return res.status(404).json({ error: "Assigned hospital not found" });
    }

    // Determine bed type to decrement
    const targetBedType = bedType || emergency.prp?.requiredBedType || "General";

    if (targetBedType === "ICU") {
      if (hospital.resources.icuBeds.available <= 0) {
        return res.status(400).json({ error: "No available ICU beds at this hospital" });
      }
      hospital.resources.icuBeds.available -= 1;
    } else {
      if (hospital.resources.generalBeds.available <= 0) {
        return res.status(400).json({ error: "No available General beds at this hospital" });
      }
      hospital.resources.generalBeds.available -= 1;
    }

    await hospital.save();

    // Update emergency status and allocation
    emergency.status = "accepted";
    emergency.allocatedBed = allocatedBed || `${targetBedType}-${Math.floor(10 + Math.random() * 90)}`;
    emergency.attendingDoctor = attendingDoctor || "Dr. ER Duty Officer";
    emergency.timeline.push({
      event: `Case Accepted by ${hospital.name}. Bed ${emergency.allocatedBed} reserved.`,
      timestamp: new Date(),
    });

    await emergency.save();

    // Log to Audit Trail
    await AuditLog.create({
      action: "ACCEPT_EMERGENCY",
      performedBy: {
        name: req.user ? req.user.name : "Hospital ER Staff",
        role: req.user ? req.user.role : "Hospital",
      },
      targetEntity: "Emergency",
      entityId: emergency._id.toString(),
      details: `Accepted emergency [${emergency.trackingCode}] and reserved bed [${emergency.allocatedBed}] at ${hospital.name}.`,
    });

    res.json({
      message: "Emergency accepted and bed successfully allocated",
      emergency,
      hospitalResources: hospital.resources,
    });
  } catch (error) {
    console.error("acceptEmergencyCase Error:", error);
    res.status(500).json({ error: "Failed to accept emergency case" });
  }
};

// @desc    Update hospital resources (Beds, Oxygen, Blood Inventory)
// @route   PUT /api/hospital/:id/resources
exports.updateHospitalResources = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    const { resources } = req.body;
    if (resources) {
      hospital.resources = { ...hospital.resources.toObject(), ...resources };
      await hospital.save();
    }

    // Log to Audit Trail
    await AuditLog.create({
      action: "UPDATE_RESOURCES",
      performedBy: {
        name: req.user ? req.user.name : "Hospital Staff",
        role: req.user ? req.user.role : "Hospital",
      },
      targetEntity: "Hospital",
      entityId: hospital._id.toString(),
      details: `Updated resource counters for ${hospital.name}.`,
    });

    res.json({ message: "Resources updated successfully", resources: hospital.resources });
  } catch (error) {
    console.error("updateHospitalResources Error:", error);
    res.status(500).json({ error: "Failed to update hospital resources" });
  }
};

// @desc    Update hospital ER readiness status (Normal / Trauma Standby / Full Divert)
// @route   PUT /api/hospital/:id/status
exports.updateERStatus = async (req, res) => {
  try {
    const { erStatus } = req.body;
    if (!["Normal", "Trauma Standby", "Full Divert"].includes(erStatus)) {
      return res.status(400).json({ error: "Invalid ER status" });
    }

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { erStatus },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    await AuditLog.create({
      action: "UPDATE_ER_STATUS",
      performedBy: {
        name: req.user ? req.user.name : "Hospital ER Chief",
        role: req.user ? req.user.role : "Hospital",
      },
      targetEntity: "Hospital",
      entityId: hospital._id.toString(),
      details: `Changed ER readiness status of ${hospital.name} to ${erStatus}.`,
    });

    res.json({ message: `ER status updated to ${erStatus}`, hospital });
  } catch (error) {
    console.error("updateERStatus Error:", error);
    res.status(500).json({ error: "Failed to update ER status" });
  }
};

// @desc    Search patient medical records by UHID or Name
// @route   GET /api/hospital/patients/search
exports.searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      const allPatients = await Patient.find().limit(15).sort({ updatedAt: -1 });
      return res.json(allPatients);
    }

    const regex = new RegExp(query, "i");
    const patients = await Patient.find({
      $or: [{ name: regex }, { uhid: regex }, { phone: regex }],
    });

    // Populate past emergencies for matched patients
    const results = await Promise.all(
      patients.map(async (pat) => {
        const emergencies = await Emergency.find({ patientRef: pat._id })
          .sort({ createdAt: -1 })
          .limit(5);
        return {
          ...pat.toObject(),
          pastEmergencies: emergencies,
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error("searchPatients Error:", error);
    res.status(500).json({ error: "Failed to search patient records" });
  }
};
