const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { isAuthenticated, isAdmin } = require("../utils/authMiddleware");

// ==============================
// Admin Routes
// ==============================

// Create new room form (Admin only)
router.get("/new", isAuthenticated, isAdmin, roomController.newRoomForm);

// Create room (Admin only)
router.post("/", isAuthenticated, isAdmin, roomController.createRoom);

// Edit room form (Admin only)
router.get("/:id/edit", isAuthenticated, isAdmin, roomController.editRoomForm);

// Update room (Admin only)
router.put("/:id", isAuthenticated, isAdmin, roomController.updateRoom);

// Delete room (Admin only)
router.delete("/:id", isAuthenticated, isAdmin, roomController.deleteRoom);

// ==============================
// Shared Routes (Nurse or Admin)
// ==============================

// View all rooms
router.get("/", isAuthenticated, roomController.listRooms);

// View single room
router.get("/:id", isAuthenticated, roomController.viewRoom);

// Assign patient to room
router.post("/:id/assign", isAuthenticated, roomController.assignPatientToRoom);

// Remove patient from room
router.post("/:id/remove", isAuthenticated, roomController.removePatientFromRoom);

module.exports = router;