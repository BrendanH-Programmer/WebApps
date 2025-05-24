const Room = require("../models/Room");
const Patient = require("../models/Patient");

// List all rooms
exports.index = async (req, res) => {
  try {
    const sortField = req.query.sort || 'name';  // default sort field
    const sortOrder = req.query.order === 'desc' ? -1 : 1; // default ascending

    // Fetch rooms and populate currentPatients so length can be used
    let rooms = await Room.find().populate('currentPatients');

    // Sort after fetching because sorting by currentPatients.length requires populated data
    rooms.sort((a, b) => {
      switch (sortField) {
        case 'name':
          return a.name.localeCompare(b.name) * sortOrder;
        case 'capacity':
          return (a.capacity - b.capacity) * sortOrder;
        case 'currentPatients':
          return (a.currentPatients.length - b.currentPatients.length) * sortOrder;
        case 'isolation':
          // Sort false before true for asc, reverse for desc
          return ((a.isIsolation === b.isIsolation) ? 0 : a.isIsolation ? 1 : -1) * sortOrder;
        default:
          return 0;
      }
    });

    res.render('rooms/index', {
      rooms,
      currentSort: { field: sortField, order: sortOrder === 1 ? 'asc' : 'desc' }
    });
  } catch (error) {
  res.status(500).send(error.message || 'Error fetching rooms');
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
  res.status(500).send(err.message || "Error retrieving room details");
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
  res.status(500).send(err.message || "Error creating room");
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
  res.status(500).send(err.message || "Error retrieving room for edit");
  }
};

// Update a room
exports.update = async (req, res) => {
  try {
    // Check if any patients assigned to this room
    const patientsAssigned = await Patient.find({ roomAssigned: req.params.id });
    if (patientsAssigned.length > 0) {
      return res.status(400).send("Cannot update room while patients are assigned.");
    }

    const updatedData = {
      name: req.body.name.trim(),
      capacity: Number(req.body.capacity),
      status: req.body.status,
      isIsolation: req.body.isIsolation === "on",
    };

    await Room.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.redirect("/rooms");
  } catch (err) {
  res.status(500).send(err.message || "Error updating room");
  }
};

// Delete a room
exports.remove = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).send("Room not found");
    }

    // Check if any patients assigned to this room
    const patientsAssigned = await Patient.find({ roomAssigned: room._id });
    if (patientsAssigned.length > 0) {
      return res.status(400).send("Cannot delete room while patients are assigned.");
    }

    await Room.findByIdAndDelete(room._id);
    res.redirect("/rooms");
  } catch (err) {
  res.status(500).send(err.message || "Error deleting room");
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
    return {
      totalAvailable: 0,
      isolationAvailable: 0,
      error: err.message || "Error getting available rooms"
    };
  }
};

exports.searchRooms = async (query) => {
  try {
    const regex = new RegExp(query, "i");

    // Interpret 'true' or 'false' strings to actual booleans
    let isIsolationFilter = undefined;
    if (query.toLowerCase() === "true") isIsolationFilter = true;
    else if (query.toLowerCase() === "false") isIsolationFilter = false;

    const conditions = [
      { name: regex },
      { status: regex }
    ];

    if (typeof isIsolationFilter === "boolean") {
      conditions.push({ isIsolation: isIsolationFilter });
    }

    const rooms = await Room.find({
      $or: conditions
    });

    return rooms;
  } catch (err) {
  return { rooms: [], error: err.message || "Error searching rooms" };
  }
};