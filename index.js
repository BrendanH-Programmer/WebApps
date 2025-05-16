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

app.use("/", authRoutes);
app.use("/patients", patientRoutes);
app.use("/rooms", roomRoutes);

app.listen(process.env.PORT || 10017, () => {
  console.log("Server is running");
});