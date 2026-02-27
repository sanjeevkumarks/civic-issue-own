const Notification = require("../models/Notification");

const createNotification = async (userId, message) => {
  return Notification.create({ userId, message, seen: false });
};

const createManyNotifications = async (userIds, message) => {
  if (!userIds || userIds.length === 0) return [];
  const docs = userIds.map((id) => ({ userId: id, message, seen: false }));
  return Notification.insertMany(docs);
};

module.exports = { createNotification, createManyNotifications };
