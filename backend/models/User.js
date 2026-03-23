const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["Citizen", "Authority", "Admin"],
      default: "Citizen"
    },
    department: {
      type: String,
      default: "General Civic"
    },
    phone: {
      type: String,
      default: ""
    },
    whatsappOptIn: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
