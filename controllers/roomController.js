const Room = require("../models/Room");
exports.index = async (req, res) => {
  const rooms = await Room.find().populate("currentPatients");
  res.render("rooms/index", { rooms });
};

// controllers/roomController.js
exports.create = (req, res) => {
  // Example logic
  console.log("Creating room:", req.body);
  res.send("Room created");
};
