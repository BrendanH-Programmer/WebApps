const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { isAuthenticated, allowRoles, isAdmin } = require("../utils/authMiddleware");
const { getPatients } = require("../controllers/patientController");
const { buildSymptomRiskMap } = require("../controllers/patientController");

// Patient Routes
router.get("/", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.index);
router.get("/new", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.new);
router.get("/:id", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.show);
router.post("/", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.create);
router.get("/:id/edit", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.edit);
router.put("/:id", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.update);
router.delete("/:id", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.remove);

module.exports = router;