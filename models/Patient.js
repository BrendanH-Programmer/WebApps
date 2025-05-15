const mongoose = require("mongoose");
const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  symptoms: [String],
  infectionRisk: Number,
  roomAssigned: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
});
module.exports = mongoose.model("Patient", patientSchema);