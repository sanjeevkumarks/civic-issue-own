const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { canonicalDepartmentName } = require("../utils/departmentName");

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  phone: user.phone || "",
  whatsappOptIn: Boolean(user.whatsappOptIn)
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department, phone, whatsappOptIn } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const allowedRoles = ["Citizen", "Authority", "Admin"];
    const finalRole = role && allowedRoles.includes(role) ? role : "Citizen";

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: finalRole,
      department: canonicalDepartmentName(department || "General Civic"),
      phone: String(phone || "").trim(),
      whatsappOptIn: Boolean(whatsappOptIn)
    });

    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id);

    return res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/me", protect, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
