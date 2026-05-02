// ============================================================
// Roomroutes.js - Express Router
// This route file was created by Room Booking Module
// Handles all room management API endpoints
// Part of: Room Booking Management Feature
// ============================================================
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/authMiddleware');

// Public / Student routes
router.get('/', auth, roomController.getAllRooms);
router.get('/available', auth, roomController.getAvailableRooms);
router.get('/:id', auth, roomController.getRoomById);

// Admin only routes
router.post('/', auth, roomController.createRoom);
router.put('/:id', auth, roomController.updateRoom);
router.delete('/:id', auth, roomController.deleteRoom);

module.exports = router;