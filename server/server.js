require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/hospital", require("./routes/hospitalRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/simulation", require("./routes/simulationRoutes"));
app.use("/api/emergencies", require("./routes/emergencyRoutes"));

// Root Health Check Route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    system: "MediLink Emergency Care Operating System API",
    version: "1.0.0",
    modules: ["Auth", "Hospital Role", "Admin Role", "Public Reporter", "EMT", "Dispatch", "Simulation"],
  });
});

// Central Database Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medilink";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 MediLink Server running on port ${PORT}`));