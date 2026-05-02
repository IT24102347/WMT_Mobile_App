<<<<<<< HEAD
// routes/Complaintroutes.js

=======
>>>>>>> 7a4d3308 (added by payment changes)
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/Complaintcontroller');
const auth = require('../middleware/authMiddleware');

<<<<<<< HEAD
// Student  Routes
router.post('/', auth, complaintController.createComplaint);
router.get('/my', auth, complaintController.getMyComplaints);


=======
// Student Routes
router.post('/', auth, complaintController.createComplaint);
router.get('/my', auth, complaintController.getMyComplaints);

>>>>>>> 7a4d3308 (added by payment changes)
// Admin Routes
router.get('/', auth, complaintController.getAllComplaints);
router.put('/:id', auth, complaintController.updateComplaint);
router.delete('/:id', auth, complaintController.deleteComplaint);

<<<<<<< HEAD

module.exports = router;

=======
module.exports = router;
>>>>>>> 7a4d3308 (added by payment changes)
