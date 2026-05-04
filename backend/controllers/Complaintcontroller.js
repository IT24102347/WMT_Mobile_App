const Complaint = require('../models/Complaint');

// 1. Student: Submit Complaint.
exports.createComplaint = async (req, res) => {
    try {
        const { subject, message, category } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ msg: 'Subject and Message are required.' });
        }

        // req.user.id or req.user._id (both handled)
        const studentId = req.user._id || req.user.id;
        if (!studentId) {
            return res.status(401).json({ msg: 'Student not identified. Please login again.' });
        }

        const complaint = new Complaint({
            student: studentId,
            subject,
            message,
            category: category || 'Other'
        });
        await complaint.save();
        await complaint.populate('student', 'name studentId email');

        res.status(201).json({ msg: 'Complaint submitted! Admin review is pending.', complaint });
    } catch (err) {
        console.error('createComplaint error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};


// 2. Student: Get My Complaints.
exports.getMyComplaints = async (req, res) => {
    try {
        const studentId = req.user._id || req.user.id;
        const complaints = await Complaint.find({ student: studentId })
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        console.error('getMyComplaints error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};


// 3. Admin: Get All Complaints.
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('student', 'name email studentId')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        console.error('getAllComplaints error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};


// 4. Admin: Update complaint status + reply.
exports.updateComplaint = async (req, res) => {
    try {
        const { status, adminReply } = req.body;
        const update = {};
        if (status) update.status = status;
        if (adminReply !== undefined) update.adminReply = adminReply;

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        ).populate('student', 'name email studentId');

        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });
        res.json({ msg: 'Complaint updated!', complaint });
    } catch (err) {
        console.error('updateComplaint error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};


// 5. Admin: Delete complaint.
exports.deleteComplaint = async (req, res) => {
    try {
        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Complaint deleted.' });
    } catch (err) {
        console.error('deleteComplaint error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};