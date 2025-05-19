const mongoose = require("mongoose");

const SymptomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  riskValue: { type: Number, required: true }
});

module.exports = mongoose.model("Symptom", SymptomSchema);