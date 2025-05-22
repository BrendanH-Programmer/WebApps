const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const roomController = require("../controllers/roomController");
const patientController = require("../controllers/patientController");
const { isAuthenticated, isAdmin, allowRoles } = require("../utils/authMiddleware");

// Auth routes
router.get("/register", (req, res) => res.render("register"));
router.post("/register", authController.register);
router.get("/login", (req, res) => res.render("login"));
router.post("/login", authController.login);

// Homepage/dashboard (protected)
router.get("/homepage", isAuthenticated, (req, res) => {
  res.render("homepage", { user: req.session.user, stats: { totalPatientsToday: 42 /* or from DB */ } });
});


// Patients routes
router.get("/patients", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.index);
router.get("/patients/new", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.new);
router.post("/patients", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.create);

// Rooms routes
router.get("/rooms", isAuthenticated, allowRoles(["admin", "nurse"]), roomController.index);
router.post("/rooms", isAuthenticated, isAdmin, roomController.createRoom);

module.exports = router;