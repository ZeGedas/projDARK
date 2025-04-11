const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const knex = require('../models/db');
const multer = require('multer');
const path = require('path');

// File save confuguration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

//Post upload
router.post('/posts', authenticateToken, upload.single('media'), async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id;
    const mediaPath = req.file ? req.file.filename : null;
  
    if (!content && !mediaPath) {
      return res.status(400).json({ message: 'Post must contain text or media' });
    }
  
    try {
      const [id] = await knex('posts').insert({
        content,
        user_id: userId,
        media: mediaPath
      });
  
      res.status(201).json({ message: 'Post created', postId: id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
//Get post
router.get('/posts', async (req, res) => {
    try {
      const posts = await knex('posts')
        .join('users', 'posts.user_id', '=', 'users.id')
        .leftJoin('likes', 'posts.id', '=', 'likes.post_id')
        .select(
          'posts.id',
          'posts.content',
          'posts.created_at',
          'posts.user_id',
          'posts.media',
          'users.id as author_id',
          'users.username as author',
          knex.raw('COUNT(likes.id) as likes_count')
        )
        .groupBy(
          'posts.id',
          'posts.content',
          'posts.created_at',
          'posts.user_id',
          'posts.media',
          'users.id',
          'users.username'
        )
        .orderBy('posts.created_at', 'desc');
  
      res.json(posts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
// Post delete
router.delete('/posts/:id', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        // Does the post exist and does it belong to the user?
        const post = await knex('posts').where({ id: postId }).first();

        if (!post) {
            return res.status(404).json({ message: 'Post not found '});
        }

        if (post.user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await knex('posts').where({ id: postId }).del();

        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Edit post
router.put('/posts/:id', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const { content, media } = req.body;
    const userId = req.user.id;
  
    try {
      const post = await knex('posts').where({ id: postId }).first();
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      if (post.user_id !== userId) {
        return res.status(403).json({ message: 'You can only edit your own posts' });
      }
  
      // Atnaujiname įrašą
      const updatedPost = {
        content: content || post.content,
        media: media || post.media,
      };
  
      await knex('posts')
        .where({ id: postId })
        .update(updatedPost);
  
      res.json({ message: 'Post updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating post' });
    }
  });
  

router.post('/posts/:id/like', authenticateToken, async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;
  
    try {
      const existing = await knex('likes')
        .where({ user_id: userId, post_id: postId })
        .first();
  
      if (existing) {
        // Unlike
        await knex('likes').where({ user_id: userId, post_id: postId }).del();
        return res.json({ message: 'Like removed' });
      }
  
      // Like
      await knex('likes').insert({ user_id: userId, post_id: postId });
  
      // Gauk post owner
      const post = await knex('posts').where({ id: postId }).first();
  
      // Create notification if like post isn't owned
      if (post && post.user_id !== userId) {
        const sender = await knex('users').where({ id: userId }).first();
  
        await knex('notifications').insert({
          recipient_id: post.user_id,
          sender_id: userId,
          type: 'like',
          message: `${sender.username} liked your post.`,
          post_id: postId,
        });
      }
  
      res.json({ message: 'Liked' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

router.get('/posts/:id/likes', async (req, res) => {
    const postId = req.params.id;

    try {
        const likes = await knex('likes')
        .where('post_id', postId)
        .join('users', 'likes.user_id', '=', 'users.id')
        .select('users.id', 'users.username');

        res.json({
            postId,
            likes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/posts/:id/comments', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;
  
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }
  
    try {
      const [commentId] = await knex('comments').insert({
        content,
        user_id: userId,
        post_id: postId
      });
  
      // Get post owner
      const post = await knex('posts').where({ id: postId }).first();
  
      // Don't notify about owned posts
      if (post && post.user_id !== userId) {
        const sender = await knex('users').where({ id: userId }).first();
  
        await knex('notifications').insert({
          recipient_id: post.user_id,
          sender_id: userId,
          type: 'comment',
          message: `${sender.username} commented on your post.`,
          post_id: postId,
        });
      }
  
      res.status(201).json({ message: 'Comment added', commentId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

router.get('/posts/:id/comments', async (req, res) => {
    const postId = req.params.id;

    try {
        const comments = await knex('comments')
        .where('post_id', postId)
        .join('users', 'comments.user_id', '=', 'users.id')
        .select(
            'comments.id',
            'comments.content',
            'comments.created_at',
            'comments.user_id',
            'users.username as author'
        )
        .orderBy('comments.created_at', 'asc');

        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/feed', authenticateToken, async (req, res) => {
    try {
        const posts = await knex('posts')
            .join('users', 'posts.user_id', '=', 'users.id')
            .leftJoin('likes', 'posts.id', '=', 'likes.post_id')
            .join('follows', 'posts.user_id', '=', 'follows.following_id')
            .where('follows.follower_id', req.user.id)
            .select(
                'posts.id',
                'posts.content',
                'posts.created_at',
                'posts.media',
                'posts.user_id',
                'users.username as author',
                knex.raw('COUNT(likes.id) as likes_count')
            )
            .groupBy(
                'posts.id',
                'posts.content',
                'posts.created_at',
                'posts.media',
                'posts.user_id',
                'users.username'
            )
            .orderBy('posts.created_at', 'desc');
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error loading feed' });
    }
});

router.get('/search', async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim()=== '') {
        return res.status(400).json({ message: 'Query is required' });
    }

    try {
        const results = await knex('posts')
            .join('users', 'posts.user_id', '=', 'users.id')
            .leftJoin('likes', 'posts.id', '=', 'likes.post_id')
            .select(
                'posts.id',
                'posts.content',
                'posts.created_at',
                'posts.media',
                'users.username as author',
                knex.raw('COUNT(likes.id) as likes_count')
            )
            .where('posts.content', 'like', `%${q}%`)
            .orWhere('users.username', 'like', `%${q}%`)
            .groupBy('posts.id', 'posts.content', 'posts.created_at', 'posts.media', 'users.username')
            .orderBy('posts.created_at', 'desc');

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Search failed' });
    }
});

// One post page
router.get('/posts/:id', async (req, res) => {
    const postId = req.params.id;
  
    try {
      const post = await knex('posts')
        .where('posts.id', postId)
        .join('users', 'posts.user_id', '=', 'users.id')
        .leftJoin('likes', 'posts.id', '=', 'likes.post_id')
        .select(
          'posts.id',
          'posts.content',
          'posts.created_at',
          'posts.media',
          'posts.user_id',
          'users.username as author',
          knex.raw('COUNT(likes.id) as likes_count')
        )
        .groupBy(
          'posts.id',
          'posts.content',
          'posts.created_at',
          'posts.media',
          'posts.user_id',
          'users.username'
        )
        .first();
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      res.json(post);
    } catch (error) {
      console.error('Error fetching single post:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = router;