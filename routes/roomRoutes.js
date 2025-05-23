const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { isAuthenticated, allowRoles, isAdmin } = require("../utils/authMiddleware");

router.get("/", isAuthenticated, allowRoles(["admin", "nurse"]), roomController.index);
router.get("/new", isAuthenticated, allowRoles(["admin"]), roomController.new);
router.post("/", isAuthenticated, allowRoles(["admin"]), roomController.createRoom);
router.get("/:id", isAuthenticated, allowRoles(["admin", "nurse"]), roomController.show);
router.get("/:id/edit", isAuthenticated, allowRoles(["admin"]), roomController.edit);
router.put("/:id", isAuthenticated, allowRoles(["admin"]), roomController.update);
router.delete("/:id", isAuthenticated, isAdmin, roomController.remove);

module.exports = router;