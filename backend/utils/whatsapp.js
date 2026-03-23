const twilio = require("twilio");

let client;

const getClient = () => {
  if (client) return client;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  client = twilio(sid, token);
  return client;
};

const sendWhatsApp = async (toPhone, message) => {
  if (!process.env.WHATSAPP_ENABLED || process.env.WHATSAPP_ENABLED !== "true") return;
  const c = getClient();
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!c || !from || !toPhone) return;
  await c.messages.create({
    from: `whatsapp:${from}`,
    to: `whatsapp:${toPhone}`,
    body: message
  });
};

module.exports = { sendWhatsApp };
