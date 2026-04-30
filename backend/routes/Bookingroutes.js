const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/BookingController');
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