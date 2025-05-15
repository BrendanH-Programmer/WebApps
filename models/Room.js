const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({
  roomNumber: String,
  capacity: Number,
  currentPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
});
module.exports = mongoose.model("Room", roomSchema);