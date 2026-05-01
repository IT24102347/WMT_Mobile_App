const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/Complaintcontroller');
const auth = require('../middleware/authMiddleware');

// Student Routes
router.post('/', auth, complaintController.createComplaint);
router.get('/my', auth, complaintController.getMyComplaints);

// Admin Routes
router.get('/', auth, complaintController.getAllComplaints);
router.put('/:id', auth, complaintController.updateComplaint);
router.delete('/:id', auth, complaintController.deleteComplaint);

module.exports = router;