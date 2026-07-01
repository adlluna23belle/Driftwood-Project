const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
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

// Helper function para mag-generate ng PDF sa memory (Buffer) nang walang naiiwang kalat na file sa PC mo
const generateReceiptPDF = (customerName, transactionId, newStatus, items, totalAmount) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.on('error', (err) => reject(err));

        // --- PDF DESIGN & CONTENT ---
        
        // Brand Header
        doc.fillColor('#8b5a2b').fontSize(24).text('DRIFTWOOD FURNITURE', { align: 'center' });
        doc.fontSize(10).fillColor('#6c757d').text('Premium Handcrafted Wooden Furniture', { align: 'center' });
        doc.moveDown(2);

        // Invoice Metadata
        doc.fillColor('#1c1917').fontSize(14).text(`OFFICIAL RECEIPT`, { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Transaction ID: #${transactionId}`);
        doc.text(`Customer Name: ${customerName}`);
        doc.text(`Order Status: ${newStatus}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown(1.5);

        // Table Header
        doc.fontSize(12).fillColor('#8b5a2b').text('Order Summary', { bold: true });
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#eee').stroke();
        doc.moveDown(0.5);

        // Pagsala at Pag-parse sa items (mula JSON string papuntang Array)
        let parsedItems = [];
        try {
            parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        } catch (e) {
            parsedItems = [];
        }

        // Pag-lista ng mga biniling furniture
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            parsedItems.forEach((item) => {
                const name = item.productName || 'Furniture Item';
                const qty = item.quantity || 1;
                const price = item.price ? `PHP ${parseFloat(item.price).toLocaleString()}` : '';
                
                doc.fontSize(10).fillColor('#1c1917').text(`${name} (x${qty})`, { continued: true });
                doc.text(price, { align: 'right' });
            });
        } else {
            doc.fontSize(10).fillColor('#6c757d').text('Standard Driftwood Furniture Order');
        }

        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#eee').stroke();
        doc.moveDown(1);

        // Total Amount Block
        const finalTotal = totalAmount ? parseFloat(totalAmount).toLocaleString() : '0';
        doc.fontSize(14).fillColor('#8b5a2b').text(`Total Paid: PHP ${finalTotal}`, { align: 'right', bold: true });
        
        // Footer Note
        doc.moveDown(4);
        doc.fontSize(10).fillColor('#6c757d').text('Thank you for choosing Driftwood Furniture!', { align: 'center', italic: true });

        doc.end();
    });
};

// Function para sa pagpapadala ng custom email status update (May kasama nang PDF attachment parameters)
const sendStatusEmail = async (toEmail, customerName, transactionId, newStatus, items = [], totalAmount = 0) => {
    try {
        console.log(`[PDF Generator] Generating dynamic receipt for Trans #${transactionId}...`);
        
        // Tawagin ang PDF generator function at hintayin ang buffer data nito
        const pdfBuffer = await generateReceiptPDF(customerName, transactionId, newStatus, items, totalAmount);

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
                    <p>Naka-attach sa email na ito ang iyong **Official PDF Receipt** na naglalaman ng kabuuang breakdown ng iyong kinuha.</p>
                    <p>Maraming salamat sa pagtangkilik sa Driftwood Furniture!</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 0.8rem; color: #6c757d; text-align: center;">Ito ay isang automated text. Huwag mag-reply sa email na ito.</p>
                </div>
            `,
            attachments: [
                {
                    filename: `Receipt_Trans_${transactionId}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
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