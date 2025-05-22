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

exports.show = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('currentPatients');
    const patients = await Patient.find();  // fetch all patients

    if (!room) {
      return res.status(404).send('Room not found');
    }

    res.render('rooms/view', { room, patients, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving room details');
  }
};

// Render form to create new room
exports.new = (req, res) => {
  res.render("rooms/new", { user: req.session.user });
};

// Create new room
exports.createRoom = async (req, res) => {
  try {
    const newRoom = new Room({
      name: req.body.name.trim(),
      capacity: Number(req.body.capacity),
      status: req.body.status || "Available",
      isIsolation: req.body.isIsolation === "on",
      notes: req.body.notes || "",
    });
    await newRoom.save();
    res.redirect("/rooms");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating room");
  }
};

// Render edit room form
exports.edit = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).send("Room not found");
    res.render("rooms/edit", { room, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving room for edit");
  }
};

// Update room
exports.update = async (req, res) => {
  try {
    const updatedData = {
      name: req.body.name.trim(),
      capacity: Number(req.body.capacity),
      status: req.body.status,
      isIsolation: req.body.isIsolation === "on",
      notes: req.body.notes || "",
    };

    await Room.findByIdAndUpdate(req.params.id, updatedData);
    res.redirect("/rooms");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating room");
  }
};

// Delete room
exports.remove = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).send("Room not found");

    // Remove roomAssigned reference from all patients currently assigned here
    await Patient.updateMany(
      { roomAssigned: room._id },
      { $unset: { roomAssigned: "" } }
    );

    await Room.findByIdAndDelete(req.params.id);
    res.redirect("/rooms");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting room");
  }
};