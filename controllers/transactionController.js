const Transaction = require('../models/transaction');
const { sendStatusEmail } = require('../utils/mailer');

// Regex function para i-validate kung mukhang totoong email format ang string
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// CREATE TRANSACTION (Kapag nag-checkout ang customer)
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

        // MAGPAPADALA NG EMAIL KAPAG NAGAWA ANG ORDER (PENDING STATUS)
        try {
            // Salain kung valid email, kung hindi ay gagamit ng dummy email fallback
            const finalEmail = isValidEmail(customerEmail) 
                ? customerEmail 
                : 'customer.test@driftwood.com';

            await sendStatusEmail(
                finalEmail, 
                customerName || 'Customer', 
                transaction.id, 
                'Pending'
            );
            console.log("[Mailtrap] New order notification sent successfully!");
        } catch (mailErr) {
            console.error("⚠️ Trans email failed to send, but order was created:", mailErr);
        }

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
        const transaction = await Transaction.findByPk(req.params.id);

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


// UPDATE STATUS (Kapag binago sa admin.html dropdown)
exports.updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                message: 'Transaction not found.'
            });
        }

        const oldStatus = transaction.status;
        const newStatus = req.body.status;

        await transaction.update({
            status: newStatus
        });

        // MAGPAPADALA NG EMAIL KAPAG INUPDATE NG ADMIN ANG ORDER STATUS
        try {
            console.log("=== SENDING EMAIL UPDATE ===");
            console.log(`Raw DB Email: ${transaction.customerEmail} | Order #${transaction.id} -> ${newStatus}`);
            
            // Titingnan kung valid email ang galing DB, kung hindi (gaya ng CP number) ay magpapadala sa fallback address
            const finalEmail = isValidEmail(transaction.customerEmail) 
                ? transaction.customerEmail 
                : 'customer.test@driftwood.com';

            console.log(`Filtered Email Destination: ${finalEmail}`);

            // Gagamitin na natin ang sendStatusEmail mula sa utils/mailer.js
            await sendStatusEmail(
                finalEmail, 
                transaction.customerName || 'Customer', 
                transaction.id, 
                newStatus
            );
            console.log("[Mailtrap] Status update email notification sent successfully!");
        } catch (mailErr) {
            console.error("⚠️ Status update email failed to send, but status was updated:", mailErr);
        }

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
        const transaction = await Transaction.findByPk(req.params.id);

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
        const transactions = await Transaction.findAll({
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