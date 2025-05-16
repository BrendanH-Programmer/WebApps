const Room = require("../models/Room");

exports.assignRoomToPatient = async (patient) => {
  const rooms = await Room.find().populate("currentPatients");

  for (let room of rooms) {
    if (patient.infectionRisk >= 7 && room.isIsolationRoom && room.currentPatients.length < room.capacity) {
      return room;
    } else if (patient.infectionRisk < 7 && !room.isIsolationRoom && room.currentPatients.length < room.capacity) {
      return room;
    }
  }

  return null; // No available room
};