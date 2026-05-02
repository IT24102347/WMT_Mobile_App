const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },

    subject: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    category: {
        type: String,
        enum: ['Room Issue', 'Maintenance', 'Payment Issue', 'Other'],
        default: 'Other'
    },

    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending'
    },

    adminReply: {
        type: String,
        default: ''
    }
}, 


{ timestamps: true });


module.exports = mongoose.model('Complaint', ComplaintSchema);

