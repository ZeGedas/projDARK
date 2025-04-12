import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/api';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import styles from '../styles/theme.module.css';
import FormattedText from './FormattedText';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [refreshMap, setRefreshMap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      try {
        const res = await API.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  const handleLike = async (postId) => {
    try {
      await API.post(`/posts/${postId}/like`);
      const updated = await API.get(`/search?q=${query}`);
      setResults(updated.data);
    } catch (err) {
      alert('You must be logged in');
    }
  };

  const triggerCommentRefresh = (postId) => {
    setRefreshMap((prev) => ({ ...prev, [postId]: Date.now() }));
  };

  if (loading) {
    return <p>Loading search results...</p>;
  }

  return (
    <div className={styles.postListContainer}>
      <h2 className={styles.sectionTitle}>Search results for: <i>{query}</i></h2>
      {results.length === 0 && <p>No matching posts found.</p>}
      {results.map((post) => (
        <div key={post.id} className={styles.postCard}>
          <p className={styles.postAuthor}>
            <strong>
              <a href={`/users/${post.user_id}`} className={styles.link}>@{post.author}</a>
            </strong>
          </p>
          <p className={styles.postContent}><FormattedText text={post.content} /></p>

          {post.media && (
            <div className={styles.postMedia}>
              {post.media.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={`${process.env.REACT_APP_MEDIA_URL}/uploads/${post.media}`} alt="Post media" />
              ) : post.media.match(/\.(mp4|webm|ogg)$/i) ? (
                <video controls src={`${process.env.REACT_APP_MEDIA_URL}/uploads/${post.media}`} style={{ maxWidth: '100%' }} />
              ) : null}
            </div>
          )}

          <p className={styles.postMeta}>{new Date(post.created_at).toLocaleString()}</p>

          <div className={styles.actions}>
            <button onClick={() => handleLike(post.id)} className={styles.likeButton}>
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

export default SearchResults;
