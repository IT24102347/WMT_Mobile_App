const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
    subject: {
        type: String,
        required: true
    },
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
    message: {
        type: String,
        required: true
    },
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
    category: {
        type: String,
        enum: ['Room Issue', 'Maintenance', 'Payment Issue', 'Other'],
        default: 'Other'
    },
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
    adminReply: {
        type: String,
        default: ''
    }
<<<<<<< HEAD
}, 

{ timestamps: true });
=======
}, { timestamps: true });
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb

module.exports = mongoose.model('Complaint', ComplaintSchema);