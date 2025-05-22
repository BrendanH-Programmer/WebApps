const Room = require("../models/Room");
const Patient = require("../models/Patient");

// GET: List all rooms
exports.listRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("currentPatients");
    res.render("rooms/index", { rooms, user: req.user });
  } catch (err) {
    res.status(500).send("Error fetching rooms");
  }
};

// GET: Show form to create new room (admin only)
exports.newRoomForm = (req, res) => {
  res.render("rooms/new");
};

// POST: Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { name, capacity, isIsolation, notes } = req.body;
    const room = new Room({ name, capacity, isIsolation, notes });
    await room.save();
    res.redirect("/rooms");
  } catch (err) {
    res.status(400).send("Error creating room: " + err.message);
  }
};

// GET: Show edit form for room (admin only)
exports.editRoomForm = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    res.render("rooms/edit", { room });
  } catch (err) {
    res.status(404).send("Room not found");
  }
};

// PUT: Update room (admin only)
exports.updateRoom = async (req, res) => {
  try {
    const { name, capacity, status, isIsolation, notes } = req.body;
    await Room.findByIdAndUpdate(req.params.id, {
      name,
      capacity,
      status,
      isIsolation,
      notes
    });
    res.redirect("/rooms");
  } catch (err) {
    res.status(400).send("Error updating room");
  }
};

// DELETE: Delete room (admin only)
exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.redirect("/rooms");
  } catch (err) {
    res.status(500).send("Error deleting room");
  }
};

// GET: View room details and patients in it
exports.viewRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("currentPatients");
    const patients = await Patient.find();   // fetch all patients

    res.render("rooms/show", { room, patients });  // pass patients to template
  } catch (err) {
    res.status(404).send("Room not found");
  }
};

// PUT: Assign patient to a room
exports.assignPatientToRoom = async (req, res) => {
  try {
    const { patientId } = req.body;
    const room = await Room.findById(req.params.id);
    if (room.currentPatients.length >= room.capacity) {
      return res.status(400).send("Room is full");
    }
    if (!room.currentPatients.includes(patientId)) {
      room.currentPatients.push(patientId);
      if (room.currentPatients.length === room.capacity) {
        room.status = "Full";
      } else {
        room.status = "Available";
      }
      await room.save();
    }
    res.redirect("/rooms/" + room._id);
  } catch (err) {
    res.status(400).send("Error assigning patient");
  }
};

// PUT: Remove patient from room
exports.removePatientFromRoom = async (req, res) => {
  try {
    const { patientId } = req.body;
    const room = await Room.findById(req.params.id);
    room.currentPatients = room.currentPatients.filter(id => id.toString() !== patientId);
    room.status = room.currentPatients.length >= room.capacity ? "Full" : "Available";
    await room.save();
    res.redirect("/rooms/" + room._id);
  } catch (err) {
    res.status(400).send("Error removing patient");
  }
};