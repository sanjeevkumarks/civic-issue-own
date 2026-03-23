const express = require("express");
const Complaint = require("../models/Complaint");
const Upvote = require("../models/Upvote");
const FeedComment = require("../models/FeedComment");
const Story = require("../models/Story");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { extractArea } = require("../utils/area");

const router = express.Router();

router.get("/feed", protect, async (req, res) => {
  const complaints = await Complaint.find()
    .sort({ createdAt: -1 })
    .populate("createdBy", "name department");
  const ids = complaints.map((c) => c._id);
  const comments = await FeedComment.find({ complaintId: { $in: ids } }).sort({ createdAt: -1 });
  const upvotes = await Upvote.find({ complaintId: { $in: ids } });

  const commentMap = new Map();
  comments.forEach((c) => {
    const key = String(c.complaintId);
    if (!commentMap.has(key)) commentMap.set(key, []);
    commentMap.get(key).push(c);
  });

  const upvoteCount = upvotes.reduce((acc, u) => {
    const key = String(u.complaintId);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  res.json(
    complaints.map((c) => ({
      ...c.toObject(),
      upvotesCount: upvoteCount[String(c._id)] || 0,
      comments: commentMap.get(String(c._id)) || []
    }))
  );
});

router.post("/complaints/:id/upvote", protect, async (req, res) => {
  const existing = await Upvote.findOne({ complaintId: req.params.id, userId: req.user._id });
  if (existing) {
    await existing.deleteOne();
  } else {
    await Upvote.create({
      complaintId: req.params.id,
      userId: req.user._id,
      timestamp: new Date()
    });
  }
  const count = await Upvote.countDocuments({ complaintId: req.params.id });
  await Complaint.findByIdAndUpdate(req.params.id, { upvotesCount: count });
  res.json({ upvoted: !existing, count });
});

router.get("/complaints/:id/comments", protect, async (req, res) => {
  const comments = await FeedComment.find({ complaintId: req.params.id }).sort({ createdAt: -1 });
  res.json(comments);
});

router.post("/complaints/:id/comments", protect, async (req, res) => {
  const comment = await FeedComment.create({
    complaintId: req.params.id,
    userId: req.user._id,
    userName: req.user.name,
    text: req.body.text
  });
  res.status(201).json(comment);
});

router.get("/stories", protect, async (req, res) => {
  const stories = await Story.find({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  res.json(stories);
});

router.post("/stories", protect, authorize("Authority"), upload.single("image"), async (req, res) => {
  const story = await Story.create({
    authorityId: req.user._id,
    authorityName: req.user.name,
    text: req.body.text || "",
    image: req.file ? `/uploads/${req.file.filename}` : "",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
  res.status(201).json(story);
});

router.get("/profile/:userId", protect, async (req, res) => {
  const user = await User.findById(req.params.userId).select("name department");
  if (!user) return res.status(404).json({ message: "User not found" });
  const complaints = await Complaint.find({ createdBy: req.params.userId }).sort({ createdAt: -1 });
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  res.json({
    user,
    totals: { total: complaints.length, resolved },
    posts: complaints
  });
});

router.get("/explore", protect, async (req, res) => {
  const query = {};
  if (req.query.category) query.category = req.query.category;
  if (req.query.status) query.status = req.query.status;
  if (req.query.area) query.area = new RegExp(req.query.area, "i");

  let complaints = await Complaint.find(query).sort({ createdAt: -1 }).populate("createdBy", "name");
  if (req.query.trending === "true") {
    complaints = complaints.sort((a, b) => b.upvotesCount - a.upvotesCount);
  }

  if (req.query.keyword) {
    const keyword = req.query.keyword.toLowerCase();
    complaints = complaints.filter(
      (c) =>
        c.title.toLowerCase().includes(keyword) ||
        c.description.toLowerCase().includes(keyword) ||
        extractArea(c.address).toLowerCase().includes(keyword)
    );
  }

  res.json(complaints);
});

module.exports = router;
