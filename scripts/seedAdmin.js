const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

async function seedAdmin() {
  try {
    await mongoose.connect("mongodb://20.0.153.128:10999/BrendanDB"); // direct connection string
    console.log("MongoDB connected");

    const adminUsername = "admin"; // or use any value you want
    const adminPassword = "admin123"; // change to a strong password

    const existingAdmin = await User.findOne({ username: adminUsername });
    if (existingAdmin) {
      console.log("Admin already exists");
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = new User({
        username: adminUsername,
        password: hashedPassword,
        role: "admin"
      });
      await admin.save();
      console.log("Admin user created successfully");
    }
  } catch (err) {
    console.error("Error seeding admin:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

seedAdmin();
