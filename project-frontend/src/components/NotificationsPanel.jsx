import React, { useEffect, useState } from 'react';
import API from '../api/api';
import styles from '../styles/theme.module.css';
import { useNavigate } from 'react-router-dom';



const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };
  

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  const navigate = useNavigate();

  return (
    <div className={`${styles.notificationPanel} ${isOpen ? styles.open : ''}`}>
      <div className={styles.notificationHeader}>
        <h3>Notifications</h3>
        <button onClick={onClose}>✕</button>
      </div>
      <div className={styles.notificationList}>
        {notifications.length === 0 && <p className={styles.empty}>No notifications</p>}
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`${styles.notificationItem} ${notif.read ? styles.read : ''}`}
            onClick={() => {
                markAsRead(notif.id);
                if (notif.type === 'comment' || notif.type === 'like') {
                  navigate(`/posts/${notif.post_id}`);
                } else if (notif.type === 'follow') {
                  navigate(`/users/${notif.sender_id}`);
                }
              }}
          >
            <p>{notif.message}</p>
            <span className={styles.timestamp}>{new Date(notif.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
