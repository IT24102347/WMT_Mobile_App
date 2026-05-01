const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Register Student
exports.registerStudent = async (req, res) => {
    try {
        const { name, email, password, course, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: "Name, Email and Password are mandatory." });
        }

        let student = await Student.findOne({ email: email.trim().toLowerCase() });
        if (student) return res.status(400).json({ msg: "This Email is already registered." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        student = new Student({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            course: course || 'Software Engineering',
            phone: phone || ''
            // studentId auto-generates via schema default
        });

        await student.save();
        res.status(201).json({ msg: "Registration successful!", student: { studentId: student.studentId, name: student.name } });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
};

// 2. Login Student
exports.loginStudent = async (req, res) => {
    const { email, password } = req.body;
    try {
        let student = await Student.findOne({ email: email.trim().toLowerCase() });
        if (!student) return res.status(400).json({ msg: "Email or Password is incorrect" });

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(400).json({ msg: "Email or Password is incorrect" });

        const payload = { student: { id: student.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret_key', { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, student: { id: student.id, name: student.name, email: student.email } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
};

// 3. Admin Login
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@safestay.com';
        const adminPass  = process.env.ADMIN_PASSWORD || 'admin123';

        if (email === adminEmail && password === adminPass) {
            const token = jwt.sign({ admin: { id: 'admin_id' } }, process.env.JWT_SECRET || 'your_jwt_secret_key', { expiresIn: '24h' });
            return res.json({ token, msg: "Admin Login Success" });
        }
        res.status(400).json({ msg: "Invalid Admin Credentials" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

// 4. Get Student Profile
exports.getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        if (!student) return res.status(404).json({ msg: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: "Profile fetch failed" });
    }
};

// 5. Update Profile
exports.updateStudentProfile = async (req, res) => {
    try {
        const { name, phone, profileImage, course } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (course) updateData.course = course;
        if (profileImage !== undefined) updateData.profileImage = profileImage;

        const student = await Student.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, returnDocument: 'after' }
        ).select('-password');

        res.json({ msg: "Profile updated!", student });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
};

// 6. Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ msg: 'Student not found' });

        const isMatch = await bcrypt.compare(currentPassword, student.password);
        if (!isMatch) return res.status(400).json({ msg: "The old password is incorrect" });

        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(newPassword, salt);
        await student.save();

        res.json({ msg: "Password changed successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// 7. Delete Student
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ msg: 'Student not found' });
        res.json({ msg: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 8. Get All Students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 }).select('-password');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
};

// 9. Admin Dashboard
exports.adminDashboard = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5).select('-password');
        res.json({ totalStudents, recentStudents });
    } catch (err) {
        res.status(500).json({ error: "Dashboard fetch failed" });
    }
};

// 10. Update Student By ID (Admin)
exports.updateStudentById = async (req, res) => {
    try {
        const { name, email, phone, course } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (course) updateData.course = course;

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
            
        ).select('-password');

        if (!student) return res.status(404).json({ msg: 'Student not found' });
        res.json({ msg: 'Student updated!', student });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
};