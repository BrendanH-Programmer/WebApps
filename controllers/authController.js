const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Register a new user (default role: "nurse")
exports.register = async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = new User({ username, password: hashedPassword, role: "nurse" }); // role set to "nurse"
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send("Registration failed");
  }
};

// Login an existing user
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send("Incorrect password");

    // Set session
    req.session.userId = user._id;
    req.session.role = user.role; // 👈 Set role in session
    res.redirect("/dashboard"); // You can route differently based on role if desired
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Login failed");
  }
};

// Logout the current user
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
