const mongoose = require("mongoose");
const Symptom = require("../models/Symptom");

async function seedSymptoms() {
  try {
    await mongoose.connect("mongodb://20.0.153.128:10999/BrendanDB");
    console.log("MongoDB connected");

    await Symptom.deleteMany(); // Optional: clear existing symptoms
    console.log("Existing symptoms cleared");

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

    await Symptom.insertMany(symptoms);
    console.log("Symptoms seeded successfully");
  } catch (error) {
    console.error("Error seeding symptoms:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

seedSymptoms();
