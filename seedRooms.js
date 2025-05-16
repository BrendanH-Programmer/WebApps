const mongoose = require("mongoose");
const Room = require("./models/Room");

mongoose.connect("mongodb://20.0.153.128:10999/BrendanDB")
  .then(async () => {
    console.log("MongoDB connected");

    await Room.deleteMany(); // Optional: clears existing rooms

    const rooms = [
        { name: "Room 101", capacity: 2, currentPatients: [], isIsolation: false },
        { name: "Room 102", capacity: 1, currentPatients: [], isIsolation: true },
        { name: "Room 103", capacity: 3, currentPatients: [], isIsolation: false },
        { name: "Room 104", capacity: 2, currentPatients: [], isIsolation: false },
        { name: "Room 105", capacity: 1, currentPatients: [], isIsolation: true },
        { name: "Room 106", capacity: 4, currentPatients: [], isIsolation: false },
        { name: "Room 107", capacity: 2, currentPatients: [], isIsolation: false },
        { name: "Room 108", capacity: 1, currentPatients: [], isIsolation: true },
        { name: "Room 109", capacity: 3, currentPatients: [], isIsolation: false },
        { name: "Room 110", capacity: 2, currentPatients: [], isIsolation: false },
        { name: "Room 111", capacity: 1, currentPatients: [], isIsolation: true },
    ];

    await Room.insertMany(rooms);
    console.log("Rooms seeded successfully");
    process.exit();
  })
  .catch(err => console.error("Connection error:", err));