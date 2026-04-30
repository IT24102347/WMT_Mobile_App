const express = require('express');
const router = express.Router();
const Paymentcontroller = require('../controllers/Paymentcontroller');
const auth = require('../middleware/authMiddleware');

// Student
router.get('/my', auth, Paymentcontroller.getMyPayments);

// Admin
router.get('/', auth, Paymentcontroller.getAllPayments);
router.post('/', auth, Paymentcontroller.createPayment);
router.post('/generate', auth, Paymentcontroller.generateMonthlyPayments);
router.put('/:id', auth, Paymentcontroller.updatePaymentStatus);
router.delete('/:id', auth, Paymentcontroller.deletePayment);

module.exports = router;