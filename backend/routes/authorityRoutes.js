const express = require("express");

const Complaint = require("../models/Complaint");
const { protect, authorize } = require("../middleware/auth");
const { createNotification } = require("../utils/notify");
const {
  canonicalDepartmentName,
  normalizeDepartmentName
} = require("../utils/departmentName");

const router = express.Router();

router.get("/complaints", protect, authorize("Authority"), async (req, res) => {
  try {
    const authorityDepartment = canonicalDepartmentName(req.user.department);
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    const visible = complaints.filter(
      (complaint) => canonicalDepartmentName(complaint.department) === authorityDepartment
    );

    return res.json(visible);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/complaints/:id", protect, authorize("Authority"), async (req, res) => {
  try {
    const { status, progress, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (
      normalizeDepartmentName(canonicalDepartmentName(complaint.department)) !==
      normalizeDepartmentName(canonicalDepartmentName(req.user.department))
    ) {
      return res.status(403).json({ message: "Cannot update complaints outside your department" });
    }

    if (status) {
      complaint.status = status;
    }

    if (progress !== undefined) {
      complaint.progress = Number(progress);
    }

    if (comment) {
      complaint.comments.push({
        text: comment,
        by: req.user._id,
        byRole: req.user.role,
        at: new Date()
      });
    }

    if (complaint.status === "Resolved" && complaint.progress < 100) {
      complaint.progress = 100;
    }

    const updated = await complaint.save();

    await createNotification(
      complaint.createdBy,
      `Your complaint \"${complaint.title}\" is now ${updated.status} (${updated.progress}% complete).`
    );

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
