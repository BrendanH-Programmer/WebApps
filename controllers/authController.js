const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Register a new user (default role: "nurse")
exports.register = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists (optional, but useful)
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      const err = new Error("Username already taken");
      err.status = 400;
      return next(err);
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Always hash passwords!
    const newUser = new User({
      username,
      password: hashedPassword,
      role: "nurse", // Default role
    });

    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error("Registration error:", err);
    err.status = 500;
    next(err);
  }
};

// Login
exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  console.log("Attempting login for:", username);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found in DB");
      const err = new Error("Invalid username or password");
      err.status = 400;
      return next(err);
    }

    const match = await bcrypt.compare(password, user.password);
    console.log("Password match result:", match);

    if (!match) {
      const err = new Error("Invalid username or password");
      err.status = 400;
      return next(err);
    }

    // Set session user object
    req.session.user = {
      _id: user._id,
      username: user.username,
      role: user.role,
    };

    res.redirect("/homepage");
  } catch (err) {
    console.error("Login error:", err);
    err.status = 500;
    next(err);
  }
};

// Logout
exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      err.status = 500;
      return next(err);
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};
