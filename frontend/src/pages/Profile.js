import React, { useEffect, useState } from 'react';
import { Container, Typography, Avatar, Card, CardHeader, CardContent, CircularProgress, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../api';

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({ FirstName: '', LastName: '', bio: '', ProfilePic: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('Fetching profile for userId:', userId);
      
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('API call: /users/' + userId);
        const userRes = await api.get(`/users/${userId}`);
        console.log('User data:', userRes.data);
        setUser(userRes.data);
        
        // Fetch posts
        try {
          const postsRes = await api.get(`/users/${userId}/posts`);
          setPosts(postsRes.data);
        } catch (postErr) {
          console.log('Posts endpoint might not exist yet');
          setPosts([]);
        }

        // Check friendship status
        try {
          const friendsRes = await api.get('/friend/list');
          const friendIds = new Set((friendsRes.data || []).map(f => f.id || f.user_id));
          setIsFriend(friendIds.has(Number(userId)) || friendIds.has(String(userId)));
        } catch (friendErr) {
          // If unable to load, default to not friends
          setIsFriend(false);
        }
        
        setError('');
      } catch (err) {
        console.error('Full error:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        setError(`Failed to load profile: ${err.response?.data?.detail || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const currentUserId = localStorage.getItem('userId');

  const handleOpenEdit = () => {
    setEditData({
      FirstName: user.FirstName || '',
      LastName: user.LastName || '',
      bio: user.bio || '',
      ProfilePic: user.ProfilePic || ''
    });
    setOpenEdit(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/me', editData);
      setUser(res.data);
      setOpenEdit(false);
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSendRequest = async () => {
    setRequesting(true);
    try {
      await api.post(`/friend/request/${userId}`);
      setSuccessMsg('Friend request sent!');
      setRequestSent(true);
    } catch {
      setSuccessMsg('Could not send friend request.');
    } finally {
      setRequesting(false);
    }
  };

  const handleBlock = async () => {
    setBlocking(true);
    try {
      await api.post(`/friend/block/${userId}`);
      setSuccessMsg('User blocked.');
    } catch {
      setSuccessMsg('Could not block user.');
    } finally {
      setBlocking(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>Profile</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : user ? (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar 
            src={user.ProfilePic} 
            sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
          >
            {user.FirstName?.[0] || user.name?.[0]}
          </Avatar>
          <Typography variant="h5">
            {user.FirstName} {user.LastName}
          </Typography>
          <Typography variant="body1">{user.email}</Typography>
          {user.bio && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{user.bio}</Typography>}
          
          {currentUserId === userId ? (
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" color="primary" onClick={handleOpenEdit}>
                Edit Profile
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {isFriend ? (
                <Typography variant="body1" sx={{ mr: 2, color: 'text.secondary', display: 'inline-block', fontWeight: 600 }}>
                  Friends
                </Typography>
              ) : requestSent ? (
                <Button
                  variant="contained"
                  disabled
                  sx={{ mr: 2, bgcolor: 'grey.300', color: 'text.primary', '&:hover': { bgcolor: 'grey.300' } }}
                >
                  Friend request sent
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSendRequest} 
                  disabled={requesting} 
                  sx={{ mr: 2 }}
                >
                  {requesting ? 'Sending...' : 'Send Friend Request'}
                </Button>
              )}
              {!isFriend && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={handleBlock} 
                  disabled={blocking}
                >
                  {blocking ? 'Blocking...' : 'Block'}
                </Button>
              )}
            </Box>
          )}
          {successMsg && (
            <Typography color="success.main" sx={{ mt: 1 }}>
              {successMsg}
            </Typography>
          )}
        </Box>
      ) : null}
      
      <Typography variant="h6" sx={{ mt: 2 }}>Posts</Typography>
      {posts.length === 0 ? (
        <Typography align="center">No posts yet.</Typography>
      ) : (
        posts.map(post => (
          <Card key={post.id} sx={{ mb: 2 }}>
            <CardHeader
              avatar={
                <Avatar src={user?.ProfilePic}>
                  {user?.FirstName?.[0] || user?.name?.[0]}
                </Avatar>
              }
              title={`${user?.FirstName} ${user?.LastName}`}
              subheader={new Date(post.created_at).toLocaleString()}
            />
            <CardContent>
              <Typography>{post.content}</Typography>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            label="First Name"
            fullWidth
            margin="normal"
            value={editData.FirstName}
            onChange={(e) => setEditData({ ...editData, FirstName: e.target.value })}
          />
          <TextField
            label="Last Name"
            fullWidth
            margin="normal"
            value={editData.LastName}
            onChange={(e) => setEditData({ ...editData, LastName: e.target.value })}
          />
          <TextField
            label="Bio"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={editData.bio}
            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
          />
          <TextField
            label="Profile Picture URL"
            fullWidth
            margin="normal"
            value={editData.ProfilePic}
            onChange={(e) => setEditData({ ...editData, ProfilePic: e.target.value })}
            helperText="Provide a direct link to an image file (e.g., .jpg, .png)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
