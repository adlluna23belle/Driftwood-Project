const Product = require('../models/product');
const fs = require('fs');
const path = require('path');

// 1. Get All Products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Create Product (With Multiple Uploads)
exports.createProduct = async (req, res) => {
    try {
        const { name, price, description } = req.body;
        
        // Kukunin ang lahat ng uploaded file paths mula sa multer
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => '/uploads/' + file.filename);
        }

        const newProduct = await Product.create({
            name,
            price,
            description,
            // Ise-save natin ito bilang JSON string sa database
            image: JSON.stringify(imagePaths)
        });

        res.status(201).json({ message: "Product created successfully!", product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Update Product (With File Handling)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;
        const product = await Product.findByPk(id);

        if (!product) return res.status(404).json({ message: "Product not found." });

        let imagePaths = [];
        // Kung may mga bagong nilagay na larawan, gamitin ang bago
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => '/uploads/' + file.filename);
            
            // OPTIONAL OBLIGATION: Burahin ang lumang files sa storage para malinis ang server
            if (product.image) {
                try {
                    const oldImages = JSON.parse(product.image);
                    oldImages.forEach(img => {
                        const fullPath = path.join(__dirname, '../public', img);
                        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
                    });
                } catch (e) { /* Hayaan lang kung hindi JSON format ang luma */ }
            }
        } else {
            // Kung walang in-upload na bago, panatilihin ang lumang pictures
            imagePaths = JSON.parse(product.image || '[]');
        }

        await product.update({
            name,
            price,
            description,
            image: JSON.stringify(imagePaths)
        });

        res.status(200).json({ message: "Product updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) return res.status(404).json({ message: "Product not found." });

        // Burahin ang mga larawan sa filesystem bago alisin ang record sa DB
        if (product.image) {
            try {
                const images = JSON.parse(product.image);
                images.forEach(img => {
                    const fullPath = path.join(__dirname, '../public', img);
                    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
                });
            } catch (e) { /* Ignore */ }
        }

        await product.destroy();
        res.status(200).json({ message: "Product deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Get Single Product By ID
exports.getProductById = async (req, res) => {
    try {

        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found."
            });
        }

        res.status(200).json(product);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};