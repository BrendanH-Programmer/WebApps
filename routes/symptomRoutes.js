const express = require("express");
const router = express.Router();
const symptomsController = require("../controllers/symptomsController");
const { isAuthenticated, allowRoles, isAdmin } = require("../utils/authMiddleware");

router.get("/", isAuthenticated, allowRoles(["admin", "nurse"]), symptomsController.getAllSymptoms);
router.get("/new", isAuthenticated, allowRoles(["admin"]), symptomsController.showAddForm);
router.post("/", isAuthenticated, allowRoles(["admin"]), symptomsController.create);
router.get("/:id/edit", isAuthenticated, allowRoles(["admin"]), symptomsController.edit);
router.put("/:id", isAuthenticated, allowRoles(["admin"]), symptomsController.update);
router.delete("/:id", isAuthenticated, allowRoles(["admin"]), symptomsController.delete);

module.exports = router;