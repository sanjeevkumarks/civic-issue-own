const Department = require("../models/Department");

const defaultDepartments = [
  {
    name: "Roads Department",
    area: "City Wide",
    issueTypesHandled: ["Road"]
  },
  {
    name: "Sanitation Department",
    area: "City Wide",
    issueTypesHandled: ["Garbage"]
  },
  {
    name: "Electrical Department",
    area: "City Wide",
    issueTypesHandled: ["Streetlight"]
  },
  {
    name: "Drainage Department",
    area: "City Wide",
    issueTypesHandled: ["Drainage"]
  },
  {
    name: "Water Department",
    area: "City Wide",
    issueTypesHandled: ["Water"]
  }
];

const seedDefaultDepartments = async () => {
  const count = await Department.countDocuments();
  if (count > 0) return;
  await Department.insertMany(defaultDepartments);
  console.log("Seeded default departments");
};

module.exports = seedDefaultDepartments;
