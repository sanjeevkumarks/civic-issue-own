const express = require("express");

const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/:id/seen", protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.seen = true;
    await notification.save();

    return res.json(notification);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/seen/all", protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, seen: false }, { $set: { seen: true } });
    return res.json({ message: "All notifications marked as seen" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
