const Transaction = require('../models/transaction');


// CREATE TRANSACTION
exports.createTransaction = async (req, res) => {

    try {

        const {
            customerId,
            customerName,
            customerEmail,
            totalAmount,
            items
        } = req.body;

        const transaction = await Transaction.create({

            customerId,
            customerName,
            customerEmail,
            totalAmount,
            items: JSON.stringify(items)

        });

        res.status(201).json({

            message: 'Transaction created successfully.',
            transaction

        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};


// GET ALL TRANSACTIONS
exports.getAllTransactions = async (req, res) => {

    try {

        const transactions = await Transaction.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(transactions);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};


// GET ONE TRANSACTION
exports.getTransaction = async (req, res) => {

    try {

        const transaction =
            await Transaction.findByPk(req.params.id);

        if (!transaction) {

            return res.status(404).json({
                message: 'Transaction not found.'
            });

        }

        res.status(200).json(transaction);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};


// UPDATE STATUS
exports.updateTransaction = async (req, res) => {

    try {

        const transaction =
            await Transaction.findByPk(req.params.id);

        if (!transaction) {

            return res.status(404).json({
                message: 'Transaction not found.'
            });

        }

        await transaction.update({

            status: req.body.status

        });

        res.status(200).json({
            message: 'Transaction updated.'
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};


// DELETE
exports.deleteTransaction = async (req, res) => {

    try {

        const transaction =
            await Transaction.findByPk(req.params.id);

        if (!transaction) {

            return res.status(404).json({
                message: 'Transaction not found.'
            });

        }

        await transaction.destroy();

        res.status(200).json({
            message: 'Transaction deleted.'
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

// GET TRANSACTIONS BY CUSTOMER

exports.getTransactionsByCustomer = async (req, res) => {

    try {

        const customerId = req.params.customerId;

        const transactions =
            await Transaction.findAll({

                where: {
                    customerId: customerId
                },

                order: [
                    ['createdAt', 'DESC']
                ]

            });

        res.status(200).json(transactions);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};