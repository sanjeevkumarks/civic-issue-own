const express = require("express");
const booleanPointInPolygon = require("@turf/boolean-point-in-polygon").default;
const { point, polygon } = require("@turf/helpers");

const GeoFence = require("../models/GeoFence");
const Complaint = require("../models/Complaint");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("Admin", "Authority"), async (req, res) => {
  const fences = await GeoFence.find().sort({ createdAt: -1 });
  res.json(fences);
});

router.post("/", protect, authorize("Admin"), async (req, res) => {
  const { name, coordinates, department } = req.body;
  if (!name || !department || !Array.isArray(coordinates) || coordinates.length < 3) {
    return res.status(400).json({ message: "name, department and valid polygon coordinates are required" });
  }
  const fence = await GeoFence.create({
    name,
    coordinates: [coordinates],
    department,
    createdBy: req.user._id
  });
  res.status(201).json(fence);
});

router.delete("/:id", protect, authorize("Admin"), async (req, res) => {
  const fence = await GeoFence.findById(req.params.id);
  if (!fence) return res.status(404).json({ message: "GeoFence not found" });
  await fence.deleteOne();
  res.json({ message: "GeoFence deleted" });
});

router.get("/inside/:complaintId", protect, authorize("Admin", "Authority"), async (req, res) => {
  const complaint = await Complaint.findById(req.params.complaintId);
  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  const p = point([complaint.longitude, complaint.latitude]);
  const fences = await GeoFence.find();
  const inside = fences.filter((f) =>
    booleanPointInPolygon(p, polygon(f.coordinates))
  );
  res.json(inside);
});

module.exports = router;
