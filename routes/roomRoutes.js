const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/", roomController.index);
router.get("/", isAuthenticated, patientController.index);

module.exports = router;