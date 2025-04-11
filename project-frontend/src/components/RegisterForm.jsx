import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import styles from '../styles/theme.module.css';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/register', { email, username, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className={styles.authForm}>
      <h2>Register</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleRegister} className={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Register</button>
      </form>
      <p className={styles.secondaryText}>
        Already have an account? <a href="/login" className={styles.link}>Login here</a>
      </p>
    </div>
  );
};

export default RegisterForm;
