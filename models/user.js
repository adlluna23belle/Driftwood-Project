const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    surname: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { 
        type: DataTypes.STRING, 
        defaultValue: 'user' // Pwede itong 'user' (customer), 'employee', o 'admin'
    }, 
    status: { 
        type: DataTypes.STRING, 
        defaultValue: 'active' // Pwede itong 'active' o 'inactive'
    }, 
    token: { type: DataTypes.TEXT, allowNull: true } 
});

module.exports = User;