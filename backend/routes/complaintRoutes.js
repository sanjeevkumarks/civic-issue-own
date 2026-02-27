const express = require("express");

const Complaint = require("../models/Complaint");
const User = require("../models/User");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");
const { getDepartmentForCategory } = require("../utils/departmentMapping");
const { createManyNotifications } = require("../utils/notify");
const {
  canonicalDepartmentName,
  normalizeDepartmentName
} = require("../utils/departmentName");

const router = express.Router();

router.post("/", protect, authorize("Citizen"), upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address } = req.body;

    if (!title || !description || !category || !latitude || !longitude || !address) {
      return res.status(400).json({ message: "Missing required complaint fields" });
    }

    const department = canonicalDepartmentName(getDepartmentForCategory(category));
    const imagePaths = (req.files || []).map((file) => `/uploads/${file.filename}`);

    const complaint = await Complaint.create({
      title,
      description,
      category,
      latitude: Number(latitude),
      longitude: Number(longitude),
      address,
      images: imagePaths,
      status: "Pending",
      progress: 0,
      department,
      createdBy: req.user._id,
      createdAt: new Date()
    });

    let authorities = await User.find({ role: "Authority" });
    authorities = authorities.filter(
      (authority) => canonicalDepartmentName(authority.department) === department
    );
    if (!authorities.length) {
      authorities = await User.find({ role: "Authority" });
    }

    await createManyNotifications(
      authorities.map((authority) => authority._id),
      `New complaint submitted: ${complaint.title} (${complaint.category})`
    );

    return res.status(201).json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/my", protect, authorize("Citizen"), async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/all", protect, authorize("Admin"), async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role department");

    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("createdBy", "name email role");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const canView =
      req.user.role === "Admin" ||
      complaint.createdBy._id.toString() === req.user._id.toString() ||
      (req.user.role === "Authority" &&
        normalizeDepartmentName(complaint.department) ===
          normalizeDepartmentName(req.user.department));

    if (!canView) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
