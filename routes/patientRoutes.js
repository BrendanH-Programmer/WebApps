const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { isAuthenticated, allowRoles, isAdmin } = require("../utils/authMiddleware");

router.get("/", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.index);
router.get("/new", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.new);
router.post("/", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.create);
router.get("/:id/edit", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.edit);
router.put("/:id", isAuthenticated, allowRoles(["admin", "nurse"]), patientController.update);
router.delete("/:id", isAuthenticated, isAdmin, patientController.remove); // Admin only

module.exports = router;
