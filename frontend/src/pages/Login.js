import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert, Divider } from '@mui/material';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserEmail, setCurrentUserId } from '../utils/auth';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // FastAPI expects OAuth2PasswordRequestForm: username, password as form data
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      const res = await api.post('/auth/login', params);
      localStorage.setItem('token', res.data.access_token);
      
      // Fetch current user info and store userId
      try {
        const currentUserRes = await api.get('/users/me');
        if (currentUserRes.data && currentUserRes.data.id) {
          setCurrentUserId(currentUserRes.data.id);
        }
      } catch (userErr) {
        console.error('Error fetching current user:', userErr);
      }
      
      // Dispatch custom event to trigger App.js state update
      window.dispatchEvent(new Event('authchange'));
      
      setError('');
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', { token: credentialResponse.credential });
      localStorage.setItem('token', res.data.access_token);
      
      try {
        const currentUserRes = await api.get('/users/me');
        if (currentUserRes.data && currentUserRes.data.id) {
          setCurrentUserId(currentUserRes.data.id);
        }
      } catch (userErr) {
        console.error('Error fetching current user:', userErr);
      }
      
      window.dispatchEvent(new Event('authchange'));
      setError('');
      navigate('/');
    } catch (err) {
      setError('Google Login Failed');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>Login</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleLogin}>Login</Button>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Divider>OR</Divider>
        </Box>
        <Box display="flex" justifyContent="center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError('Google Login Failed');
            }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
