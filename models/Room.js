const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
  isIsolation: { type: Boolean, default: false }
});
module.exports = mongoose.model("Room", roomSchema);