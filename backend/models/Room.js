// Room models
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    roomType: {
        type: String,
        enum: ['Single', 'Double', 'Triple'],
        required: true
    },
    pricePerMonth: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    currentOccupancy: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    availabilityStatus: {
        type: String,
        enum: ['Available', 'Occupied', 'Maintenance'],
        default: 'Available'
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
