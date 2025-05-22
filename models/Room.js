const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Avoid duplicate room names
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ["Available", "Full", "Maintenance"],
    default: "Available"
  },
  isIsolation: {
    type: Boolean,
    default: false
  },
  currentPatients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
  }],
  notes: {
    type: String
  }
});

module.exports = mongoose.model("Room", roomSchema);