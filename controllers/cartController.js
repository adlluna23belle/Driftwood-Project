const Cart = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/user');


// ADD TO CART
exports.addToCart = async (req, res) => {

    try {

        const { userId, productId } = req.body;

        let existingItem = await Cart.findOne({
            where: {
                userId,
                productId
            }
        });

        if (existingItem) {

            await existingItem.update({
                quantity: existingItem.quantity + 1
            });

            return res.status(200).json({
                message: 'Cart quantity updated.'
            });

        }

        await Cart.create({
            userId,
            productId,
            quantity: 1
        });

        res.status(201).json({
            message: 'Product added to cart.'
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};


// VIEW CART
exports.getCart = async (req, res) => {

    try {

        const { userId } = req.params;

        const cartItems = await Cart.findAll({

            where: {
                userId
            },

            include: [
                {
                    model: Product
                }
            ]

        });

        res.status(200).json(cartItems);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};


// REMOVE ITEM
exports.removeItem = async (req, res) => {

    try {

        const { id } = req.params;

        const item = await Cart.findByPk(id);

        if (!item) {

            return res.status(404).json({
                message: 'Cart item not found.'
            });

        }

        await item.destroy();

        res.status(200).json({
            message: 'Item removed from cart.'
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

exports.updateQuantity = async (req, res) => {

    try {

        const { id } = req.params;
        const { quantity } = req.body;

        const item = await Cart.findByPk(id);

        if (!item) {

            return res.status(404).json({
                message: 'Cart item not found.'
            });

        }

        await item.update({
            quantity: quantity
        });

        res.status(200).json({
            message: 'Quantity updated.'
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};