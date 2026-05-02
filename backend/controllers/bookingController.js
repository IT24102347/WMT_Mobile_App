<<<<<<< HEAD
//Room Booking Module IT24102938
=======
>>>>>>> 7a4d3308 (added by payment changes)
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// 1. Student: Create Booking
exports.createBooking = async (req, res) => {
    try {
        const { roomId, startDate, note } = req.body;
        if (!roomId || !startDate) {
            return res.status(400).json({ msg: 'The room and start date are mandatory.' });
        }

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ msg: 'Room not found' });
        if (room.availabilityStatus !== 'Available') {
            return res.status(400).json({ msg: 'This room is not available.' });
        }

        // Student already has active booking for this room?
        const existing = await Booking.findOne({
            student: req.user.id,
            room: roomId,
            status: { $in: ['Pending', 'Approved'] }
        });
        if (existing) return res.status(400).json({ msg: 'You already have a booking request for this room.' });

        // Anyone else has approved booking for this room already at capacity?
        const approvedCount = await Booking.countDocuments({ room: roomId, status: 'Approved' });
        if (approvedCount >= room.capacity) {
            return res.status(400).json({ msg: 'This room is full. Please select another room.' });
        }

        const booking = new Booking({
            student: req.user.id,
            room: roomId,
            startDate: new Date(startDate),
            note: note || ''
        });
        await booking.save();
        await booking.populate([
            { path: 'student', select: 'name studentId email' },
            { path: 'room', select: 'roomNumber roomType pricePerMonth' }
        ]);
        res.status(201).json({ msg: 'Booking request sent! Admin approval is pending.', booking });
    } catch (err) {
        console.error('createBooking error:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 2. Student: Get My Bookings
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ student: req.user.id })
            .populate('room', 'roomNumber roomType pricePerMonth image availabilityStatus')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 3. Student: Cancel Booking
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, student: req.user.id });
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });
        if (booking.status === 'Approved') {
            return res.status(400).json({ msg: 'Approved booking cannot be cancelled. Please contact Admin.' });
        }
        if (booking.status === 'Cancelled') {
            return res.status(400).json({ msg: 'Already cancelled.' });
        }
        booking.status = 'Cancelled';
        await booking.save();
        res.json({ msg: 'Booking cancelled.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 4. Admin: Get All Bookings (with full student + room details)
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('student', 'name email studentId course phone')
            .populate('room', 'roomNumber roomType pricePerMonth availabilityStatus capacity currentOccupancy')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 5. Admin: Approve Booking
exports.approveBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });
        if (booking.status === 'Approved') return res.status(400).json({ msg: 'Booking is already approved.' });

        booking.status = 'Approved';
        await booking.save();

        // Room occupancy update
        const room = await Room.findById(booking.room);
        if (room) {
            room.currentOccupancy = (room.currentOccupancy || 0) + 1;
            if (room.currentOccupancy >= room.capacity) {
                room.availabilityStatus = 'Occupied';
            }
            await room.save();
        }

        res.json({ msg: 'Booking approved! ✅' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 6. Admin: Reject Booking
exports.rejectBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });

        const wasApproved = booking.status === 'Approved';
        booking.status = 'Rejected';
        await booking.save();

        // If was approved, free up room
        if (wasApproved) {
            const room = await Room.findById(booking.room);
            if (room) {
                room.currentOccupancy = Math.max(0, (room.currentOccupancy || 1) - 1);
                if (room.currentOccupancy < room.capacity) {
                    room.availabilityStatus = 'Available';
                }
                await room.save();
            }
        }

        res.json({ msg: 'Booking rejected.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 7. Admin: Delete Booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });
        res.json({ msg: 'Booking deleted.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};