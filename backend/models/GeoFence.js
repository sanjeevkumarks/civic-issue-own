const mongoose = require("mongoose");

const geoFenceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    coordinates: {
      type: [[[Number]]],
      required: true
    },
    department: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GeoFence", geoFenceSchema);
