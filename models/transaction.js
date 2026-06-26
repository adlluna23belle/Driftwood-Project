const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {

    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    customerName: {
        type: DataTypes.STRING,
        allowNull: false
    },

    customerEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },

    totalAmount: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },

    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    },

    items: {
        type: DataTypes.TEXT
    }

});

module.exports = Transaction;