const express = require("express");
const AgentLocation = require("../models/AgentLocation");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/agents", protect, authorize("Admin"), async (req, res) => {
  const latest = await AgentLocation.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$userId",
        latitude: { $first: "$latitude" },
        longitude: { $first: "$longitude" },
        timestamp: { $first: "$timestamp" },
        onDuty: { $first: "$onDuty" }
      }
    },
    { $match: { onDuty: true } }
  ]);

  const userIds = latest.map((l) => l._id);
  const users = await User.find({ _id: { $in: userIds } }).select("name department");
  const map = new Map(users.map((u) => [String(u._id), u]));
  res.json(
    latest.map((l) => ({
      userId: l._id,
      latitude: l.latitude,
      longitude: l.longitude,
      timestamp: l.timestamp,
      name: map.get(String(l._id))?.name || "Unknown",
      department: map.get(String(l._id))?.department || "Unknown"
    }))
  );
});

router.get("/agents/:id/history", protect, authorize("Admin", "Authority"), async (req, res) => {
  const history = await AgentLocation.find({ userId: req.params.id }).sort({ timestamp: -1 }).limit(500);
  res.json(history);
});

module.exports = router;
