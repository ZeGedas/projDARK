import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';
import styles from '../styles/theme.module.css';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error('Failed to fetch user for navbar', err);
      }
    };

    if (localStorage.getItem('token')) {
      fetchProfile();
    }
  }, []);

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <nav className={styles.navbar}>
      {isLoggedIn ? (
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navItem}>Home</Link>
          <Link to="/feed" className={styles.navItem}>Feed</Link>
          {user && <Link to={`/users/${user.id}`} className={styles.navItem}>@{user.username}</Link>}
          <button onClick={handleLogout} className={styles.navButton}>Logout</button>

          {/* Search Bar in Navbar */}
          <form onSubmit={handleSearch} className={styles.searchContainer}>
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className={styles.searchInput} 
            />
            <button type="submit" className={styles.searchButton}>Search</button>
          </form>
        </div>
      ) : (
        <Link to="/login" className={styles.navItem}>Login</Link>
      )}
    </nav>
  );
};

export default Navbar;
