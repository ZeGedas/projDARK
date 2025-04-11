import React, { useState } from 'react';
import API from '../api/api';
import styles from '../styles/theme.module.css';

const CommentForm = ({ postId, onCommentAdded }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/posts/${postId}/comments`, { content });
      setContent('');
      onCommentAdded();
    } catch (error) {
      console.error('Could not add comment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.commentForm}>
      <textarea
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        className={styles.commentInput}
      />
      <button type="submit" className={styles.Button}>
        Comment
      </button>
    </form>
  );
};

export default CommentForm;
