const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema
 * 
 * VIVA EXPLANATION:
 * - Implements Role-Based Access Control (RBAC):
 *   Roles: ['EMT', 'Dispatcher', 'Hospital', 'Admin']
 * - Security: Passwords are automatically hashed using bcryptjs in the pre-save hook before being stored in MongoDB.
 * - Associated Hospital: For Hospital role users, links to the specific Hospital ObjectId.
 * - Admin controls: `isActive` boolean allows administrators to enable/disable user accounts.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["EMT", "Dispatcher", "Hospital", "Admin"],
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null, // Populated if role is 'Hospital'
    },
    phone: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password with bcrypt before saving to MongoDB
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);