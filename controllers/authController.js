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

    req.session.userId = user._id;
    req.session.role = user.role;
    res.redirect("/rooms");
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
