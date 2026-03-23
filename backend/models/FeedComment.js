const mongoose = require("mongoose");

const feedCommentSchema = new mongoose.Schema(
  {
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedComment", feedCommentSchema);
