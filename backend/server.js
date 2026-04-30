const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
    credentials: false
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
const roomRoutes       = require('./routes/Roomroutes');
const studentRoutes    = require('./routes/studentRoutes');
const bookingRoutes    = require('./routes/Bookingroutes');
const paymentRoutes    = require('./routes/Paymentroutes');
const complaintRoutes  = require('./routes/Complaintroutes');

app.use('/api/rooms',      roomRoutes);
app.use('/api/students',   studentRoutes);
app.use('/api/bookings',   bookingRoutes);
app.use('/api/payments',   paymentRoutes);
app.use('/api/complaints', complaintRoutes);

app.get('/', (req, res) => res.json({ msg: '🚀 SafeStay Backend is running...' }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Atless Connected!"))
    .catch(err => console.error("❌ DB Error:", err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);

    
});


module.exports = app;