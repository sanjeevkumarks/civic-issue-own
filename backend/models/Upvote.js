const mongoose = require("mongoose");

const upvoteSchema = new mongoose.Schema(
  {
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

upvoteSchema.index({ complaintId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Upvote", upvoteSchema);
