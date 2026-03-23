const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    authorityId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorityName: { type: String, required: true },
    text: { type: String, default: "" },
    image: { type: String, default: "" },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", storySchema);
