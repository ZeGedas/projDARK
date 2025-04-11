const express = require('express');
const router = express.Router();
const knex = require('../models/db');
const authenticateToken = require('../middleware/authMiddleware');

// DELETE /api/comments/:id
router.delete('/comments/:id', authenticateToken, async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user.id;
  
    try {
      const comment = await knex('comments').where({ id: commentId }).first();
  
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      if (comment.user_id !== userId) {
        return res.status(403).json({ message: 'You can not delete this comment' });
      }
  
      await knex('comments').where({ id: commentId }).delete();
  
      res.json({ message: 'Comment deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  module.exports = router;