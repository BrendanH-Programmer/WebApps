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


require("dotenv").config();

const app = express();

mongoose.connect("mongodb://20.0.153.128:10999/BrendanDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(session({
  secret: 'hospitalSecretKey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb://20.0.153.128:10999/BrendanDB",
    ttl: 14 * 24 * 60 * 60 // Session TTL (14 days)
  }),
  cookie: { secure: false } // Set to true if using HTTPS
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

app.listen(process.env.PORT || 10017, () => {
  console.log("Server is running");
});