const extractArea = (address) => {
  if (!address) return "Unknown";
  const parts = String(address)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 3] || parts[0];
  return parts[0] || "Unknown";
};

module.exports = { extractArea };
