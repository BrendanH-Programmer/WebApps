const Room = require("../models/Room");

exports.assignRoomToPatient = async (patient) => {
  // Try to find an isolation room first if infectionRisk is high
  const query = patient.infectionRisk > 5
    ? { isIsolation: true }
    : {};

  const rooms = await Room.find(query);

  for (let room of rooms) {
    if (room.currentPatients.length < room.capacity) {
      return room;
    }
  }

  return null; // No room found
};