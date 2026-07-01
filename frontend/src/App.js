import NavBar from './components/NavBar';

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NewsFeed from './pages/NewsFeed';
import Profile from './pages/Profile';
import PostDetails from './pages/PostDetails';
import FriendsList from './pages/FriendsList';
import UserSearch from './pages/UserSearch';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1877f2', // Facebook blue
    },
    background: {
      default: '#f0f2f5',
    },
  },
  typography: {
    fontFamily: 'Segoe UI, Arial, sans-serif',
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('token')));

  useEffect(() => {
    // Check on mount if user is already authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(Boolean(token));

    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        setIsAuthenticated(Boolean(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom event when login/logout happens
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(Boolean(token));
    };
    window.addEventListener('authchange', handleAuthChange);
    return () => window.removeEventListener('authchange', handleAuthChange);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={isAuthenticated ? <NewsFeed /> : <Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/post/:postId" element={<PostDetails />} />
          <Route path="/friends" element={<FriendsList />} />
          <Route path="/search" element={<UserSearch />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
