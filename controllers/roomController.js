const Room = require("../models/Room");
const Patient = require("../models/Patient");

// List all rooms
exports.index = async (req, res) => {
  try {
    const rooms = await Room.find().populate("currentPatients");
    res.render("rooms/index", { rooms, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching rooms");
  }
};

// Show a specific room
exports.show = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("currentPatients");
    if (!room) {
      return res.status(404).send("Room not found");
    }
    res.render("rooms/view", {
      room,
      patients: room.currentPatients,
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving room details");
  }
};

// Render form to create new room
exports.new = (req, res) => {
  res.render("rooms/new", { user: req.session.user });
};

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const newRoom = new Room({
      name: req.body.name.trim(),
      capacity: Number(req.body.capacity),
      status: req.body.status || "Available",
      isIsolation: req.body.isIsolation === "on",
    });
    await newRoom.save();

    res.redirect("/rooms");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating room");
  }
};

// Render edit form for a room
exports.edit = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).send("Room not found");
    }
    res.render("rooms/edit", { room, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving room for edit");
  }
};

// Update a room
exports.update = async (req, res) => {
  try {
    const updatedData = {
      name: req.body.name.trim(),
      capacity: Number(req.body.capacity),
      status: req.body.status,
      isIsolation: req.body.isIsolation === "on",
    };

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    res.redirect("/rooms");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating room");
  }
};

// Delete a room
exports.remove = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).send("Room not found");
    }

    // Unassign room from all patients
    await Patient.updateMany(
      { roomAssigned: room._id },
      { $unset: { roomAssigned: "" } }
    );

    await Room.findByIdAndDelete(room._id);

    res.redirect("/rooms");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting room");
  }
};

exports.getAvailableRooms = async () => {
  try {
    const rooms = await Room.find({}).populate("currentPatients");

    const availableRooms = rooms.filter(
      (room) => room.currentPatients.length < room.capacity
    );

    const availableIsolationRooms = availableRooms.filter(
      (room) => room.isIsolation === true
    );

    return {
      totalAvailable: availableRooms.length,
      isolationAvailable: availableIsolationRooms.length,
    };
  } catch (err) {
    console.error("Error getting available rooms:", err);
    return {
      totalAvailable: 0,
      isolationAvailable: 0
    };
  }
};