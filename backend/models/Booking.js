//Room Booking Module IT24102938
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
