<<<<<<< HEAD
// ============================================================
// Bookingroutes.js - Express Router
// This route file was created by Room Booking Module
// Handles all booking-related API endpoints
// Part of: Room Booking Management Feature
// ============================================================
=======
>>>>>>> 7a4d3308 (added by payment changes)
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/authMiddleware');

// Student Routes
router.post('/', auth, bookingController.createBooking);
router.get('/my', auth, bookingController.getMyBookings);
router.put('/cancel/:id', auth, bookingController.cancelBooking);

// Admin Routes
router.get('/', auth, bookingController.getAllBookings);
router.put('/approve/:id', auth, bookingController.approveBooking);
router.put('/reject/:id', auth, bookingController.rejectBooking);
router.delete('/:id', auth, bookingController.deleteBooking);

module.exports = router;