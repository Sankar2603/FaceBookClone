import React, { useEffect, useState, useCallback } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { getCurrentUserEmail, setCurrentUserId, getCurrentUserId } from '../utils/auth';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('token')));
  const [currentUserId, setCurrentUserIdState] = useState(getCurrentUserId());

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem('token')));
    setCurrentUserIdState(getCurrentUserId());
  }, [location.pathname]);

  // Fetch current user ID if not already stored
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      if (isAuthenticated && !currentUserId) {
        try {
          // Fetch current user from /users/me endpoint
          const currentUserRes = await api.get('/users/me');
          if (currentUserRes.data && currentUserRes.data.id) {
            setCurrentUserId(currentUserRes.data.id);
            setCurrentUserIdState(currentUserRes.data.id);
          }
        } catch (err) {
          console.error('Error fetching current user ID:', err);
        }
      }
    };
    
    fetchCurrentUserId();
  }, [isAuthenticated, currentUserId]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'token') {
        setIsAuthenticated(Boolean(e.newValue));
      }
    };
    const handleAuthChange = () => {
      setIsAuthenticated(Boolean(localStorage.getItem('token')));
      setCurrentUserIdState(getCurrentUserId());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('authchange', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('authchange', handleAuthChange);
    };
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    // Dispatch custom event to trigger App.js state update
    window.dispatchEvent(new Event('authchange'));
    navigate('/');
  }, [navigate]);

  return (
    <AppBar position="static" color="primary" sx={{ mb: 2 }}>
      <Toolbar>
        <IconButton color="inherit" component={Link} to="/">
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', ml: 1 }}>
          Facebook Clone
        </Typography>
        <Button color="inherit" component={Link} to="/friends" startIcon={<PeopleIcon />}>Friends</Button>
        <Button color="inherit" component={Link} to="/search" startIcon={<SearchIcon />}>Search</Button>
        <Button color="inherit" component={Link} to={currentUserId ? `/profile/${currentUserId}` : '/profile/1'} startIcon={<AccountCircle />}>Profile</Button>
        {isAuthenticated ? (
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/register">Register</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
