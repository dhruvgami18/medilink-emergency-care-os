const Hospital = require("../models/Hospital");

const DEFAULT_HOSPITALS = [
  {
    name: "City General Hospital",
    code: "CITY-GEN",
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
    code: "MERCY-MED",
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
    code: "WESTSIDE-ER",
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
    code: "APOLLO-CARE",
    type: "Multi-Specialty",
    address: "Bhat, Gandhinagar Highway, Ahmedabad",
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

const seedHospitals = async () => {
  try {
    for (const h of DEFAULT_HOSPITALS) {
      await Hospital.findOneAndUpdate(
        { name: h.name },
        { $set: h },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log("MediLink Hospital network successfully verified & seeded in MongoDB.");
  } catch (err) {
    console.error("Hospital seed error:", err);
  }
};

module.exports = seedHospitals;
