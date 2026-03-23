const mongoose = require("mongoose");

const complaintCommentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    byRole: { type: String, required: true },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Road", "Garbage", "Streetlight", "Drainage", "Water"],
      required: true
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending"
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    department: { type: String, default: "General Civic" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date, default: null },
    slaBreached: { type: Boolean, default: false },
    escalated: { type: Boolean, default: false },
    area: { type: String, default: "Unknown" },
    upvotesCount: { type: Number, default: 0 },
    comments: [complaintCommentSchema],
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
