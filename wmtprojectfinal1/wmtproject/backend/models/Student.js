const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    studentId: {
        type: String,
        unique: true,
        default: () => `STU${Date.now()}`   // ✅ Auto generate
    },
    course: { type: String, default: 'Software Engineering' },
    phone: { type: String, default: '' },
    profileImage: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);