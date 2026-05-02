//Room Booking Module IT24102938
const Room = require('../models/Room');

// 1. Create Room (Admin only)
exports.createRoom = async (req, res) => {
    try {
        const {
            roomNumber, roomType, pricePerMonth,
            capacity, currentOccupancy, description, image, availabilityStatus
        } = req.body;

        // Required fields check
        if (!roomNumber || !pricePerMonth || !capacity) {
            return res.status(400).json({ msg: 'roomNumber, pricePerMonth, and capacity are required' });
        }

        // Duplicate room number check
        const existing = await Room.findOne({ roomNumber: roomNumber.trim() });
        if (existing) {
            return res.status(400).json({ msg: `Room number "${roomNumber}" already exists` });
        }

        const parsedCapacity = Number(capacity);
        const parsedOccupancy = Number(currentOccupancy) || 0;

        // Auto status based on occupancy
        let autoStatus = availabilityStatus || 'Available';
        if (autoStatus !== 'Maintenance') {
            autoStatus = parsedOccupancy >= parsedCapacity ? 'Occupied' : 'Available';
        }

        const room = new Room({
            roomNumber: roomNumber.trim(),
            roomType: roomType || 'Single',
            pricePerMonth: Number(pricePerMonth),
            capacity: parsedCapacity,
            currentOccupancy: parsedOccupancy,
            description: description || '',
            image: image || '',
            availabilityStatus: autoStatus,
        });

        const savedRoom = await room.save();
        console.log('✅ Room created:', savedRoom.roomNumber);
        res.status(201).json({ msg: 'Room created successfully', room: savedRoom });

    } catch (err) {
        console.error('❌ createRoom Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// 2. Update Room (Admin only)
exports.updateRoom = async (req, res) => {
    try {
        let room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ msg: 'Room not found' });

        const {
            roomNumber, roomType, pricePerMonth,
            capacity, currentOccupancy, description, image, availabilityStatus
        } = req.body;

        const updatedCapacity = capacity !== undefined ? Number(capacity) : room.capacity;
        const updatedOccupancy = currentOccupancy !== undefined ? Number(currentOccupancy) : room.currentOccupancy;

        // Auto status logic
        let updatedStatus = availabilityStatus || room.availabilityStatus;
        if (updatedStatus !== 'Maintenance') {
            updatedStatus = updatedOccupancy >= updatedCapacity ? 'Occupied' : 'Available';
        }

        const updatedFields = {
            roomNumber: roomNumber ? roomNumber.trim() : room.roomNumber,
            roomType: roomType || room.roomType,
            pricePerMonth: pricePerMonth !== undefined ? Number(pricePerMonth) : room.pricePerMonth,
            capacity: updatedCapacity,
            currentOccupancy: updatedOccupancy,
            description: description !== undefined ? description : room.description,
            image: image !== undefined ? image : room.image,
            availabilityStatus: updatedStatus,
        };

        room = await Room.findByIdAndUpdate(
            req.params.id,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        console.log('✅ Room updated:', room.roomNumber);
        res.json({ msg: 'Room updated successfully', room });

    } catch (err) {
        console.error('❌ updateRoom Error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 3. Get All Rooms
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ createdAt: -1 });
        console.log(`✅ getAllRooms: ${rooms.length} rooms found`);
        res.json(rooms);
    } catch (err) {
        console.error('❌ getAllRooms Error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 4. Get Available Rooms (Student view)
exports.getAvailableRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ availabilityStatus: 'Available' }).sort({ pricePerMonth: 1 });
        console.log(`✅ getAvailableRooms: ${rooms.length} rooms found`);
        res.json(rooms);
    } catch (err) {
        console.error('❌ getAvailableRooms Error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 5. Get Room by ID
exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ msg: 'Room not found' });
        res.json(room);
    } catch (err) {
        console.error('❌ getRoomById Error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};

// 6. Delete Room
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ msg: 'Room not found' });
        console.log('✅ Room deleted:', room.roomNumber);
        res.json({ msg: 'Room deleted successfully' });
    } catch (err) {
        console.error('❌ deleteRoom Error:', err.message);
        res.status(500).json({ error: 'Server Error' });
    }
};