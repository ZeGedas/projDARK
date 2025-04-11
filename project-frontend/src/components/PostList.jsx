import React, { useEffect, useState } from 'react';
import API from '../api/api';
import PostCard from './PostCard';
import CreatePostForm from './CreatePostForm';
import styles from '../styles/theme.module.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await API.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Could not retrieve posts', err);
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    const res = await API.get('/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data.user);
  };

  useEffect(() => {
    fetchPosts();
    fetchUser();
  }, []);

  const handlePostUpdated = () => {
    fetchPosts(); // Reload the posts after edit or delete
  };

  return (
    <div className={styles.postListContainer}>
      <CreatePostForm onPostCreated={fetchPosts} />
      <h2 className={styles.sectionTitle}>All Posts</h2>
      {posts.length === 0 && <p>No posts yet</p>}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onPostUpdated={handlePostUpdated} />
      ))}
    </div>
  );
};

export default PostList;
