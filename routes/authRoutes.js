const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { ensureRole, ensureAnyRole } = require("../middleware/authMiddleware");

router.get("/register", (req, res) => res.render("register"));
router.post("/register", authController.register);
router.get("/login", (req, res) => res.render("login"));
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/rooms", ensureRole("admin"), roomController.create);
router.get("/patients", ensureAnyRole(["admin", "nurse"]), patientController.index);
module.exports = router;