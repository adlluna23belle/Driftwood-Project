const User = require('../models/user');

const checkAdmin = async (req, res, next) => {
    try {
        // Kukunin ang token mula sa Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN_HERE"

        if (!token) {
            return res.status(401).json({ message: "Access Denied: No Token Provided." });
        }

        // Hahanapin sa database kung kanino ang token na ito at kung active admin ba siya
        const user = await User.findOne({ where: { token } });

        if (!user) {
            return res.status(403).json({ message: "Invalid or Expired Token." });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ message: "Your account is deactivated." });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Access Denied: Admins Only." });
        }

        // Kung pumasa sa lahat ng check, itutuloy ang request sa susunod na controller function
        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { checkAdmin };