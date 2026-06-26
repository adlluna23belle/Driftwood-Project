const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// 1. Public Registration (Palaging 'user' o Customer ang role nito)
exports.register = async (req, res) => {
    try {
        const { username, firstName, surname, email, password } = req.body;
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) return res.status(400).json({ message: "Email is already registered." });

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) return res.status(400).json({ message: "Username is already taken." });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await User.create({ 
            username, firstName, surname, email, 
            password: hashedPassword,
            role: 'user' // Puwersadong 'user' (customer) kapag galing sa labas
        });

        res.status(201).json({ message: "Registration successful!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2. Login API (Haharangan ang 'inactive' na account)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) return res.status(404).json({ message: "User not found." });
        
        // Na-update para sa 'inactive' requirement mo
        if (user.status === 'inactive') return res.status(403).json({ message: "Your account is inactive. Please contact administration." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

        const rawToken = crypto.randomBytes(32).toString('hex');
        await user.update({ token: rawToken });

        res.status(200).json({
            message: "Login successful",
            token: rawToken,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. List Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ['id', 'username', 'firstName', 'surname', 'email', 'role', 'status'] });
        res.status(200).json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. Update Role (Para sa Admin)
exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // 'user', 'employee', o 'admin'
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "User not found." });

        await user.update({ role });
        res.status(200).json({ message: "User role updated successfully." });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 5. Update Status ('active' o 'inactive' - Admin Control)
exports.deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' o 'inactive'
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "User not found." });

        await user.update({ status });
        res.status(200).json({ message: `User status changed to ${status}.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
};