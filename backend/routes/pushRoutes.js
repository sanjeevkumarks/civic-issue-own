const express = require("express");
const PushSubscription = require("../models/PushSubscription");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/vapid-public-key", protect, (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY || "" });
});

router.post("/subscribe", protect, async (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ message: "subscription required" });
  await PushSubscription.findOneAndUpdate(
    { userId: req.user._id, "subscription.endpoint": subscription.endpoint },
    { subscription },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json({ message: "Subscribed" });
});

router.post("/unsubscribe", protect, async (req, res) => {
  const { endpoint } = req.body;
  await PushSubscription.deleteMany({ userId: req.user._id, "subscription.endpoint": endpoint });
  res.json({ message: "Unsubscribed" });
});

module.exports = router;
