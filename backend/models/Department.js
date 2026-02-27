const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    area: { type: String, required: true, trim: true },
    issueTypesHandled: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
