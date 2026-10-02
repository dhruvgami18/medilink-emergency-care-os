require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Hospital = require("./models/Hospital");
const Ambulance = require("./models/Ambulance");
const Patient = require("./models/Patient");
const Emergency = require("./models/Emergency");
const AuditLog = require("./models/AuditLog");

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medilink";
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB!");

    // Clear existing data
    console.log("Clearing existing collections...");
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Ambulance.deleteMany({});
    await Patient.deleteMany({});
    await Emergency.deleteMany({});
    await AuditLog.deleteMany({});

    // 1. Seed Hospitals
    console.log("Seeding Hospitals...");
    const hospitals = await Hospital.create([
      {
        name: "Metro Central Hospital & Trauma Center",
        code: "METRO-CENTRAL",
        address: "45 Healthcare Boulevard, Medical District, New Delhi",
        location: { lat: 28.6139, lng: 77.2090 },
        traumaLevel: "Level 1",
        contactPhone: "+91 11 2345 6789",
        erStatus: "Normal",
        resources: {
          icuBeds: { total: 24, available: 7 },
          generalBeds: { total: 120, available: 42 },
          ventilators: { total: 18, available: 5 },
          oxygenCylinders: { total: 60, available: 28 },
          bloodInventory: [
            { bloodGroup: "O+", units: 18 },
            { bloodGroup: "O-", units: 4 }, // Low stock alert demo!
            { bloodGroup: "A+", units: 14 },
            { bloodGroup: "A-", units: 6 },
            { bloodGroup: "B+", units: 16 },
            { bloodGroup: "B-", units: 5 },
            { bloodGroup: "AB+", units: 8 },
            { bloodGroup: "AB-", units: 2 }, // Low stock alert demo!
          ],
        },
      },
      {
        name: "Apollo Emergency & Specialty Care",
        code: "APOLLO-CARE",
        address: "12 Ring Road, South Sector, New Delhi",
        location: { lat: 28.5355, lng: 77.2410 },
        traumaLevel: "Level 2",
        contactPhone: "+91 11 9876 5432",
        erStatus: "Trauma Standby",
        resources: {
          icuBeds: { total: 16, available: 4 },
          generalBeds: { total: 80, available: 21 },
          ventilators: { total: 12, available: 3 },
          oxygenCylinders: { total: 40, available: 19 },
          bloodInventory: [
            { bloodGroup: "O+", units: 12 },
            { bloodGroup: "O-", units: 8 },
            { bloodGroup: "A+", units: 10 },
            { bloodGroup: "A-", units: 5 },
            { bloodGroup: "B+", units: 15 },
            { bloodGroup: "B-", units: 7 },
            { bloodGroup: "AB+", units: 6 },
            { bloodGroup: "AB-", units: 4 },
          ],
        },
      },
    ]);

    const mainHospital = hospitals[0];
    const secondHospital = hospitals[1];

    // 2. Seed Ambulances
    console.log("Seeding Ambulance Fleet...");
    const ambulances = await Ambulance.create([
      {
        vehicleNumber: "DL-01-AMB-101",
        type: "ALS",
        hospital: mainHospital._id,
        driverName: "Rajesh Kumar",
        driverPhone: "+91 98110 12345",
        paramedicName: "Sunita Sharma",
        status: "in_transit",
        currentLocation: { lat: 28.6189, lng: 77.2150 },
        equipment: ["Ventilator", "Defibrillator", "Oxygen", "Cardiac Monitor"],
      },
      {
        vehicleNumber: "DL-01-AMB-204",
        type: "ALS",
        hospital: mainHospital._id,
        driverName: "Vikram Singh",
        driverPhone: "+91 98110 54321",
        paramedicName: "Amit Verma",
        status: "available",
        currentLocation: { lat: 28.6139, lng: 77.2090 },
        equipment: ["Ventilator", "Defibrillator", "Oxygen"],
      },
      {
        vehicleNumber: "DL-02-AMB-309",
        type: "BLS",
        hospital: secondHospital._id,
        driverName: "Praveen Yadav",
        driverPhone: "+91 98110 99887",
        paramedicName: "Pooja Gupta",
        status: "available",
        currentLocation: { lat: 28.5355, lng: 77.2410 },
        equipment: ["First Aid Kit", "Oxygen", "Stretcher"],
      },
    ]);

    // 3. Seed Patients
    console.log("Seeding Patients...");
    const patients = await Patient.create([
      {
        uhid: "UHID-2026-0041",
        name: "Ramesh Chand Sharma",
        age: 58,
        gender: "Male",
        bloodGroup: "O+",
        phone: "+91 98765 11223",
        emergencyContact: {
          name: "Anjali Sharma",
          relation: "Daughter",
          phone: "+91 98765 99887",
        },
        allergies: ["Penicillin", "Sulfa Drugs"],
        chronicConditions: ["Hypertension", "Type 2 Diabetes"],
        medicalNotes: "History of mild angina 2 years ago. Stent in LAD.",
      },
      {
        uhid: "UHID-2026-0089",
        name: "Priya Nair",
        age: 32,
        gender: "Female",
        bloodGroup: "B+",
        phone: "+91 98101 22334",
        emergencyContact: {
          name: "Arun Nair",
          relation: "Spouse",
          phone: "+91 98101 88776",
        },
        allergies: ["Latex"],
        chronicConditions: ["Asthma"],
        medicalNotes: "Uses Salbutamol inhaler as needed.",
      },
      {
        uhid: "UHID-2026-0155",
        name: "Karan Johal",
        age: 24,
        gender: "Male",
        bloodGroup: "A+",
        phone: "+91 98223 33445",
        emergencyContact: {
          name: "Sukhwinder Johal",
          relation: "Brother",
          phone: "+91 98223 77889",
        },
        allergies: [],
        chronicConditions: [],
        medicalNotes: "No known past medical history.",
      },
    ]);

    // 4. Seed Users for All Roles
    console.log("Seeding Users...");
    await User.create([
      {
        name: "System Administrator",
        email: "admin@medilink.com",
        password: "admin123", // Will be hashed automatically by pre-save hook
        role: "Admin",
        phone: "+91 99999 00001",
        isActive: true,
      },
      {
        name: "Dr. Dhruv Gami (ER Chief)",
        email: "hospital@medilink.com",
        password: "hospital123",
        role: "Hospital",
        hospital: mainHospital._id,
        phone: "+91 99999 00002",
        isActive: true,
      },
      {
        name: "Paramedic Unit 101",
        email: "emt@medilink.com",
        password: "emt123",
        role: "EMT",
        phone: "+91 99999 00003",
        isActive: true,
      },
      {
        name: "Central Dispatch Desk",
        email: "dispatcher@medilink.com",
        password: "dispatcher123",
        role: "Dispatcher",
        phone: "+91 99999 00004",
        isActive: true,
      },
    ]);

    // 5. Seed In-transit Emergencies (with PRP & live vitals for viva demo)
    console.log("Seeding Active Emergencies...");
    await Emergency.create([
      {
        trackingCode: "ML-EMG-8921",
        reporterName: "Anjali Sharma",
        reporterPhone: "+91 98765 99887",
        patient: {
          name: "Ramesh Chand Sharma",
          age: 58,
          gender: "Male",
          symptoms: ["Severe retrosternal chest pain", "Diaphoresis", "Shortness of breath"],
          notes: "Pain radiating to left arm. Started 30 minutes ago.",
        },
        location: {
          lat: 28.6250,
          lng: 77.2180,
          address: "Connaught Place Outer Circle, New Delhi",
        },
        status: "in_transit",
        assignedHospital: mainHospital._id,
        assignedAmbulance: ambulances[0]._id,
        patientRef: patients[0]._id,
        triageScore: "Red", // Critical
        etaMinutes: 6,
        prp: {
          suspectedCondition: "Acute ST-Elevation Myocardial Infarction (STEMI)",
          requiredBedType: "ICU",
          equipmentNeeded: ["Ventilator", "Defibrillator", "Cardiac Monitor"],
          bloodRequired: {
            bloodGroup: "O+",
            units: 2,
          },
          vitalSigns: [
            {
              timestamp: new Date(Date.now() - 10 * 60000),
              heartRate: 118,
              bloodPressure: "155/98",
              spO2: 91,
              respiratoryRate: 24,
              temperature: 37.1,
              gcs: 14,
              notes: "Initial triage. High anxiety, pale skin.",
            },
            {
              timestamp: new Date(Date.now() - 5 * 60000),
              heartRate: 104,
              bloodPressure: "140/90",
              spO2: 94,
              respiratoryRate: 20,
              temperature: 37.0,
              gcs: 15,
              notes: "Aspirin & sublingual Nitroglycerin administered. Supplemental O2 4L/min.",
            },
            {
              timestamp: new Date(),
              heartRate: 96,
              bloodPressure: "134/86",
              spO2: 96,
              respiratoryRate: 18,
              temperature: 36.9,
              gcs: 15,
              notes: "Vitals stabilizing. En-route, ETA ~6 mins.",
            },
          ],
        },
        timeline: [
          { event: "Emergency reported via Public Portal", timestamp: new Date(Date.now() - 25 * 60000) },
          { event: "ALS Ambulance DL-01-AMB-101 dispatched", timestamp: new Date(Date.now() - 20 * 60000) },
          { event: "Paramedic reached patient, commenced ECG", timestamp: new Date(Date.now() - 12 * 60000) },
          { event: "Assigned to Metro Central Hospital (Triage RED)", timestamp: new Date(Date.now() - 8 * 60000) },
        ],
      },
      {
        trackingCode: "ML-EMG-6134",
        reporterName: "Highway Police Patrol",
        reporterPhone: "+91 98111 00223",
        patient: {
          name: "Karan Johal",
          age: 24,
          gender: "Male",
          symptoms: ["Motorcycle skid", "Blunt chest trauma", "Lacerations"],
          notes: "Helped off pavement by bystanders. Conscious but dazed.",
        },
        location: {
          lat: 28.5900,
          lng: 77.2300,
          address: "Barapullah Flyover Exit, New Delhi",
        },
        status: "in_transit",
        assignedHospital: mainHospital._id,
        assignedAmbulance: ambulances[1]._id,
        patientRef: patients[2]._id,
        triageScore: "Yellow", // Urgent
        etaMinutes: 14,
        prp: {
          suspectedCondition: "Polytrauma with suspected rib fracture",
          requiredBedType: "General",
          equipmentNeeded: ["Oxygen", "Immobilization Cervical Collar", "X-Ray Standby"],
          bloodRequired: {
            bloodGroup: "A+",
            units: 1,
          },
          vitalSigns: [
            {
              timestamp: new Date(Date.now() - 8 * 60000),
              heartRate: 98,
              bloodPressure: "128/82",
              spO2: 97,
              respiratoryRate: 19,
              temperature: 36.8,
              gcs: 15,
              notes: "C-spine immobilized. Stable vitals.",
            },
          ],
        },
        timeline: [
          { event: "Emergency reported", timestamp: new Date(Date.now() - 18 * 60000) },
          { event: "Ambulance dispatched", timestamp: new Date(Date.now() - 14 * 60000) },
        ],
      },
    ]);

    // 6. Seed Audit Logs
    console.log("Seeding Audit Logs...");
    await AuditLog.create([
      {
        action: "SYSTEM_INITIALIZED",
        performedBy: { name: "System Administrator", role: "Admin" },
        targetEntity: "System",
        details: "MediLink Emergency Operating System database seeded successfully.",
      },
      {
        action: "HOSPITAL_REGISTERED",
        performedBy: { name: "System Administrator", role: "Admin" },
        targetEntity: "Hospital",
        entityId: mainHospital._id.toString(),
        details: "Registered Metro Central Hospital & Trauma Center as Level 1 Trauma Center.",
      },
      {
        action: "AMBULANCE_ASSIGNED",
        performedBy: { name: "Central Dispatch Desk", role: "Dispatcher" },
        targetEntity: "Ambulance",
        entityId: ambulances[0]._id.toString(),
        details: "Assigned ALS Unit DL-01-AMB-101 to Emergency ML-EMG-8921.",
      },
    ]);

    console.log("=========================================");
    console.log("✅ MediLink Database Seeded Successfully!");
    console.log("=========================================");
    console.log("Demo Credentials:");
    console.log("👉 Admin:    admin@medilink.com / admin123");
    console.log("👉 Hospital: hospital@medilink.com / hospital123");
    console.log("👉 EMT:      emt@medilink.com / emt123");
    console.log("👉 Dispatch: dispatcher@medilink.com / dispatcher123");
    console.log("=========================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();
