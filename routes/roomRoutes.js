const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { isAuthenticated } = require("../utils/authMiddleware");

router.get("/", isAuthenticated, roomController.index);

module.exports = router;