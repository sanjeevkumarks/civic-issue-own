const webpush = require("web-push");
const PushSubscription = require("../models/PushSubscription");

let configured = false;

const configurePush = () => {
  if (configured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@civic.local";
  if (!publicKey || !privateKey) return;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
};

const sendPushToUser = async (userId, payload) => {
  configurePush();
  if (!configured) return;
  const subscriptions = await PushSubscription.find({ userId });
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription, JSON.stringify(payload));
      } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    })
  );
};

module.exports = { configurePush, sendPushToUser };
