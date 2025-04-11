import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';  // Importuojame Link komponentą
import API from '../api/api';
import styles from '../styles/theme.module.css';
import FormattedText from './FormattedText';

const CommentList = ({ postId, refreshTrigger }) => {
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await API.get(`/posts/${postId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Could not get comments:', err);
    }
  }, [postId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
    } catch (err) {
      console.error('Could not get user profile:', err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await API.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchComments();
    } catch (err) {
      console.error('Could not delete comment:', err);
    }
  };

  useEffect(() => {
    fetchComments();
    fetchProfile();
  }, [refreshTrigger, fetchComments]);

  return (
    <div className={styles.commentSection}>
      <h4 className={styles.commentHeading}>Comments</h4>
      {comments.length === 0 && <p className={styles.noComments}>No comments yet</p>}
      {comments.map((comment) => (
        <div key={comment.id} className={styles.commentItem}>
          <span className={styles.commentAuthor}>
            <Link to={`/users/${comment.user_id}`} className={styles.link}>
              @{comment.author}
            </Link>
          </span>
          <span className={styles.commentContent}>
            <FormattedText text={comment.content}></FormattedText>
          </span>
          {user?.id === comment.user_id && (
            <button
              onClick={() => deleteComment(comment.id)}
              className={styles.deleteCommentBtn}
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;
