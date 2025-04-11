import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/theme.module.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className={styles.form} style={{ maxWidth: '700px', margin: '0 auto 20px' }}>
      <input
        type="text"
        value={query}
        placeholder="Search posts..."
        onChange={(e) => setQuery(e.target.value)}
        className={styles.input}
      />
      <button type="submit" className={styles.button}>Search</button>
    </form>
  );
};

export default SearchBar;
