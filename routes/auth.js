const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { checkAdmin } = require('../middleware/authMiddleware'); // Middleware Import

// Public Endpoints (Kahit sino pwedeng ma-access para makapasok sa system)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Endpoints - Quiz 6 (Dadaan muna sa checkAdmin bago ibigay ang data)
router.get('/users', checkAdmin, authController.getAllUsers);
router.put('/users/role/:id', checkAdmin, authController.updateRole);
router.put('/users/status/:id', checkAdmin, authController.deactivateUser);

module.exports = router;