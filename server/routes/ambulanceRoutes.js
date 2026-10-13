const express = require("express");
const router = express.Router();
const Ambulance = require("../models/Ambulance");

// Default initial fleet
const DEFAULT_FLEET = [
  { unitId: "Unit-12", type: "ALS", status: "Available", driverName: "Crew Alpha", baseStation: "Navrangpura Station" },
  { unitId: "Unit-42", type: "ALS", status: "Available", driverName: "Crew Bravo", baseStation: "Ellis Bridge Depot" },
  { unitId: "Unit-19", type: "BLS", status: "Available", driverName: "Crew Charlie", baseStation: "Bodakdev Hub" },
  { unitId: "Unit-88", type: "BLS", status: "Available", driverName: "Crew Delta", baseStation: "Paldi Substation" },
  { unitId: "Unit-07", type: "ALS", status: "Available", driverName: "Crew Echo", baseStation: "Gandhinagar Link" }
];

// Helper: Seed if empty
const seedAmbulancesIfEmpty = async () => {
  const count = await Ambulance.countDocuments();
  if (count === 0) {
    await Ambulance.insertMany(DEFAULT_FLEET);
    console.log("Seeded initial ambulance fleet into MongoDB");
  }
};

// 1. Get all ambulances
router.get("/", async (req, res) => {
  try {
    await seedAmbulancesIfEmpty();
    const ambulances = await Ambulance.find().sort({ unitId: 1 });
    res.status(200).json(ambulances);
  } catch (error) {
    console.error("Fetch Ambulances Error:", error);
    res.status(500).json({ error: "Failed to fetch ambulances." });
  }
});

// 2. Add a new ambulance
router.post("/", async (req, res) => {
  try {
    const { unitId, type, status, driverName, contact, baseStation } = req.body;
    if (!unitId) return res.status(400).json({ error: "Ambulance Unit ID is required." });

    const existing = await Ambulance.findOne({ unitId });
    if (existing) return res.status(400).json({ error: `Ambulance ${unitId} already exists.` });

    const newUnit = new Ambulance({
      unitId,
      type: type || 'ALS',
      status: status || 'Available',
      driverName: driverName || 'Paramedic Crew',
      contact: contact || '+91 98765 43210',
      baseStation: baseStation || 'Central Dispatch Depot'
    });

    await newUnit.save();
    res.status(201).json(newUnit);
  } catch (error) {
    console.error("Create Ambulance Error:", error);
    res.status(500).json({ error: "Failed to create ambulance." });
  }
});

// 3. Delete an ambulance
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Ambulance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Ambulance not found." });
    res.status(200).json({ message: "Ambulance deleted successfully.", deleted });
  } catch (error) {
    console.error("Delete Ambulance Error:", error);
    res.status(500).json({ error: "Failed to delete ambulance." });
  }
});

module.exports = router;
