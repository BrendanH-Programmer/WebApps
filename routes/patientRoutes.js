const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/", patientController.index);
router.get("/new", patientController.new);
router.post("/", patientController.create);
router.get("/:id/edit", patientController.edit);
router.put("/:id", patientController.update);
router.delete("/:id", patientController.remove);
router.get("/", isAuthenticated, patientController.index);

module.exports = router;