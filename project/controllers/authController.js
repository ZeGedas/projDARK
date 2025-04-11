const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../models/db');

const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Checks if user already exists
        const existing = await knex('users').where({ email }).first();
        if(existing) {
            return res.status(400).json({ message: 'This email is already in use' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [id] = await knex('users').insert({
            username,
            email,
            password: hashedPassword
        });

        const token = jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            message: 'Registration successful',
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await knex('users').where({ email }).first();

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password'});
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message});
    }
};

module.exports = { 
    register,
    login
 };