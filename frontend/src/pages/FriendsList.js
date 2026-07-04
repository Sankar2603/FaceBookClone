import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress, Box, Button, Fade } from '@mui/material';
import api from '../api';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestUsers, setRequestUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await api.get('/friend/list');
        setFriends(res.data);
        const reqRes = await api.get('/friend/requests');
        setRequests(reqRes.data);
        // Fetch user info for each request
        const userPromises = reqRes.data.map(r =>
          api.get(`/users/${r.user_id}`).then(uRes => ({ id: r.user_id, name: `${uRes.data.FirstName} ${uRes.data.LastName}`, avatarUrl: uRes.data.ProfilePic }))
        );
        const usersArr = await Promise.all(userPromises);
        const usersObj = {};
        usersArr.forEach(u => { usersObj[u.id] = u; });
        setRequestUsers(usersObj);
        setError('');
      } catch (err) {
        setError('Failed to load friends or requests');
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const handleAccept = async (userId) => {
    try {
      await api.put(`/friend/accept/${userId}`);
      setRequests(requests.filter(r => r.user_id !== userId));
    } catch {}
  };

  const handleDeny = async (userId) => {
    try {
      await api.delete(`/friend/deny/${userId}`);
      setRequests(requests.filter(r => r.user_id !== userId));
    } catch {}
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>Friends List</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
        <>
          <Typography variant="h6" sx={{ mt: 2 }}>Requests</Typography>
          {requests.length === 0 ? (
            <Typography align="center">No pending requests.</Typography>
          ) : (
            <List>
              {requests.map((req, index) => (
                <Fade in={true} timeout={500 + (index * 100)} key={req.user_id}>
                  <ListItem sx={{ transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 2, borderRadius: 2, bgcolor: 'background.paper' }, mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar src={requestUsers[req.user_id]?.avatarUrl}>{requestUsers[req.user_id]?.name?.[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={requestUsers[req.user_id]?.name || `User ID: ${req.user_id}`} />
                    <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleAccept(req.user_id)}>Accept</Button>
                    <Button variant="outlined" color="error" onClick={() => handleDeny(req.user_id)}>Deny</Button>
                  </ListItem>
                </Fade>
              ))}
            </List>
          )}
          <Typography variant="h6" sx={{ mt: 2 }}>Friends</Typography>
          {friends.length === 0 ? (
            <Typography align="center">No friends yet.</Typography>
          ) : (
            <List>
              {friends.map((friend, index) => (
                <Fade in={true} timeout={500 + (index * 100)} key={friend.id}>
                  <ListItem sx={{ transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.02)', boxShadow: 2, borderRadius: 2, bgcolor: 'background.paper' }, mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar src={friend.ProfilePic}>{friend.FirstName?.[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`${friend.FirstName} ${friend.LastName}`} secondary={friend.email} />
                  </ListItem>
                </Fade>
              ))}
            </List>
          )}
        </>
      )}
    </Container>
  );
};

export default FriendsList;
