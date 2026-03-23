const mongoose = require("mongoose");

const agentLocationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    onDuty: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AgentLocation", agentLocationSchema);
