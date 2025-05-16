const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { isAuthenticated } = require("../utils/authMiddleware");

router.get("/", isAuthenticated, patientController.index);
router.get("/new", isAuthenticated, patientController.new);
router.post("/", isAuthenticated, patientController.create);
router.get("/:id/edit", isAuthenticated, patientController.edit);
router.put("/:id", isAuthenticated, patientController.update);
router.delete("/:id", isAuthenticated, patientController.remove);

module.exports = router;
