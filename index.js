// Load environment variables from .env
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const path = require("path");

// Import routes
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const roomRoutes = require("./routes/roomRoutes");
const symptomRoutes = require("./routes/symptomRoutes");

// Import custom middleware
const { setUserInViews } = require("./utils/authMiddleware");

const app = express();

// Get environment variables
const PORT = process.env.PORT || 10017;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hospitalDB";
const SESSION_SECRET = process.env.SESSION_SECRET || "hospitalSecretKey";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Method override for PUT/DELETE
app.use(methodOverride("_method"));

// Session management
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: 14 * 24 * 60 * 60, // 14 days
  }),
  cookie: { secure: false }, // Set to true if using HTTPS
}));

// Middleware: User in views
app.use(setUserInViews);

// Routes
app.use("/", authRoutes);
app.use("/patients", patientRoutes);
app.use("/rooms", roomRoutes);
app.use("/symptoms", symptomRoutes);

// 403 Forbidden handler
app.use((req, res, next) => {
  const err = new Error("Forbidden");
  err.status = 403;
  next(err);
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("errors/404", { url: req.originalUrl });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.status === 403) {
    res.status(403).render("errors/403");
  } else {
    res.status(err.status || 500).render("errors/500");
  }
});

// Redirect root to homepage
app.get('/', (req, res) => {
  res.redirect('/homepage');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});