const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { createManyNotifications } = require("./notify");
const { sendPushToUser } = require("./push");

const daysOpen = (createdAt) => {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

const slaState = (createdAt, status) => {
  if (status === "Resolved") return "resolved";
  const days = daysOpen(createdAt);
  if (days <= 3) return "green";
  if (days <= 7) return "yellow";
  return "red";
};

const enforceSlaBreaches = async () => {
  const breached = await Complaint.find({
    status: { $ne: "Resolved" },
    escalated: false,
    createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  if (!breached.length) return 0;

  const admins = await User.find({ role: "Admin" }).select("_id");
  const adminIds = admins.map((a) => a._id);

  for (const complaint of breached) {
    complaint.slaBreached = true;
    complaint.escalated = true;
    if (complaint.status === "Pending") {
      complaint.status = "In Progress";
      complaint.progress = Math.max(complaint.progress, 10);
    }
    await complaint.save();
    await createManyNotifications(
      adminIds,
      `SLA breach escalated: ${complaint.title} (${complaint.department})`
    );
    await Promise.all(
      adminIds.map((id) =>
        sendPushToUser(id, {
          title: "SLA Breach Escalated",
          body: complaint.title,
          complaintId: complaint._id
        })
      )
    );
  }

  return breached.length;
};

module.exports = { daysOpen, slaState, enforceSlaBreaches };
