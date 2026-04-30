const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// 1. Student: Get My Payments
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ student: req.user.id })
            .populate('booking')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 2. Admin: Get All Payments
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('student', 'name email studentId')
            .populate({ path: 'booking', populate: { path: 'room', select: 'roomNumber roomType pricePerMonth' } })
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 3. Admin: Create Payment record
exports.createPayment = async (req, res) => {
    try {
        const { studentId, bookingId, amount, month, paymentMethod, note } = req.body;
        if (!studentId || !bookingId || !amount || !month) {
            return res.status(400).json({ msg: 'සියලු fields අනිවාර්යයි.' });
        }
        const payment = new Payment({
            student: studentId,
            booking: bookingId,
            amount,
            month,
            paymentMethod: paymentMethod || 'Cash',
            status: 'Paid',
            note: note || ''
        });
        await payment.save();
        res.status(201).json({ msg: 'Payment recorded!', payment });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 4. Admin: Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!payment) return res.status(404).json({ msg: 'Payment not found' });
        res.json({ msg: 'Payment updated!', payment });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 5. Admin: Delete payment
exports.deletePayment = async (req, res) => {
    try {
        await Payment.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Payment deleted.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

// 6. Admin: Generate monthly payments for all approved bookings
exports.generateMonthlyPayments = async (req, res) => {
    try {
        const { month } = req.body; // e.g. "2026-05"
        if (!month) return res.status(400).json({ msg: 'Month අනිවාර්යයි. (e.g. 2026-05)' });

        const approvedBookings = await Booking.find({ status: 'Approved' })
            .populate('room', 'pricePerMonth')
            .populate('student', '_id');

        let created = 0;
        for (const booking of approvedBookings) {
            const exists = await Payment.findOne({ booking: booking._id, month });
            if (!exists) {
                await Payment.create({
                    student: booking.student._id,
                    booking: booking._id,
                    amount: booking.room.pricePerMonth,
                    month,
                    status: 'Pending'
                });
                created++;
            }
        }
        res.json({ msg: `${created} payment records created for ${month}` });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};