const mongoose = require("mongoose");
const Hospital = require("../models/Hospital");
const Emergency = require("../models/Emergency");

// Initial seed data for Ahmedabad emergency care network
const DEFAULT_HOSPITALS = [
  {
    name: "City General Hospital",
    type: "Level 1 Trauma Center",
    address: "Navrangpura, Ahmedabad",
    contact: "+91 79 2630 1101",
    location: { lat: 23.0300, lng: 72.5800 },
    distance: "4.2 km",
    eta: "12 mins",
    totalGeneralBeds: 60,
    availableGeneralBeds: 14,
    totalIcuBeds: 16,
    availableIcuBeds: 4,
    bloodBank: { A_pos: 18, A_neg: 6, B_pos: 20, B_neg: 4, O_pos: 24, O_neg: 5, AB_pos: 9, AB_neg: 3 },
    status: "Operational"
  },
  {
    name: "Mercy Medical Center",
    type: "Cardiac Specialty",
    address: "Paldi, Ahmedabad",
    contact: "+91 79 2657 8890",
    location: { lat: 23.0150, lng: 72.5600 },
    distance: "2.8 km",
    eta: "8 mins",
    totalGeneralBeds: 45,
    availableGeneralBeds: 8,
    totalIcuBeds: 12,
    availableIcuBeds: 2,
    bloodBank: { A_pos: 12, A_neg: 3, B_pos: 16, B_neg: 2, O_pos: 18, O_neg: 4, AB_pos: 7, AB_neg: 1 },
    status: "Operational"
  },
  {
    name: "Westside General ER",
    type: "Level 2 Trauma Center",
    address: "Bodakdev, Ahmedabad",
    contact: "+91 79 2687 4412",
    location: { lat: 23.0450, lng: 72.5500 },
    distance: "5.1 km",
    eta: "15 mins",
    totalGeneralBeds: 50,
    availableGeneralBeds: 5,
    totalIcuBeds: 10,
    availableIcuBeds: 1,
    bloodBank: { A_pos: 8, A_neg: 2, B_pos: 11, B_neg: 1, O_pos: 14, O_neg: 2, AB_pos: 4, AB_neg: 0 },
    status: "Operational"
  },
  {
    name: "Apollo Emergency",
    type: "Multi-Specialty",
    address: "Bhat, Gandhinagar Highway",
    contact: "+91 79 6670 1800",
    location: { lat: 23.0050, lng: 72.5900 },
    distance: "6.5 km",
    eta: "18 mins",
    totalGeneralBeds: 80,
    availableGeneralBeds: 22,
    totalIcuBeds: 20,
    availableIcuBeds: 6,
    bloodBank: { A_pos: 25, A_neg: 8, B_pos: 30, B_neg: 6, O_pos: 35, O_neg: 7, AB_pos: 12, AB_neg: 4 },
    status: "Operational"
  }
];

// Helper: Ensure initial seed data exists in MongoDB
const seedHospitalsIfEmpty = async () => {
  const count = await Hospital.countDocuments();
  if (count === 0) {
    await Hospital.insertMany(DEFAULT_HOSPITALS);
    console.log("Seeded initial default hospitals into MongoDB");
  }
};

// 1. Get all hospitals (with live bed availability & blood bank data)
exports.getAllHospitals = async (req, res) => {
  try {
    await seedHospitalsIfEmpty();
    const hospitals = await Hospital.find().sort({ name: 1 });
    res.status(200).json(hospitals);
  } catch (error) {
    console.error("Fetch Hospitals Error:", error);
    res.status(500).json({ error: "Failed to fetch hospitals." });
  }
};

// 2. Get single hospital by ID
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ error: "Hospital not found." });
    res.status(200).json(hospital);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hospital details." });
  }
};

// 3. Update Hospital Capacity (Beds, ICU, Blood Bank Stock) - Used by Hospital Staff
exports.updateHospitalCapacity = async (req, res) => {
  try {
    const { 
      totalGeneralBeds, 
      availableGeneralBeds, 
      totalIcuBeds, 
      availableIcuBeds, 
      bloodBank, 
      status 
    } = req.body;

    const updateFields = {
      lastUpdated: new Date()
    };

    if (totalGeneralBeds !== undefined) updateFields.totalGeneralBeds = Number(totalGeneralBeds);
    if (availableGeneralBeds !== undefined) updateFields.availableGeneralBeds = Number(availableGeneralBeds);
    if (totalIcuBeds !== undefined) updateFields.totalIcuBeds = Number(totalIcuBeds);
    if (availableIcuBeds !== undefined) updateFields.availableIcuBeds = Number(availableIcuBeds);
    if (bloodBank) updateFields.bloodBank = bloodBank;
    if (status) updateFields.status = status;

    const updated = await Hospital.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Hospital not found." });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Hospital Capacity Error:", error);
    res.status(500).json({ error: "Failed to update hospital capacity." });
  }
};

// 4. Fetch Inbound Emergencies routed to this hospital
exports.getIncomingEmergencies = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ error: "Hospital not found." });

    // Find emergencies where destinationHospital matches by name or id
    const emergencies = await Emergency.find({
      $or: [
        { "destinationHospital.name": hospital.name },
        { "destinationHospital._id": hospital._id.toString() },
        { "destinationHospital.id": hospital._id.toString() }
      ]
    }).sort({ updatedAt: -1 });

    res.status(200).json(emergencies);
  } catch (error) {
    console.error("Fetch Incoming Emergencies Error:", error);
    res.status(500).json({ error: "Failed to fetch incoming emergencies." });
  }
};

