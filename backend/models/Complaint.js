const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
>>>>>>> 4df35ae9 (added by room management)
    subject: {
        type: String,
        required: true
    },
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
>>>>>>> 4df35ae9 (added by room management)
    message: {
        type: String,
        required: true
    },
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
>>>>>>> 4df35ae9 (added by room management)
    category: {
        type: String,
        enum: ['Room Issue', 'Maintenance', 'Payment Issue', 'Other'],
        default: 'Other'
    },
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
>>>>>>> 4df35ae9 (added by room management)
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
>>>>>>> 4df35ae9 (added by room management)
    adminReply: {
        type: String,
        default: ''
    }
<<<<<<< HEAD
<<<<<<< HEAD
}, 

{ timestamps: true });
=======
}, { timestamps: true });
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
}, { timestamps: true });
>>>>>>> 4df35ae9 (added by room management)

module.exports = mongoose.model('Complaint', ComplaintSchema);