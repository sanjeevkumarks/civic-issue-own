const express = require("express");

const Department = require("../models/Department");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    return res.json(departments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
