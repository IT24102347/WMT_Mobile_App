const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/authMiddleware');

// ── Public Routes ──────────────────────────────────────────
router.post('/register', studentController.registerStudent);
router.post('/login', studentController.loginStudent);
router.post('/admin/login', studentController.loginAdmin);

// ── Student Routes (auth required) ────────────────────────

router.get('/profile', auth, studentController.getStudentProfile);
router.put('/profile', auth, studentController.updateStudentProfile);
router.put('/change-password', auth, studentController.changePassword); 

// ── Admin Routes (auth required) ───────────────────────────
router.get('/admin/dashboard', auth, studentController.adminDashboard);
router.get('/', auth, studentController.getAllStudents);
router.post('/', auth, studentController.registerStudent);
router.put('/:id', auth, studentController.updateStudentById);   // ✅ dynamic route 
router.delete('/:id', auth, studentController.deleteStudent);

module.exports = router;