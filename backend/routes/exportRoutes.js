const express = require("express");
const { Parser } = require("json2csv");
const Complaint = require("../models/Complaint");
const { protect, authorize } = require("../middleware/auth");
const { slaState } = require("../utils/sla");

const router = express.Router();

router.get("/complaints.csv", protect, authorize("Admin"), async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.department) query.department = req.query.department;
  if (req.query.category) query.category = req.query.category;

  const complaints = await Complaint.find(query).sort({ createdAt: -1 });
  const rows = complaints.map((c) => ({
    ID: c._id,
    Title: c.title,
    Category: c.category,
    Status: c.status,
    Area: c.area,
    Department: c.department,
    CreatedAt: c.createdAt,
    ResolvedAt: c.resolvedAt || "",
    SLAStatus: slaState(c.createdAt, c.status)
  }));

  const parser = new Parser({
    fields: ["ID", "Title", "Category", "Status", "Area", "Department", "CreatedAt", "ResolvedAt", "SLAStatus"]
  });
  const csv = parser.parse(rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=complaints.csv");
  res.send(csv);
});

module.exports = router;
