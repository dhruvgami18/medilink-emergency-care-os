require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/emergencies", require("./routes/emergencyRoutes"));
app.use("/api/auth", require("./routes/authRoutes")); // <-- ADDED THIS LINE

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

mongoose.connection.once('open', async () => {
  try {
    // This targets and destroys the old ghost index causing your crash
    await mongoose.connection.collection('emergencies').dropIndex('trackingCode_1');
    console.log("Successfully cleared the old trackingCode index!");
  } catch (err) {
    // If it's already deleted, it will just quietly ignore this
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));