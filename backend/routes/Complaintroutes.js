const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/Complaintcontroller');
const auth = require('../middleware/authMiddleware');

<<<<<<< HEAD
// Student  Routes
router.post('/', auth, complaintController.createComplaint);
router.get('/my', auth, complaintController.getMyComplaints);

// Admin  Routes
=======
// Student Routes
router.post('/', auth, complaintController.createComplaint);
router.get('/my', auth, complaintController.getMyComplaints);

// Admin Routes
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
router.get('/', auth, complaintController.getAllComplaints);
router.put('/:id', auth, complaintController.updateComplaint);
router.delete('/:id', auth, complaintController.deleteComplaint);

module.exports = router;