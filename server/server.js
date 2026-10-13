require("dotenv").config();
const dns = require("dns");
// Fix Windows SRV lookup issue for MongoDB Atlas (querySrv ECONNREFUSED)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if not supported
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/emergencies", require("./routes/emergencyRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/hospitals", require("./routes/hospitalRoutes"));
app.use("/api/ambulances", require("./routes/ambulanceRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    const seedHospitals = require("./utils/seedHospitals");
    await seedHospitals();
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

mongoose.connection.once('open', async () => {
  try {
    // This targets and destroys the old ghost index causing crash
    await mongoose.connection.collection('emergencies').dropIndex('trackingCode_1');
    console.log("Successfully cleared the old trackingCode index!");
  } catch (err) {
    // If it's already deleted, it will just quietly ignore this
  }
  try {
    await mongoose.connection.collection('hospitals').dropIndex('code_1');
    console.log("Successfully cleared the old hospital code index!");
  } catch (err) {
    // Ignore if not present
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));