const mongoose = require("mongoose");

// Define the Symptom schema
const SymptomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  riskValue: { type: Number, required: true }
});

module.exports = mongoose.model("Symptom", SymptomSchema);