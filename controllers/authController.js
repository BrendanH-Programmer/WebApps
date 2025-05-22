const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Register a new user (default role: "nurse")
exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = new User({ username, password, role: "nurse" }); // role set to "nurse"
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send("Registration failed");
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log("Attempting login for:", username);
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found in DB");
      return res.status(400).send("User not found");
    }

    const match = await bcrypt.compare(password, user.password);
    console.log("Password match result:", match);
    if (!match) return res.status(400).send("Incorrect password");

    // Set the whole user object in session for easier access in views and controllers
    req.session.user = {
      _id: user._id,
      username: user.username,
      role: user.role,
    };

    res.redirect("/homepage");
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