const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
<<<<<<< HEAD

=======
>>>>>>> 7a4d3308 (added by payment changes)
    subject: {
        type: String,
        required: true
    },
<<<<<<< HEAD

=======
>>>>>>> 7a4d3308 (added by payment changes)
    message: {
        type: String,
        required: true
    },
<<<<<<< HEAD

=======
>>>>>>> 7a4d3308 (added by payment changes)
    category: {
        type: String,
        enum: ['Room Issue', 'Maintenance', 'Payment Issue', 'Other'],
        default: 'Other'
    },
<<<<<<< HEAD

=======
>>>>>>> 7a4d3308 (added by payment changes)
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
<<<<<<< HEAD

=======
>>>>>>> 7a4d3308 (added by payment changes)
    adminReply: {
        type: String,
        default: ''
    }
<<<<<<< HEAD
}, 


{ timestamps: true });


module.exports = mongoose.model('Complaint', ComplaintSchema);

=======
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
>>>>>>> 7a4d3308 (added by payment changes)
