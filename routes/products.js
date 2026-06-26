const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productControllers');

// CONFIGURATION NG MULTER PARA SA FILE STORAGE
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Dito ise-save ang mga totoong litrato sa iyong project
    },
    filename: function (req, file, cb) {
        // Gagawa ng unique filename: ORAS_RANDOM-NUMBER.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File Filter para siguraduhing Larawan lang (Images) ang pwedeng i-upload
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit: 5MB bawat file
});

// ROUTES PARA SA PRODUCTS CRUD
// Tumatanggap ng hanggang limang (5) pictures gamit ang upload.array('images', 5)
router.get('/', productController.getAllProducts);
router.post('/', upload.array('images', 5), productController.createProduct);
router.put('/:id', upload.array('images', 5), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;