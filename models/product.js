const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    description: { type: DataTypes.TEXT },
    image: { type: DataTypes.STRING }
});

const Cart = require('./cart');

Product.hasMany(Cart, {
    foreignKey: 'productId'
});

Cart.belongsTo(Product, {
    foreignKey: 'productId'
});

module.exports = Product;