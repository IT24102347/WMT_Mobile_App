const Complaint = require('../models/Complaint');

<<<<<<< HEAD
<<<<<<< HEAD
// 1.Student: Submit Complaint
=======
// 1. Student: Submit Complaint
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
// 1. Student: Submit Complaint
>>>>>>> 4df35ae9 (added by room management)
exports.createComplaint = async (req, res) => {
    try {
        const { subject, message, category } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ msg: 'Subject and Message are required.' });
        }

        const complaint = new Complaint({
            student: req.user.id,
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

<<<<<<< HEAD
<<<<<<< HEAD
// 2.Student: Get My Complaints
=======
// 2. Student: Get My Complaints
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
// 2. Student: Get My Complaints
>>>>>>> 4df35ae9 (added by room management)
exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ student: req.user.id })
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

<<<<<<< HEAD
<<<<<<< HEAD
// 3.Admin: Get All Complaints
=======
// 3. Admin: Get All Complaints
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
// 3. Admin: Get All Complaints
>>>>>>> 4df35ae9 (added by room management)
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('student', 'name email studentId')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

<<<<<<< HEAD
<<<<<<< HEAD
// 4.Admin: Update complaint status + reply
=======
// 4. Admin: Update complaint status + reply
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
// 4. Admin: Update complaint status + reply
>>>>>>> 4df35ae9 (added by room management)
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
        res.status(500).json({ msg: 'Server Error' });
    }
};

<<<<<<< HEAD
<<<<<<< HEAD
// 5.Admin: Delete complaint
=======
// 5. Admin: Delete complaint
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
// 5. Admin: Delete complaint
>>>>>>> 4df35ae9 (added by room management)
exports.deleteComplaint = async (req, res) => {
    try {
        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Complaint deleted.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};