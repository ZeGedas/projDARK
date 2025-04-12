import React, { useEffect, useState } from 'react';
import API from '../api/api';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import styles from '../styles/theme.module.css';
import FormattedText from './FormattedText';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [refreshMap, setRefreshMap] = useState({});

  const fetchFeed = async () => {
    try {
      const res = await API.get('/feed', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error('Could not load feed', err);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleLike = async (postId) => {
    try {
      await API.post(`/posts/${postId}/like`);
      fetchFeed();
    } catch {
      alert('You must be logged in');
    }
  };

  const triggerCommentRefresh = (postId) => {
    setRefreshMap((prev) => ({ ...prev, [postId]: Date.now() }));
  };

  return (
    <div className={styles.postListContainer}>
      <h2 className={styles.sectionTitle}>Your Feed</h2>
      {posts.length === 0 && <p>No posts from followed users yet.</p>}
      {posts.map((post) => (
        <div key={post.id} className={styles.postCard}>
          <p className={styles.postAuthor}><strong>@{post.author}</strong></p>
          <p className={styles.postContent}><FormattedText text={post.content}></FormattedText></p>

          {post.media && (
            <div className={styles.postMedia}>
              {post.media.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={`${process.env.REACT_APP_MEDIA_URL}/uploads/${post.media}`} alt="Post media" />
              ) : post.media.match(/\.(mp4|webm|ogg)$/i) ? (
                <video controls src={`${process.env.REACT_APP_MEDIA_URL}/uploads/${post.media}`} />
              ) : null}
            </div>
          )}

          <p className={styles.postMeta}>
            {new Date(post.created_at).toLocaleString()}
          </p>

          <div className={styles.actions}>
            <button className={styles.likeButton} onClick={() => handleLike(post.id)}>
              ❤️ {post.likes_count || 0}
            </button>
          </div>

          <CommentForm postId={post.id} onCommentAdded={() => triggerCommentRefresh(post.id)} />
          <CommentList postId={post.id} refreshTrigger={refreshMap[post.id]} />
        </div>
      ))}
    </div>
  );
};

export default Feed;
