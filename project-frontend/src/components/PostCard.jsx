import React, { useState } from 'react';
import API from '../api/api';
import FormattedText from './FormattedText';
import styles from '../styles/theme.module.css';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

const PostCard = ({ post, onPostUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(post.content);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewContent(post.content);
  };

  const handleSave = async () => {
    try {
      await API.put(`/posts/${post.id}`, { content: newContent }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsEditing(false);
      onPostUpdated();
    } catch (err) {
      console.error('Failed to save post', err);
    }
  };

  const handleLike = async () => {
    try {
      await API.post(`/posts/${post.id}/like`);
      onPostUpdated();
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      onPostUpdated();
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  return (
    <div className={styles.postCard}>
      <p className={styles.postAuthor}>
        <strong>
          <a href={`/users/${post.user_id}`} className={styles.link}>
            @{post.author}
          </a>
        </strong>
      </p>

      {isEditing ? (
        <div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className={styles.textarea}
          />
          <div className={styles.actions}>
            <button onClick={handleSave} className={styles.button}>Save</button>
            <button onClick={handleCancel} className={styles.button}>Cancel</button>
          </div>
        </div>
      ) : (
        <p className={styles.postContent}>
          <FormattedText text={post.content} />
        </p>
      )}

      {post.media && (
        <div className={styles.postMedia}>
          {post.media.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img src={`${process.env.REACT_APP_MEDIA_URL}/uploads/${post.media}`} alt="Post media" />
          ) : post.media.match(/\.(mp4|webm|ogg)$/i) ? (
            <video controls width="100%">
              <source src={`${process.env.REACT_APP_MEDIA_URL}/uploads/${post.media}`} />
            </video>
          ) : null}
        </div>
      )}

      <p className={styles.postMeta}>{new Date(post.created_at).toLocaleString()}</p>

      <div className={styles.actions}>
        <button onClick={handleLike} className={styles.likeButton}>
          ❤️ {post.likes_count || 0}
        </button>

        {/* Delete button visible only if the post belongs to the logged-in user */}
        {post.user_id === localStorage.getItem('user_id') && (
          <button onClick={handleDelete} className={styles.deleteButton}>
            Delete
          </button>
        )}
      </div>

      <CommentForm postId={post.id} onCommentAdded={onPostUpdated} />
      <CommentList postId={post.id} />
    </div>
  );
};

export default PostCard;
