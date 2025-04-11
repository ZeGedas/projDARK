const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const knex = require('../models/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Avatar image storing configuration
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/avatars';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const uploadAvatar = multer({ storage: avatarStorage });

// Cover image storing configuration
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/covers';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const uploadCover = multer({ storage: coverStorage });

// Authenticated profile
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Authenticated user',
    user: req.user
  });
});

// Get user's posts
router.get('/users/:id/posts', async (req, res) => {
  const userId = req.params.id;

  try {
    const posts = await knex('posts')
      .where('posts.user_id', userId)
      .join('users', 'posts.user_id', '=', 'users.id')
      .leftJoin('likes', 'posts.id', '=', 'likes.post_id')
      .select(
        'posts.id',
        'posts.content',
        'posts.created_at',
        'users.username as author',
        knex.raw('COUNT(DISTINCT likes.id) as likes_count')
      )
      .groupBy(
        'posts.id',
        'posts.content',
        'posts.created_at',
        'users.username'
      )
      .orderBy('posts.created_at', 'desc');

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bio
router.put('/users/:id/bio', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { bio } = req.body;

  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({ message: 'Can not edit other user bio' });
  }

  try {
    await knex('users').where({ id }).update({ bio });
    res.json({ message: 'Bio updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating bio' });
  }
});

// Update avatar image
router.post('/users/:id/avatar', authenticateToken, uploadAvatar.single('avatar'), async (req, res) => {
  const userId = parseInt(req.params.id);
  const requesterId = req.user.id;

  if (userId !== requesterId) {
    return res.status(403).json({ message: 'You can only update your own avatar' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const avatarPath = req.file.filename;
    await knex('users').where({ id: userId}).update({ avatar: avatarPath});
    res.json({ message: 'Avatar updated', avatar: avatarPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update avatar' });
  }
});

// Update cover image
router.post('/users/:id/cover', authenticateToken, uploadCover.single('cover'), async (req, res) => {
  const userId = parseInt(req.params.id);
  if (userId !== req.user.id) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    await knex('users').where({ id: userId }).update({ cover: req.file.filename });
    res.json({ message: 'Cover updated', cover: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update cover' });
  }
});

// Follow
router.post('/users/:id/follow', authenticateToken, async (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.id);

  if (followerId === followingId) {
    return res.status(400).json({ message: "Can't follow yourself" });
  }

  try {
    // Check if already following
    const existingFollow = await knex('follows')
      .where({ follower_id: followerId, following_id: followingId })
      .first();

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following' });
    }

    // Set follow
    await knex('follows').insert({
      follower_id: followerId,
      following_id: followingId
    });

    // Get follower username
    const sender = await knex('users').where({ id: followerId }).first();

    // Create notification
    await knex('notifications').insert({
      recipient_id: followingId,
      sender_id: followerId,
      type: 'follow',
      message: `${sender.username} started following you`
    });

    // Return updated following status
    const followingStatus = await knex('follows')
      .where({ follower_id: followerId, following_id: followingId })
      .first();
    
    res.json({ message: 'Followed', isFollowing: !!followingStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error following user' });
  }
});

// Followers
router.get('/users/:id/followers', authenticateToken, async (req, res) => {
  const userId = req.params.id;
  try {
    const followers = await knex('follows')
      .join('users', 'follows.follower_id', '=', 'users.id')
      .where('follows.following_id', userId)
      .select('users.id', 'users.username', 'users.avatar');
    res.json(followers);
  } catch (err) {
    console.error('Error fetching followers:', err);
    res.status(500).json({ message: 'Error fetching followers' });
  }
});

// Following
router.get('/users/:id/following', authenticateToken, async (req, res) => {
  const userId = req.params.id;
  try {
    const following = await knex('follows')
      .join('users', 'follows.following_id', '=', 'users.id')
      .where('follows.follower_id', userId)
      .select('users.id', 'users.username', 'users.avatar');
    res.json(following);
  } catch (err) {
    console.error('Error fetching following:', err);
    res.status(500).json({ message: 'Error fetching following' });
  }
});

// Unfollow
router.delete('/users/:id/unfollow', authenticateToken, async (req, res) => {
  const followerId = req.user.id;
  const followingId = req.params.id;

  try {
    const deleted = await knex('follows')
      .where({ follower_id: followerId, following_id: followingId })
      .del();

    console.log('Deleted rows:', deleted);

    if (deleted === 0) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    const followingStatus = await knex('follows')
      .where({ follower_id: followerId, following_id: followingId })
      .first();

    if (!followingStatus) {
      return res.json({ message: 'Unfollowed', isFollowing: false });
    }

    res.json({ message: 'Error unfollowing user', isFollowing: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error unfollowing user' });
  }
});

// User profile
router.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await knex('users').where({ id }).first();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await knex('posts')
      .where('posts.user_id', id)
      .leftJoin('likes', 'posts.id', '=', 'likes.post_id')
      .select(
        'posts.id',
        'posts.content',
        'posts.created_at',
        'posts.user_id',
        'posts.media',
        knex.raw('COUNT(DISTINCT likes.id) as likes_count')
      )
      .groupBy('posts.id')
      .orderBy('posts.created_at', 'desc');

    const followers = await knex('follows')
      .where({ following_id: id })
      .count('id as count')
      .first();

    const following = await knex('follows')
      .where({ follower_id: id })
      .count('id as count')
      .first();

    res.json({
      id: user.id,
      username: user.username,
      bio: user.bio || null,
      avatar: user.avatar || null,
      cover: user.cover || null,
      posts,
      followers: followers.count,
      following: following.count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting profile' });
  }
});


// Notifications route
router.get('/notifications', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await knex('notifications')
      .where({ recipient_id: userId })
      .join('users', 'notifications.sender_id', '=', 'users.id')
      .select(
        'notifications.id',
        'notifications.post_id',
        'notifications.type',
        'notifications.message',
        'notifications.read',
        'notifications.created_at',
        'users.username as sender_username',
        'users.avatar as sender_avatar'
      )
      .orderBy('notifications.created_at', 'desc');

    res.json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});


router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
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
