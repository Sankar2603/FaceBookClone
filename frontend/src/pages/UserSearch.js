import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress, Box, ListItemButton, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState({});
  const [friendsSet, setFriendsSet] = useState(new Set());
  const [sentMap, setSentMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await api.get('/friend/list');
        const ids = new Set((res.data || []).map(f => f.id || f.user_id));
        setFriendsSet(ids);
      } catch (e) {
        setFriendsSet(new Set());
      }
    };
    fetchFriends();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/all');
      // Filter users by name (case-insensitive)
      const filtered = res.data.filter(user => {
        const firstName = user.FirstName ? user.FirstName.toLowerCase() : '';
        const lastName = user.LastName ? user.LastName.toLowerCase() : '';
        const q = query.toLowerCase();
        return firstName.includes(q) || lastName.includes(q);
      });
      setResults(filtered);
      setError('');
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    setAdding(prev => ({ ...prev, [userId]: true }));
    try {
      await api.post(`/friend/request/${userId}`);
      setAdding(prev => ({ ...prev, [userId]: false }));
      setSentMap(prev => ({ ...prev, [userId]: true }));
    } catch (err) {
      setError('Friend request already sent');
      if (err?.response?.status === 400) {
        setSentMap(prev => ({ ...prev, [userId]: true }));
      }
      setAdding(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>User Search</Typography>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          label="Search users"
          fullWidth
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
        results.length === 0 ? (
          <Typography align="center">No user found.</Typography>
        ) : (
          <List>
            {results.map((user, index) => (
              <Fade in={true} timeout={500 + (index * 50)} key={user.id}>
                <ListItem disablePadding sx={{ transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 3, borderRadius: 2, zIndex: 1 }, mb: 1, bgcolor: 'background.paper' }}>
                <ListItemButton onClick={() => navigate(`/profile/${user.id}`)}>
                  <ListItemAvatar>
                    <Avatar src={user.ProfilePic}>{user.FirstName?.[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={`${user.FirstName} ${user.LastName}`} secondary={user.email} />
                  {friendsSet.has(user.id) || friendsSet.has(String(user.id)) ? (
                    <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>Friends</Typography>
                  ) : sentMap[user.id] ? (
                    <Button
                      variant="contained"
                      disabled
                      sx={{ bgcolor: 'grey.300', color: 'text.primary', '&:hover': { bgcolor: 'grey.300' } }}
                      onClick={e => e.stopPropagation()}
                    >
                      Friend request sent
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={e => { e.stopPropagation(); handleAddFriend(user.id); }}
                      disabled={adding[user.id]}
                    >
                      {adding[user.id] ? 'Adding...' : 'Add Friend'}
                    </Button>
                  )}
                </ListItemButton>
                </ListItem>
              </Fade>
            ))}
          </List>
        )
      )}
    </Container>
  );
};

export default UserSearch;
