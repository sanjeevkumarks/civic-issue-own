const express = require("express");
const booleanPointInPolygon = require("@turf/boolean-point-in-polygon").default;
const { point, polygon } = require("@turf/helpers");

const Complaint = require("../models/Complaint");
const User = require("../models/User");
const GeoFence = require("../models/GeoFence");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");
const { getDepartmentForCategory } = require("../utils/departmentMapping");
const { createManyNotifications } = require("../utils/notify");
const {
  canonicalDepartmentName,
  normalizeDepartmentName
} = require("../utils/departmentName");
const { extractArea } = require("../utils/area");
const { sendPushToUser } = require("../utils/push");
const { sendWhatsApp } = require("../utils/whatsapp");
const { getIO } = require("../utils/socket");

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
      area: extractArea(address),
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
    await Promise.all(
      authorities.map((authority) =>
        sendPushToUser(authority._id, {
          title: "New Complaint",
          body: `${complaint.title} (${complaint.category})`,
          complaintId: complaint._id
        })
      )
    );

    const p = point([complaint.longitude, complaint.latitude]);
    const fences = await GeoFence.find({ department: complaint.department });
    const inFences = fences.filter((f) => booleanPointInPolygon(p, polygon(f.coordinates)));
    if (inFences.length) {
      const targetIds = authorities.map((a) => a._id);
      await createManyNotifications(
        targetIds,
        `Geo-fence alert: ${complaint.title} is inside a protected zone`
      );
      await Promise.all(
        targetIds.map((id) =>
          sendPushToUser(id, {
            title: "Geo-fence Alert",
            body: complaint.title,
            complaintId: complaint._id
          })
        )
      );
    }

    if (req.user.phone && req.user.whatsappOptIn) {
      await sendWhatsApp(
        req.user.phone,
        `Hello ${req.user.name}, your complaint #${complaint._id} (${complaint.title}) is received. Track it in the app.`
      );
    }

    const io = getIO();
    if (io) {
      io.emit("complaints:new", complaint);
    }

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
