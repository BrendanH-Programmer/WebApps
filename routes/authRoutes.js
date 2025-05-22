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


// Protected routes
router.post("/rooms", isAuthenticated, isAdmin, roomController.createRoom);
router.get("/patients", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.index);

module.exports = router;