import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/api';
import styles from '../styles/theme.module.css';
import FormattedText from './FormattedText';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await API.get(`/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error('Error fetching post', err);
      }
    };
    fetchPost();
  }, [id]);

  const triggerRefresh = () => setRefresh(Date.now());

  if (!post) return <p>Loading post...</p>;

  return (
    <div className={styles.postCard}>
      <h3>Post by @{post.author}</h3>
      <p className={styles.postContent}><FormattedText text={post.content} /></p>
      <p className={styles.postMeta}>{new Date(post.created_at).toLocaleString()}</p>

      {post.media && (
        <div className={styles.postMedia}>
          {post.media.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img src={`${process.env.REACT_APP_MEDIA_URL}/uploads/${post.media}`} alt="Post media" />
          ) : post.media.match(/\.(mp4|webm|ogg)$/i) ? (
            <video controls>
              <source src={`${process.env.REACT_APP_MEDIA_URL}/uploads/${post.media}`} />
            </video>
          ) : null}
        </div>
      )}

      <CommentForm postId={post.id} onCommentAdded={triggerRefresh} />
      <CommentList postId={post.id} refreshTrigger={refresh} />
    </div>
  );
};

export default PostPage;
