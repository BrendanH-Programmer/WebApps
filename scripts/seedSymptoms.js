const mongoose = require("mongoose");
const Symptom = require("../models/Symptom");

const symptoms = [
  { name: "Cough", riskValue: 2 },
  { name: "Cold", riskValue: 2 },
  { name: "Fever", riskValue: 3 },
  { name: "Fatigue", riskValue: 1 },
  { name: "Headache", riskValue: 1 },
  { name: "Sore Throat", riskValue: 3 },
  { name: "Shortness Of Breath", riskValue: 2 },
  { name: "Loss Of Smell", riskValue: 3 }
];

async function seed() {
  await mongoose.connect("mongodb://localhost:27017/hospital");
  await Symptom.deleteMany({});
  await Symptom.insertMany(symptoms);
  console.log("Symptoms seeded");
  mongoose.disconnect();
}

seed();
