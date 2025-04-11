const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/uploads/avatars', express.static('uploads/avatars'));
app.use('/uploads/covers', express.static('uploads/covers'));
app.use('/notifications', notificationsRoutes);

// Test endpoint
app.get('/', (req, res) => {
    res.send('Projekto API veikia');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`);
});