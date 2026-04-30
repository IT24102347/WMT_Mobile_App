const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    let token = req.header('x-auth-token');

    // Header එක පරීක්ෂා කිරීම
    if (!token) {
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
        
        // Admin හෝ Student දත්ත req.user වෙත දැමීම
        if (decoded.admin) {
            req.user = { ...decoded.admin, role: 'admin' };
        } else if (decoded.student) {
            req.user = { ...decoded.student, role: 'student' };
        } else {
            return res.status(401).json({ msg: 'Invalid Token Structure' });
        }
        
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};