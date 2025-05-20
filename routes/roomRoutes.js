const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { isAuthenticated, allowRoles } = require("../utils/authMiddleware");

router.get("/", isAuthenticated, allowRoles(["admin", "nurse"]), roomController.index);

module.exports = router;