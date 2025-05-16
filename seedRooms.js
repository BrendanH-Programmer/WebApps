const mongoose = require("mongoose");
const Room = require("./models/Room");

async function seedRooms() {
  try {
    await mongoose.connect("mongodb://20.0.153.128:10999/BrendanDB");
    console.log("✅ MongoDB connected");

    await Room.deleteMany(); // Optional: remove existing rooms
    console.log("🧹 Existing rooms cleared");

    const rooms = [
      { name: "101", capacity: 2, currentPatients: [], isIsolation: false },
      { name: "102", capacity: 1, currentPatients: [], isIsolation: true },
      { name: "103", capacity: 3, currentPatients: [], isIsolation: false },
      { name: "104", capacity: 2, currentPatients: [], isIsolation: false },
      { name: "105", capacity: 1, currentPatients: [], isIsolation: true },
      { name: "106", capacity: 4, currentPatients: [], isIsolation: false },
      { name: "107", capacity: 2, currentPatients: [], isIsolation: false },
      { name: "108", capacity: 1, currentPatients: [], isIsolation: true },
      { name: "109", capacity: 3, currentPatients: [], isIsolation: false },
      { name: "110", capacity: 2, currentPatients: [], isIsolation: false },
      { name: "111", capacity: 1, currentPatients: [], isIsolation: true }
    ];

    await Room.insertMany(rooms);
    console.log("✅ Rooms seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding rooms:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

seedRooms();