import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, CardHeader, Avatar, CircularProgress, Box, TextField, Button, IconButton, Divider, List, ListItem, ListItemAvatar, ListItemText, Fade, Collapse } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import api from '../api';

const NewsFeed = () => {
  const [posts, setPosts] = useState([]);
  const [postUsers, setPostUsers] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [postComments, setPostComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [commenting, setCommenting] = useState({});

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts/');
      setPosts(res.data);
      setError('');
      // Fetch like counts for each post
      const likeCountPromises = res.data.map(post =>
        api.get(`/likes/${post.id}`).then(likeRes => ({ postId: post.id, count: likeRes.data.count })).catch(() => ({ postId: post.id, count: 0 }))
      );
      const likeCountsArr = await Promise.all(likeCountPromises);
      const likeCountsObj = {};
      likeCountsArr.forEach(({ postId, count }) => {
        likeCountsObj[postId] = count;
      });
      setLikeCounts(likeCountsObj);
      // Fetch user info for each post author
      const userPromises = res.data.map(post =>
        api.get(`/users/${post.user_id}`).then(uRes => ({ id: post.user_id, name: `${uRes.data.FirstName} ${uRes.data.LastName}`, avatarUrl: uRes.data.ProfilePic }))
      );
      const usersArr = await Promise.all(userPromises);
      const usersObj = {};
      usersArr.forEach(u => { usersObj[u.id] = u; });
      setPostUsers(usersObj);
      
      // Fetch comments for each post
      const commentPromises = res.data.map(post =>
        api.get(`/comments/${post.id}`).then(commentsRes => ({ postId: post.id, comments: commentsRes.data })).catch(() => ({ postId: post.id, comments: [] }))
      );
      const commentsArr = await Promise.all(commentPromises);
      const commentsObj = {};
      
      // For each post's comments, fetch user info
      for (const { postId, comments } of commentsArr) {
        const commentUserPromises = comments.map(comment =>
          api.get(`/users/${comment.user_id}`).then(userRes => ({ ...comment, user: userRes.data })).catch(() => comment)
        );
        const commentsWithUsers = await Promise.all(commentUserPromises);
        commentsObj[postId] = commentsWithUsers;
      }
      
      setPostComments(commentsObj);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.trim() && !imageUrl.trim()) return;
    setPosting(true);
    try {
      await api.post('/posts/', { content: newPost, image_url: imageUrl });
      setNewPost('');
      setImageUrl('');
      fetchPosts();
    } catch (err) {
      setError('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    // Optimistic UI Update: assume success and immediately update the UI
    const previousCount = likeCounts[postId] || 0;
    setLikeCounts(prev => ({ ...prev, [postId]: previousCount + 1 }));
    
    try {
      await api.post(`/likes/${postId}/like`);
      // Fetch updated like count for this post only to ensure accuracy
      const likeRes = await api.get(`/likes/${postId}`);
      setLikeCounts(prev => ({ ...prev, [postId]: likeRes.data.count }));
      setError('');
    } catch (err) {
      // If already liked, backend returns 400, so try unlike
      if (err.response && err.response.status === 400) {
        // Optimistic unlike
        setLikeCounts(prev => ({ ...prev, [postId]: previousCount - 1 }));
        try {
          await api.post(`/likes/${postId}/unlike`);
          const likeRes = await api.get(`/likes/${postId}`);
          setLikeCounts(prev => ({ ...prev, [postId]: likeRes.data.count }));
          setError('');
        } catch (unlikeErr) {
          // Revert if unlike also fails
          setLikeCounts(prev => ({ ...prev, [postId]: previousCount }));
          setError('You have not liked this post yet.');
        }
      } else {
        // Revert on general error
        setLikeCounts(prev => ({ ...prev, [postId]: previousCount }));
        setError('Could not update like status. Please try again.');
      }
    }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    setCommenting(prev => ({ ...prev, [postId]: true }));
    try {
      await api.post(`/comments/${postId}`, { content: commentText[postId] });
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      // Fetch updated comments for this post only
      const commentsRes = await api.get(`/comments/${postId}`);
      
      // Fetch user info for each comment
      const commentUserPromises = commentsRes.data.map(comment =>
        api.get(`/users/${comment.user_id}`).then(userRes => ({ ...comment, user: userRes.data })).catch(() => comment)
      );
      const commentsWithUsers = await Promise.all(commentUserPromises);
      
      setPostComments(prev => ({ ...prev, [postId]: commentsWithUsers }));
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setCommenting(prev => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>News Feed</Typography>
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          label="What's on your mind?"
          multiline
          fullWidth
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Image URL (optional)"
          fullWidth
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleCreatePost} disabled={posting}>
          {posting ? 'Posting...' : 'Post'}
        </Button>
      </Card>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="warning" align="center">{error}</Typography>
      ) : (
        posts.length === 0 ? (
          <Typography align="center">No posts to show.</Typography>
        ) : (
          posts.map((post, index) => (
            <Fade in={true} timeout={500 + (index * 100)} key={post.id}>
              <Card sx={{ mb: 2, transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', '&:hover': { transform: 'scale(1.02)', boxShadow: 6 } }}>
              <CardHeader
                avatar={<Avatar src={postUsers[post.user_id]?.avatarUrl}>{postUsers[post.user_id]?.name?.[0]}</Avatar>}
                title={postUsers[post.user_id]?.name || `User ID: ${post.user_id}`}
                subheader={new Date(post.created_at).toLocaleString()}
              />
              <CardContent>
                <Typography sx={{ mb: 2 }}>{post.content}</Typography>
                {post.image_url && (
                  <Box sx={{ mb: 2 }}>
                    <img src={post.image_url} alt="Post" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} />
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <IconButton onClick={() => handleLike(post.id)} color="primary">
                    <ThumbUpIcon />
                  </IconButton>
                  <Typography sx={{ ml: 1, mr: 2 }}>{likeCounts[post.id] ?? 0}</Typography>
                  <Typography sx={{ mr: 2 }}>Likes</Typography>
                  <CommentIcon sx={{ mr: 1 }} />
                  <Typography>{postComments[post.id]?.length || 0} Comments</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <List>
                  {postComments[post.id]?.map(comment => (
                    <ListItem key={comment.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>{comment.user?.FirstName?.[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${comment.user?.FirstName} ${comment.user?.LastName}` || 'Unknown User'}
                        secondary={comment.content}
                      />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TextField
                    label="Add a comment"
                    size="small"
                    fullWidth
                    value={commentText[post.id] || ''}
                    onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 1 }}
                    onClick={() => handleComment(post.id)}
                    disabled={commenting[post.id]}
                  >
                    {commenting[post.id] ? '...' : 'Comment'}
                  </Button>
                </Box>
              </CardContent>
              </Card>
            </Fade>
          ))
        )
      )}
    </Container>
  );
};

export default NewsFeed;
