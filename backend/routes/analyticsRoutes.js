const express = require("express");
const Complaint = require("../models/Complaint");
const { protect, authorize } = require("../middleware/auth");
const { enforceSlaBreaches, daysOpen } = require("../utils/sla");

const router = express.Router();

const buildMatch = (query) => {
  const match = {};
  if (query.category) match.category = query.category;
  if (query.department) match.department = query.department;
  if (query.dateFrom || query.dateTo) {
    match.createdAt = {};
    if (query.dateFrom) match.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) match.createdAt.$lte = new Date(query.dateTo);
  }
  return match;
};

router.get("/heatmap", protect, authorize("Admin", "Authority"), async (req, res) => {
  const match = buildMatch(req.query);
  const complaints = await Complaint.find(match).select("latitude longitude status title category");
  const points = complaints.map((c) => ({
    lat: c.latitude,
    lng: c.longitude,
    weight: c.status === "Resolved" ? 0.4 : c.status === "In Progress" ? 0.8 : 1
  }));
  res.json({ points, complaints });
});

router.get("/area-density", protect, authorize("Admin"), async (req, res) => {
  const match = buildMatch(req.query);
  const result = await Complaint.aggregate([
    { $match: match },
    { $group: { _id: "$area", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  res.json(result.map((r) => ({ area: r._id || "Unknown", count: r.count })));
});

router.get("/trends", protect, authorize("Admin"), async (req, res) => {
  const match = buildMatch(req.query);
  const granularity = req.query.granularity === "weekly" ? "weekly" : "monthly";
  const groupId =
    granularity === "weekly"
      ? { year: { $isoWeekYear: "$createdAt" }, period: { $isoWeek: "$createdAt" } }
      : { year: { $year: "$createdAt" }, period: { $month: "$createdAt" } };

  const created = await Complaint.aggregate([
    { $match: match },
    { $group: { _id: groupId, created: { $sum: 1 } } },
    { $sort: { "_id.year": 1, "_id.period": 1 } }
  ]);

  const resolved = await Complaint.aggregate([
    { $match: { ...match, status: "Resolved", resolvedAt: { $ne: null } } },
    {
      $group: {
        _id:
          granularity === "weekly"
            ? { year: { $isoWeekYear: "$resolvedAt" }, period: { $isoWeek: "$resolvedAt" } }
            : { year: { $year: "$resolvedAt" }, period: { $month: "$resolvedAt" } },
        resolved: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.period": 1 } }
  ]);

  const byCategory = await Complaint.aggregate([
    { $match: match },
    { $group: { _id: "$category", value: { $sum: 1 } } },
    { $sort: { value: -1 } }
  ]);

  res.json({
    granularity,
    created: created.map((r) => ({ ...r._id, created: r.created })),
    resolved: resolved.map((r) => ({ ...r._id, resolved: r.resolved })),
    byCategory: byCategory.map((r) => ({ category: r._id, value: r.value }))
  });
});

router.get("/department-performance", protect, authorize("Admin"), async (req, res) => {
  await enforceSlaBreaches();
  const complaints = await Complaint.find();
  const map = new Map();

  for (const c of complaints) {
    const dept = c.department || "Unassigned";
    if (!map.has(dept)) {
      map.set(dept, { department: dept, total: 0, resolved: 0, resolutionDaysSum: 0, slaBreach: 0 });
    }
    const row = map.get(dept);
    row.total += 1;
    if (c.slaBreached) row.slaBreach += 1;
    if (c.status === "Resolved" && c.resolvedAt) {
      row.resolved += 1;
      row.resolutionDaysSum += Math.max(
        0,
        Math.floor((new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      );
    }
  }

  const leaderboard = [...map.values()].map((r) => ({
    ...r,
    resolutionRate: r.total ? Math.round((r.resolved / r.total) * 100) : 0,
    avgResolutionDays: r.resolved ? Number((r.resolutionDaysSum / r.resolved).toFixed(2)) : 0
  }));

  leaderboard.sort((a, b) => b.resolutionRate - a.resolutionRate || a.avgResolutionDays - b.avgResolutionDays);
  res.json(leaderboard);
});

router.get("/officer-performance", protect, authorize("Admin"), async (req, res) => {
  const complaints = await Complaint.find({ updatedBy: { $ne: null } }).populate("updatedBy", "name email");
  const map = new Map();

  for (const c of complaints) {
    const officerId = String(c.updatedBy?._id || "unknown");
    const officerName = c.updatedBy?.name || "Unknown";
    if (!map.has(officerId)) {
      map.set(officerId, {
        officerId,
        officerName,
        totalHandled: 0,
        resolved: 0,
        responseDaysSum: 0,
        slaCompliant: 0
      });
    }
    const row = map.get(officerId);
    row.totalHandled += 1;
    if (c.status === "Resolved") row.resolved += 1;
    const endAt = c.resolvedAt ? new Date(c.resolvedAt) : new Date();
    row.responseDaysSum += Math.max(
      0,
      Math.floor((endAt.getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    );
    if (!c.slaBreached) row.slaCompliant += 1;
  }

  const data = [...map.values()].map((r) => ({
    ...r,
    avgResponseDays: r.totalHandled ? Number((r.responseDaysSum / r.totalHandled).toFixed(2)) : 0,
    slaCompliancePct: r.totalHandled ? Math.round((r.slaCompliant / r.totalHandled) * 100) : 0
  }));

  data.sort((a, b) => b.slaCompliancePct - a.slaCompliancePct);
  res.json(data);
});

module.exports = router;
