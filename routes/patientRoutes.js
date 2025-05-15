const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

router.get("/", patientController.index);
router.get("/new", patientController.new);
router.post("/", patientController.create);
router.get("/:id/edit", patientController.edit);
router.put("/:id", patientController.update);
router.delete("/:id", patientController.remove);

module.exports = router;