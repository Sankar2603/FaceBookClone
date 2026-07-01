import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert, Divider } from '@mui/material';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { setCurrentUserId } from '../utils/auth';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post('/users/', {
        FirstName: firstName,
        LastName: lastName,
        email,
        password,
      });
      setError('');
      navigate('/login');
    } catch (err) {
      setError('Registration failed');
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
      setError('Google Registration Failed');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>Register</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="First Name" fullWidth margin="normal" value={firstName} onChange={e => setFirstName(e.target.value)} />
        <TextField label="Last Name" fullWidth margin="normal" value={lastName} onChange={e => setLastName(e.target.value)} />
        <TextField label="Email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleRegister}>Register</Button>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Divider>OR</Divider>
        </Box>
        <Box display="flex" justifyContent="center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError('Google Registration Failed');
            }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
