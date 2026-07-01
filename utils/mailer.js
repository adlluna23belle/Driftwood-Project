const nodemailer = require('nodemailer');
require('dotenv').config();

// Gumawa ng transporter gamit ang credentials mula sa .env file mo
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// Function para sa pagpapadala ng custom email status update
const sendStatusEmail = async (toEmail, customerName, transactionId, newStatus) => {
    try {
        const mailOptions = {
            from: '"Driftwood Furniture" <no-reply@driftwood.com>',
            to: toEmail,
            subject: `Order Status Updated - Trans #${transactionId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #8b5a2b; text-align: center;">DRIFTWOOD FURNITURE</h2>
                    <p>Hi <strong>${customerName}</strong>,</p>
                    <p>Gusto naming ipaalam sa iyo na ang status ng iyong order na may <strong>Transaction ID: #${transactionId}</strong> ay nabago na.</p>
                    <div style="background-color: #f3ede6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 1.2rem; font-weight: bold; color: #1c1917;">New Status: ${newStatus}</span>
                    </div>
                    <p>Maraming salamat sa pagtangkilik sa Driftwood Furniture!</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 0.8rem; color: #6c757d; text-align: center;">Ito ay isang automated text. Huwag mag-reply sa email na ito.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Sent Success]: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[Mailer Error]: Failure sending email', error);
        throw error;
    }
};

module.exports = { sendStatusEmail };