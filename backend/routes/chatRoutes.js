const express = require("express");
const Message = require("../models/Message");
const Complaint = require("../models/Complaint");
const { protect } = require("../middleware/auth");
const { getIO } = require("../utils/socket");

const router = express.Router();

const canAccessComplaint = (complaint, user) => {
  if (!complaint) return false;
  if (user.role === "Admin") return true;
  if (String(complaint.createdBy) === String(user._id)) return true;
  return user.role === "Authority" && complaint.department === user.department;
};

router.get("/:complaintId", protect, async (req, res) => {
  const complaint = await Complaint.findById(req.params.complaintId);
  if (!canAccessComplaint(complaint, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const messages = await Message.find({ complaintId: req.params.complaintId }).sort({ timestamp: 1 });
  res.json(messages);
});

router.post("/:complaintId", protect, async (req, res) => {
  const complaint = await Complaint.findById(req.params.complaintId);
  if (!canAccessComplaint(complaint, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const message = await Message.create({
    complaintId: req.params.complaintId,
    senderId: req.user._id,
    senderName: req.user.name,
    message: req.body.message,
    timestamp: new Date()
  });

  const io = getIO();
  if (io) {
    io.to(`complaint:${req.params.complaintId}`).emit("chat:new-message", message);
  }
  res.status(201).json(message);
});

module.exports = router;
