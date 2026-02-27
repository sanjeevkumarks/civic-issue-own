const categoryDepartmentMap = {
  Road: "Roads Department",
  Garbage: "Sanitation Department",
  Streetlight: "Electrical Department",
  Drainage: "Drainage Department",
  Water: "Water Department"
};

const getDepartmentForCategory = (category) => {
  return categoryDepartmentMap[category] || "General Civic";
};

module.exports = { getDepartmentForCategory };
