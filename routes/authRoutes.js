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
router.get("/homepage", isAuthenticated, async (req, res, next) => {
  try {
    const totalPatients = await patientController.getTotalPatients();
    const { totalAvailable, isolationAvailable } = await roomController.getAvailableRooms();

    res.render("homepage", {
      user: req.session.user,
      stats: {
        totalPatients,
        availableRooms: totalAvailable,
        isolationRoomsAvailable: isolationAvailable,
      },
    });
  } catch (err) {
    console.error("Error loading homepage:", err);
    err.status = 500;
    next(err);
  }
});

// Search route - protected
router.get("/search", isAuthenticated, async (req, res, next) => {
  const { type, q } = req.query;
  let results = [];

  try {
    if (type === "patient") {
      results = await patientController.searchPatients(q);
    } else if (type === "room") {
      results = await roomController.searchRooms(q);
    }

    res.render("searchResults", {
      user: req.session.user,
      results,
      type,
      query: q,
    });
  } catch (err) {
    console.error("Search error:", err);
    err.status = 500;
    next(err);
  }
});

// Patients routes
router.get("/patients", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.index);
router.get("/patients/new", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.new);
router.post("/patients", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.create);

// Rooms routes
router.get("/rooms", isAuthenticated, allowRoles(["admin", "nurse"]), roomController.index);
router.post("/rooms", isAuthenticated, isAdmin, roomController.createRoom);

// Logout route
router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to destroy session during logout:", err);
      err.status = 500;
      return next(err);
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

module.exports = router;