// 5. Hospital Staff Accept or Reject/Divert incoming EMT transfer
exports.respondToEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { hospitalStatus, notes, hospitalId } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(hospitalStatus)) {
      return res.status(400).json({ error: "Invalid hospital status. Must be 'accepted' or 'rejected'." });
    }

    const query = emergencyId.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: emergencyId } 
      : { emergencyCode: emergencyId };

    const emergency = await Emergency.findOne(query);
    if (!emergency) return res.status(404).json({ error: "Emergency case not found." });

    const hospitalName = emergency.destinationHospital?.name || "Hospital ER";
    const actionText = hospitalStatus === 'accepted' 
      ? `ER Transfer Accepted: ${notes || 'Trauma bay prepped & critical team on standby'}`
      : `ER Diverted / Rejected: ${notes || 'Bed capacity full, diversion requested'}`;

    const newSystemStatus = hospitalStatus === 'accepted' ? 'en_route_to_hospital' : 'diverted';

    const updatedEmergency = await Emergency.findOneAndUpdate(
      query,
      {
        $set: {
          hospitalStatus: hospitalStatus,
          hospitalNotes: notes || '',
          status: newSystemStatus
        },
        $push: {
          timeline: {
            event: `${actionText} (${hospitalName})`,
            source: "Hospital ER Staff",
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    // Automatic Bed Accounting based on requiredBedType ('Normal' vs 'ICU')
    const bedType = emergency.requiredBedType || 'Normal';
    
    // Resolve which hospital document to update:
    // 1. If hospitalId is provided and valid, prioritize it
    // 2. Otherwise look at destinationHospital._id or destinationHospital.name
    let targetHospital = null;
    if (hospitalId && mongoose.Types.ObjectId.isValid(hospitalId)) {
      targetHospital = await Hospital.findById(hospitalId);
    }
    if (!targetHospital && emergency.destinationHospital?._id && mongoose.Types.ObjectId.isValid(emergency.destinationHospital._id)) {
      targetHospital = await Hospital.findById(emergency.destinationHospital._id);
    }
    if (!targetHospital && emergency.destinationHospital?.name) {
      targetHospital = await Hospital.findOne({ name: emergency.destinationHospital.name });
    }

    if (targetHospital) {
      // Case 1: First-time Acceptance -> Auto-decrement bed
      if (hospitalStatus === 'accepted' && emergency.hospitalStatus !== 'accepted') {
        if (bedType === 'ICU') {
          await Hospital.findByIdAndUpdate(
            targetHospital._id,
            { 
              $inc: { availableIcuBeds: targetHospital.availableIcuBeds > 0 ? -1 : 0 },
              $set: { lastUpdated: new Date() } 
            }
          );
        } else {
          await Hospital.findByIdAndUpdate(
            targetHospital._id,
            { 
              $inc: { availableGeneralBeds: targetHospital.availableGeneralBeds > 0 ? -1 : 0 },
              $set: { lastUpdated: new Date() } 
            }
          );
        }
      }
      // Case 2: Reversal from Accepted to Diverted/Rejected -> Release bed back
      else if (hospitalStatus === 'rejected' && emergency.hospitalStatus === 'accepted') {
        if (bedType === 'ICU') {
          await Hospital.findByIdAndUpdate(
            targetHospital._id,
            { 
              $inc: { availableIcuBeds: 1 },
              $set: { lastUpdated: new Date() } 
            }
          );
        } else {
          await Hospital.findByIdAndUpdate(
            targetHospital._id,
            { 
              $inc: { availableGeneralBeds: 1 },
              $set: { lastUpdated: new Date() } 
            }
          );
        }
      }
    }

    res.status(200).json(updatedEmergency);
  } catch (error) {
    console.error("Hospital Response Error:", error);
    res.status(500).json({ error: "Failed to process hospital response." });
  }
};

// 6. Admin Create New Hospital
exports.createHospital = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Hospital name is required." });

    const existing = await Hospital.findOne({ name });
    if (existing) return res.status(400).json({ error: `Hospital '${name}' is already registered.` });

    const hospitalData = {
      ...req.body,
      location: req.body.location || { 
        lat: 23.0300 + (Math.random() - 0.5) * 0.04, 
        lng: 72.5800 + (Math.random() - 0.5) * 0.04 
      },
      distance: req.body.distance || `${(Math.random() * 4 + 2).toFixed(1)} km`,
      eta: req.body.eta || `${Math.floor(Math.random() * 10 + 8)} mins`
    };

    const newHospital = new Hospital(hospitalData);
    await newHospital.save();
    res.status(201).json(newHospital);
  } catch (error) {
    console.error("Create Hospital Error:", error);
    res.status(500).json({ error: error.message || "Failed to create hospital." });
  }
};

// 7. Admin Delete Hospital
exports.deleteHospital = async (req, res) => {
  try {
    const deleted = await Hospital.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Hospital not found." });
    res.status(200).json({ message: "Hospital deleted successfully.", deleted });
  } catch (error) {
    console.error("Delete Hospital Error:", error);
    res.status(500).json({ error: "Failed to delete hospital." });
  }
};
