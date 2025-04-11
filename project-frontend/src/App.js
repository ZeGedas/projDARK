import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import PostList from './components/PostList';
import Navbar from './components/Navbar';
import ProfilePage from './components/ProfilePage';
import RegisterForm from './components/RegisterForm';
import Feed from './components/Feed';
import SearchResults from './components/SearchResults';
import NotificationPanel from './components/NotificationsPanel';
import PostPage from './components/PostPage';
import './styles/theme.module.css';
import layout from './styles/layout.module.css';

const isLoggedIn = () => !!localStorage.getItem('token');

const AppContent = () => {
  const location = useLocation(); 
  const loggedIn = isLoggedIn();
  const [isNotifOpen, setNotifOpen] = useState(false);

  return (
    <div className={layout.container}>
      <NotificationPanel isOpen={isNotifOpen} onClose={() => setNotifOpen(false)} />

      <div className={layout.page}>
        {loggedIn && (
          <header className={layout.header}>
            <h1>projectDARK</h1>
            <Navbar />
            <button
              onClick={() => setNotifOpen((prev) => !prev)}
              style={{
                background: 'transparent',
                color: 'white',
                border: 'none',
                fontSize: '1.4rem',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
              aria-label="Toggle notifications"
            >
              🔔
            </button>
          </header>
        )}

        <Routes>
          <Route
            path="/login"
            element={loggedIn ? <Navigate to="/" /> : <LoginForm />}
          />
          <Route
            path="/"
            element={loggedIn ? <PostList /> : <Navigate to="/login" />}
          />
          <Route path="/users/:id" element={<ProfilePage />} />
          <Route
            path="/register"
            element={loggedIn ? <Navigate to="/" /> : <RegisterForm />}
          />
          <Route
            path="/feed"
            element={loggedIn ? <Feed /> : <Navigate to="/login" />}
          />
          <Route
            path="/search"
            element={loggedIn ? <SearchResults /> : <Navigate to="/login" />}
          />
          <Route 
            path="/posts/:id" 
            element={<PostPage />} 
          />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
