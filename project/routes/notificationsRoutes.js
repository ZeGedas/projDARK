const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const knex = require('../models/db');

// Create new notification
router.post('/', authenticateToken, async (req, res) => {
  const { recipient_id, type, message } = req.body;
  const sender_id = req.user.id;

  try {
    await knex('notifications').insert({
      recipient_id,
      sender_id,
      type,
      message,
    });
    res.status(201).json({ message: 'Notification sent' });
  } catch (err) {
    console.error('Notification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logged user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await knex('notifications')
      .where({ recipient_id: req.user.id })
      .orderBy('created_at', 'desc');
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await knex('notifications')
      .where({ id, recipient_id: req.user.id })
      .update({ read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

module.exports = router;
