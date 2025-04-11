import React, { useState } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/theme.module.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/login', { email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      navigate('/');
    } catch (error) {
      console.error(error);
      setError('Incorrect login data');
    }
  };

  return (
    <div className={styles.authForm}>
      <h2 className={styles.formTitle}>Login</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          placeholder="Email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className={styles.button} type="submit">Login</button>
        <p className={styles.secondaryText}>
          Don't have an account?{' '}
          <a href="/register" className={styles.link}>Register here</a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
