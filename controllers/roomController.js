const Room = require("../models/Room");
exports.index = async (req, res) => {
  const rooms = await Room.find().populate("currentPatients");
  res.render("rooms/index", { rooms });
};
