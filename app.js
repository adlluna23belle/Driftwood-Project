const express = require('express');
const path = require('path');
const sequelize = require('./config/database');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth'); // Idagdag ito
require('./models/user'); // Idagdag ito para ma-sync ang users table

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes); // Idagdag ito

const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => console.log(`Server tumatakbo sa http://localhost:${PORT}`));
}).catch(err => console.log('Database Error:', err));