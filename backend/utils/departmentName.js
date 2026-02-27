const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeDepartmentName = (value) => {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};

const canonicalDepartmentName = (value) => {
  const normalized = normalizeDepartmentName(value);
  if (!normalized) return "General Civic";

  const aliases = {
    "roads department": "Roads Department",
    roads: "Roads Department",
    road: "Roads Department",
    "road department": "Roads Department",
    "road dept": "Roads Department",
    "sanitation department": "Sanitation Department",
    sanitation: "Sanitation Department",
    garbage: "Sanitation Department",
    "garbage department": "Sanitation Department",
    "electrical department": "Electrical Department",
    electrical: "Electrical Department",
    streetlight: "Electrical Department",
    "street light": "Electrical Department",
    "streetlight department": "Electrical Department",
    "drainage department": "Drainage Department",
    drainage: "Drainage Department",
    drain: "Drainage Department",
    "water department": "Water Department",
    water: "Water Department",
    "general civic": "General Civic",
    general: "General Civic"
  };

  return aliases[normalized] || String(value || "").trim().replace(/\s+/g, " ");
};

const departmentRegex = (value) => {
  const trimmed = canonicalDepartmentName(value);
  return new RegExp(`^\\s*${escapeRegex(trimmed)}\\s*$`, "i");
};

module.exports = {
  normalizeDepartmentName,
  canonicalDepartmentName,
  departmentRegex
};
