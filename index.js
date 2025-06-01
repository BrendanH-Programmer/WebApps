const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const roomRoutes = require("./routes/roomRoutes");
const symptomRoutes = require("./routes/symptomRoutes");
const { setUserInViews } = require("./utils/authMiddleware");

// Load environment variables from .env file
require("dotenv").config();


// Create an Express application
const app = express();


// Connect to MongoDB database
mongoose.connect("mongodb://20.0.153.128:10999/BrendanDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

  
// Set view engine to EJS for rendering dynamic HTML pages
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the 'public' directory (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// Parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Enable method override to support PUT/DELETE via query param (e.g., ?_method=PUT)
app.use(methodOverride("_method"));

// Configure session management using MongoDB for session storage
app.use(session({
  secret: 'hospitalSecretKey', // Secret key for signing the session ID cookie
  resave: false, // Do not save session if unmodified
  saveUninitialized: false, // Do not create session until something is stored
  store: MongoStore.create({
    mongoUrl: "mongodb://20.0.153.128:10999/BrendanDB", // Store sessions in the same MongoDB
    ttl: 14 * 24 * 60 * 60 // Session expires after 14 days
  }),
  cookie: { secure: false } // Set to true if serving over HTTPS (e.g., in production)
}));

// Middleware before your routes
app.use(setUserInViews);


// Route definitions (after middleware)
app.use("/", authRoutes);
app.use("/patients", patientRoutes);
app.use("/rooms", roomRoutes);
app.use("/symptoms", symptomRoutes);


// Middleware to handle 403 Forbidden (access denied)
function forbiddenHandler(req, res, next) {
  const err = new Error("Forbidden");
  err.status = 403;
  next(err);
}

// 404 Not Found
app.use((req, res) => {
  res.status(404).render("errors/404", { url: req.originalUrl });
});

// Error handling middleware - catches all errors passed with next(err)
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.status === 403) {
    res.status(403).render("errors/403");
  } else {
    res.status(err.status || 500).render("errors/500");
  }
});

// Redirect root URL ('/') to homepage
app.get('/', (req, res) => {
  res.redirect('/homepage');
});

// Start the server on specified port (from .env or default to 10017)
app.listen(process.env.PORT || 10017, () => {
  console.log("Server is running");
});