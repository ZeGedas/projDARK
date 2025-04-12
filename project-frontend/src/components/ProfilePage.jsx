import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import API from '../api/api';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import AvatarUpload from './AvatarUpload';
import CoverUpload from './CoverUpload';
import styles from '../styles/theme.module.css';
import FormattedText from './FormattedText';

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [refreshMap, setRefreshMap] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const fetchUser = async () => {
    try {
      const res = await API.get(`/users/${id}`);
      setProfile(res.data);
    } catch (err) {
      console.error('Could not get profile', err);
    }
  };

  const fetchLoggedInUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUserId(res.data.user.id);
    } catch (err) {
      console.error('Not logged in', err);
    }
  };

  const saveBio = async () => {
    try {
      await API.put(`/users/${profile.id}/bio`, { bio: newBio }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile({ ...profile, bio: newBio });
      setEditing(false);
    } catch (err) {
      alert('Failed to update bio');
    }
  };

  const checkFollowingStatus = async () => {
    if (!currentUserId || !id) return;
    
    try {
      const res = await API.get(`/users/${id}/followers`);
      const isFollowing = res.data.some(follower => follower.id === currentUserId);
      setIsFollowing(isFollowing);
    } catch (err) {
      console.error('Error checking follow status', err);
    }
  };

  const handleFollow = async () => {
    try {
      await API.post(`/users/${id}/follow`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsFollowing(true);
      fetchUser();
      fetchFollowers();
    } catch (err) {
      console.error('Follow failed', err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await API.delete(`/users/${id}/unfollow`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsFollowing(false);
      fetchUser();
      fetchFollowers();
    } catch (err) {
      console.error('Unfollow failed', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await API.post(`/posts/${postId}/like`);
      fetchUser();
    } catch (err) {
      alert('You must be logged in to like');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchUser();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const triggerCommentRefresh = (postId) => {
    setRefreshMap((prev) => ({
      ...prev,
      [postId]: Date.now()
    }));
  };

  // Function for post editing
  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPostContent(post.content);
  };

  // Function to save edited post
  const handleSavePost = async (postId) => {
    try {
      await API.put(`/posts/${postId}`, { content: newPostContent }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEditingPost(null);
      fetchUser();
    } catch (err) {
      console.error('Failed to save post', err);
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingPost(null);
    setNewPostContent('');
  };

  const fetchFollowers = async () => {
    try {
      const res = await API.get(`/users/${id}/followers`);
      setFollowers(res.data);
    } catch (err) {
      console.error('Error fetching followers', err);
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await API.get(`/users/${id}/following`);
      setFollowing(res.data);
    } catch (err) {
      console.error('Error fetching following', err);
    }
  };

  const handleFollowersClick = () => {
    fetchFollowers();
    setIsFollowersModalOpen(true);
  };

  const handleFollowingClick = () => {
    fetchFollowing();
    setIsFollowingModalOpen(true);
  };

  const closeModal = () => {
    setIsFollowersModalOpen(false);
    setIsFollowingModalOpen(false);
  };

  useEffect(() => {
    fetchUser();
    fetchLoggedInUser();
    fetchFollowers();
    fetchFollowing();
    setIsFollowersModalOpen(false);
    setIsFollowingModalOpen(false);
  }, [id]);

  
  useEffect(() => {
    if (currentUserId && id) {
      checkFollowingStatus();
    }
  }, [currentUserId, id]);

  if (!profile) return <p>Loading...</p>;

  const isOwnProfile = currentUserId === profile.id;

  return (
    <div className={styles.postListContainer}>
      {/* Profile Header Card with Cover Background */}
      <div
        className={styles.profileHeaderCard}
        style={{
          backgroundImage: profile.cover
            ? `url(${process.env.REACT_APP_MEDIA_URL}/uploads/covers/${profile.cover})`
            : 'none'
        }}
      >
        <div className={styles.profileOverlay}>
          <div className={styles.profileInfo}>
            <img
              src={
                profile.avatar
                  ? `${process.env.REACT_APP_MEDIA_URL}/uploads/avatars/${profile.avatar}`
                  : '/default-avatar.png'
              }
              alt=""
              className={styles.avatar}
            />
            <div>
              <h2 className={styles.header}>@{profile.username}</h2>
              {isOwnProfile && (
                <>
                  <AvatarUpload
                    user={profile}
                    onAvatarUpdated={(avatar) =>
                      setProfile({ ...profile, avatar })
                    }
                  />
                  <CoverUpload
                    user={profile}
                    onCoverUpdated={(cover) =>
                      setProfile({ ...profile, cover })
                    }
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
  
      {/* Bio Section */}
      <div className={styles.postCard}>
        <div className={styles.postContent}>
          <strong></strong>{' '}
          {editing ? (
            <>
              <input
                type="text"
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                className={styles.input}
                placeholder="Enter your bio"
              />
              <div className={styles.actions}>
                <button onClick={saveBio} className={styles.button}>Save</button>
                <button onClick={() => setEditing(false)} className={`${styles.button} ${styles.cancel}`}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <span>{profile.bio || 'No bio yet'}</span>
              {isOwnProfile && (
                <button onClick={() => { setEditing(true); setNewBio(profile.bio || ''); }} className={styles.buttonEdit}>
                  Edit
                </button>
              )}
            </>
          )}
        </div>
        <p className={styles.postMeta}><strong>Followers:</strong> <span onClick={handleFollowersClick} className={styles.link}>{profile.followers || 0}</span></p>
        <p className={styles.postMeta}><strong>Following:</strong> <span onClick={handleFollowingClick} className={styles.link}>{profile.following || 0}</span></p>
        {!isOwnProfile && (
          <button onClick={isFollowing ? handleUnfollow : handleFollow} className={styles.followButton}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      {/* Followers Modal */}
      {isFollowersModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Followers</h2>
            {followers.length === 0 ? (
              <p>No followers yet.</p>
            ) : (
              <ul>
                {followers.map((follower) => (
                  <li key={follower.id}>
                    <Link to={`/users/${follower.id}`} className={styles.link}>
                      @{follower.username}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={closeModal} className={styles.closeButton}>Close</button>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {isFollowingModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Following</h2>
            {following.length === 0 ? (
              <p>Not following anyone yet.</p>
            ) : (
              <ul>
                {following.map((following) => (
                  <li key={following.id}>
                    <Link to={`/users/${following.id}`} className={styles.link}>
                      @{following.username}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={closeModal} className={styles.closeButton}>Close</button>
          </div>
        </div>
      )}

      {/* Posts Section */}
      <h3 className={styles.sectionTitle}>Posts</h3>
      {profile.posts.length === 0 && <p>User hasn't posted yet.</p>}
      {profile.posts.map((post) => (
        <div key={post.id} className={styles.postCard}>
          <p className={styles.postContent}><FormattedText text={post.content} /></p>
          {post.media && (
            <div className={styles.postMedia}>
              {post.media.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={`${process.env.REACT_APP_MEDIA_URL}/uploads/${post.media}`} alt="Post media" />
              ) : post.media.match(/\.(mp4|webm|ogg)$/i) ? (
                <video controls src={`${process.env.REACT_APP_MEDIA_URL}/uploads/${post.media}`} />
              ) : null}
            </div>
          )}
          <p className={styles.postMeta}>{new Date(post.created_at).toLocaleString()}</p>
          <div className={styles.actions}>
            <button onClick={() => handleLike(post.id)} className={styles.likeButton}>
              ❤️ {post.likes_count || 0}
            </button>
            {currentUserId === post.user_id && (
              <>
                {editingPost && editingPost.id === post.id ? (
                  <>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className={styles.textarea}
                    />
                    <button onClick={() => handleSavePost(post.id)} className={styles.saveButton}>
                      Save
                    </button>
                    <button onClick={handleCancelEdit} className={styles.cancelButton}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleEditPost(post)} className={styles.editButton}>
                    Edit
                  </button>
                )}
              </>
            )}
            <button onClick={() => handleDelete(post.id)} className={styles.deleteButton}>
              Delete
            </button>
          </div>
          <CommentForm postId={post.id} onCommentAdded={() => triggerCommentRefresh(post.id)} />
          <CommentList postId={post.id} refreshTrigger={refreshMap[post.id]} />
        </div>
      ))}
    </div>
  );
};

export default ProfilePage;
