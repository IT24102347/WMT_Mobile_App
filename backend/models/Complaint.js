const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
<<<<<<< HEAD

=======
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
>>>>>>> 4df35ae9 (added by room management)
>>>>>>> 4ba963d5d3baed19f0525d42881e3cf2d2c9bcdd
    subject: {
        type: String,
        required: true
    },
<<<<<<< HEAD

=======
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
>>>>>>> 4df35ae9 (added by room management)
>>>>>>> 4ba963d5d3baed19f0525d42881e3cf2d2c9bcdd
    message: {
        type: String,
        required: true
    },
<<<<<<< HEAD

=======
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
>>>>>>> 4df35ae9 (added by room management)
>>>>>>> 4ba963d5d3baed19f0525d42881e3cf2d2c9bcdd
    category: {
        type: String,
        enum: ['Room Issue', 'Maintenance', 'Payment Issue', 'Other'],
        default: 'Other'
    },
<<<<<<< HEAD

=======
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
>>>>>>> 4df35ae9 (added by room management)
>>>>>>> 4ba963d5d3baed19f0525d42881e3cf2d2c9bcdd
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
<<<<<<< HEAD

=======
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
>>>>>>> 4df35ae9 (added by room management)
>>>>>>> 4ba963d5d3baed19f0525d42881e3cf2d2c9bcdd
    adminReply: {
        type: String,
        default: ''
    }
<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 4ba963d5d3baed19f0525d42881e3cf2d2c9bcdd
}, 


{ timestamps: true });
<<<<<<< HEAD
=======
=======
}, { timestamps: true });
>>>>>>> bd3b878c5dfc98d0144a091bd4021e74eaff1ccb
=======
}, { timestamps: true });
>>>>>>> 4df35ae9 (added by room management)
>>>>>>> 4ba963d5d3baed19f0525d42881e3cf2d2c9bcdd

module.exports = mongoose.model('Complaint', ComplaintSchema);