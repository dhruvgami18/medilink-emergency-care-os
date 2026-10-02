const Emergency = require("../models/Emergency");
const Hospital = require("../models/Hospital");
const Ambulance = require("../models/Ambulance");
const Patient = require("../models/Patient");
const AuditLog = require("../models/AuditLog");

/**
 * Emergency Simulator Controller
 * 
 * VIVA EXPLANATION:
 * Provides realistic pre-hospital data generation on demand.
 * Pushes mock incoming ALS/BLS ambulances with vital signs directly to the hospital desk,
 * enabling immediate end-to-end testing of the triage acceptance and bed allocation workflow.
 */
exports.triggerSimulatedEmergency = async (req, res) => {
  try {
    const { hospitalId, severity = "Red" } = req.body;

    // Pick target hospital
    let hospital;
    if (hospitalId) {
      hospital = await Hospital.findById(hospitalId);
    }
    if (!hospital) {
      hospital = await Hospital.findOne();
    }

    if (!hospital) {
      return res.status(404).json({ error: "No hospital available to receive simulated case" });
    }

    // Pick an ambulance or create a virtual one
    let ambulance = await Ambulance.findOne({ hospital: hospital._id });
    if (!ambulance) {
      ambulance = await Ambulance.findOne();
    }

    // Pick a patient or create a virtual one
    const patient = await Patient.findOne();

    const timestampCode = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `ML-SIM-${timestampCode}`;

    const isCritical = severity === "Red";

    const simulatedEmergency = await Emergency.create({
      trackingCode,
      reporterName: "Highway Incident Dispatch",
      reporterPhone: "+91 98990 11223",
      patient: {
        name: patient ? patient.name : "Simulated Emergency Patient",
        age: patient ? patient.age : 46,
        gender: patient ? patient.gender : "Male",
        symptoms: isCritical
          ? ["Acute crushing chest pain", "Severe diaphoresis", "SpO2 drop to 89%"]
          : ["Road traffic accident", "Left femur deformity", "Lacerations"],
        notes: isCritical
          ? "Suspected Acute STEMI / Cardiogenic shock. High priority triage."
          : "Stable hemodynamics, splint applied by paramedic.",
      },
      location: {
        lat: hospital.location.lat + (Math.random() - 0.5) * 0.05,
        lng: hospital.location.lng + (Math.random() - 0.5) * 0.05,
        address: "Sector 14 Expressway, Junction 3",
      },
      status: "in_transit",
      assignedHospital: hospital._id,
      assignedAmbulance: ambulance ? ambulance._id : null,
      patientRef: patient ? patient._id : null,
      triageScore: severity,
      etaMinutes: Math.floor(4 + Math.random() * 8), // 4 - 12 mins
      prp: {
        suspectedCondition: isCritical
          ? "Acute ST-Elevation Myocardial Infarction (STEMI)"
          : "Lower Extremity Fracture / Moderate Trauma",
        requiredBedType: isCritical ? "ICU" : "General",
        equipmentNeeded: isCritical
          ? ["Ventilator", "Defibrillator", "Cardiac Monitor"]
          : ["Oxygen", "X-Ray Standby"],
        bloodRequired: {
          bloodGroup: patient ? patient.bloodGroup : "O+",
          units: isCritical ? 2 : 1,
        },
        vitalSigns: [
          {
            timestamp: new Date(Date.now() - 5 * 60000),
            heartRate: isCritical ? 122 : 94,
            bloodPressure: isCritical ? "160/102" : "126/82",
            spO2: isCritical ? 89 : 97,
            respiratoryRate: isCritical ? 26 : 18,
            temperature: 37.2,
            gcs: isCritical ? 13 : 15,
            notes: "Paramedic initiated supplemental high-flow O2.",
          },
          {
            timestamp: new Date(),
            heartRate: isCritical ? 112 : 90,
            bloodPressure: isCritical ? "148/94" : "122/80",
            spO2: isCritical ? 93 : 98,
            respiratoryRate: isCritical ? 22 : 17,
            temperature: 37.0,
            gcs: 15,
            notes: "IV line established. En route to hospital.",
          },
        ],
      },
      timeline: [
        { event: "Incident detected & simulated dispatch initiated", timestamp: new Date() },
        { event: `Assigned to ${hospital.name} with Triage ${severity}`, timestamp: new Date() },
      ],
    });

    await AuditLog.create({
      action: "SIMULATION_TRIGGERED",
      performedBy: { name: "Faculty Viva Simulator", role: "Hospital" },
      targetEntity: "Emergency",
      entityId: simulatedEmergency._id.toString(),
      details: `Generated simulated in-transit emergency [${trackingCode}] with triage ${severity} assigned to ${hospital.name}.`,
    });

    const populatedEmergency = await Emergency.findById(simulatedEmergency._id)
      .populate("assignedHospital")
      .populate("assignedAmbulance")
      .populate("patientRef");

    res.status(201).json({
      message: "Simulated emergency dispatched successfully!",
      emergency: populatedEmergency,
    });
  } catch (error) {
    console.error("triggerSimulatedEmergency Error:", error);
    res.status(500).json({ error: "Failed to trigger simulated emergency" });
  }
};
