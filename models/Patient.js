const mongoose = require("mongoose");
const patientSchema = new mongoose.Schema({
  title: {
    type: String,
    enum: ["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof", "Mx"], // Add more as needed
  },
  firstName: String,
  surname: String,
  age: Number,
  symptoms: [String],
  infectionRisk: Number,
  roomAssigned: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
});
module.exports = mongoose.model("Patient", patientSchema);