const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const roomController = require("../controllers/roomController");
const patientController = require("../controllers/patientController");
const { isAuthenticated, isAdmin, allowRoles } = require("../utils/authMiddleware");
const { getTotalPatients } = require("../controllers/patientController");
const { getAvailableRooms } = require("../controllers/roomController");

// Auth routes
router.get("/register", (req, res) => res.render("register"));
router.post("/register", authController.register);
router.get("/login", (req, res) => res.render("login"));
router.post("/login", authController.login);

// Homepage/dashboard (protected)
router.get("/homepage", isAuthenticated, async (req, res) => {
  try {
    const totalPatients = await getTotalPatients();
    const { totalAvailable, isolationAvailable } = await getAvailableRooms();

    res.render("homepage", {
      user: req.session.user,
      stats: {
        totalPatients,
        availableRooms: totalAvailable,
        isolationRoomsAvailable: isolationAvailable,
      }
    });
  } catch (err) {
    console.error("Error loading homepage:", err);
    res.status(500).send("Server error");
  }
});

// Patients routes
router.get("/patients", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.index);
router.get("/patients/new", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.new);
router.post("/patients", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.create);

// Rooms routes
router.get("/rooms", isAuthenticated, allowRoles(["admin", "nurse"]), roomController.index);
router.post("/rooms", isAuthenticated, isAdmin, roomController.createRoom);

module.exports = router;