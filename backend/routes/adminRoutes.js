const express = require("express");

const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Department = require("../models/Department");
const Notification = require("../models/Notification");
const { protect, authorize } = require("../middleware/auth");
const { createManyNotifications } = require("../utils/notify");
const { canonicalDepartmentName } = require("../utils/departmentName");

const router = express.Router();

router.get("/stats", protect, authorize("Admin"), async (req, res) => {
  try {
    const [total, pending, resolved] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: "Resolved" })
    ]);

    return res.json({ total, pending, resolved });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/complaints", protect, authorize("Admin"), async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role department");

    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/complaints/:id/assign", protect, authorize("Admin"), async (req, res) => {
  try {
    const { department } = req.body;
    if (!department) {
      return res.status(400).json({ message: "department is required" });
    }
    const canonicalDepartment = canonicalDepartmentName(department);

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.department = canonicalDepartment;
    await complaint.save();

    const authorities = await User.find({ role: "Authority" });
    await createManyNotifications(
      authorities
        .filter((user) => canonicalDepartmentName(user.department) === canonicalDepartment)
        .map((user) => user._id),
      `Complaint \"${complaint.title}\" assigned to ${canonicalDepartment}`
    );

    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/users", protect, authorize("Admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id", protect, authorize("Admin"), async (req, res) => {
  try {
    const { name, role, department } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department !== undefined) user.department = canonicalDepartmentName(department);

    await user.save();
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/users/:id", protect, authorize("Admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Promise.all([
      Notification.deleteMany({ userId: user._id }),
      Complaint.deleteMany({ createdBy: user._id }),
      User.deleteOne({ _id: user._id })
    ]);

    return res.json({ message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/departments", protect, authorize("Admin"), async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    return res.json(departments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/departments", protect, authorize("Admin"), async (req, res) => {
  try {
    const { name, area, issueTypesHandled } = req.body;
    if (!name || !area) {
      return res.status(400).json({ message: "name and area are required" });
    }

    const department = await Department.create({
      name,
      area,
      issueTypesHandled: Array.isArray(issueTypesHandled)
        ? issueTypesHandled
        : String(issueTypesHandled || "")
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
    });

    return res.status(201).json(department);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/departments/:id", protect, authorize("Admin"), async (req, res) => {
  try {
    const { name, area, issueTypesHandled } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (name) department.name = name;
    if (area) department.area = area;
    if (issueTypesHandled !== undefined) {
      department.issueTypesHandled = Array.isArray(issueTypesHandled)
        ? issueTypesHandled
        : String(issueTypesHandled)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
    }

    await department.save();
    return res.json(department);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/departments/:id", protect, authorize("Admin"), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    await department.deleteOne();
    return res.json({ message: "Department deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
