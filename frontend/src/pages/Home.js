import React from 'react';
import { Container, Typography, Box, Button, Card, CardContent, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const Home = () => {
  return (
    <Box sx={{ bgcolor: '#f0f2f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ mb: 6, textAlign: 'center', mt: 4 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold', 
              color: '#1877f2',
              mb: 2
            }}
          >
            facebook
          </Typography>
          <Typography 
            variant="h5" 
            color="textSecondary" 
            gutterBottom
            sx={{ mb: 4 }}
          >
            Connect with friends and the world around you on Facebook Clone
          </Typography>
        </Box>

        {/* Features Section */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ boxShadow: 2, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 60, color: '#1877f2', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Connect with Friends
                </Typography>
                <Typography color="textSecondary">
                  Find and connect with your friends and family members
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ boxShadow: 2, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ChatIcon sx={{ fontSize: 60, color: '#1877f2', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Share Your Thoughts
                </Typography>
                <Typography color="textSecondary">
                  Post updates, photos, and share your thoughts with your network
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ boxShadow: 2, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ThumbUpIcon sx={{ fontSize: 60, color: '#1877f2', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Engage with Content
                </Typography>
                <Typography color="textSecondary">
                  Like, comment, and interact with posts from your friends
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* CTA Section */}
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            boxShadow: 3,
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Get Started Today
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
            Join our community and start connecting with people around the world
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to="/register"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              Create New Account
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={Link}
              to="/login"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              Log In
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 6, color: 'textSecondary' }}>
          <Typography variant="caption" color="textSecondary">
            © 2025 Facebook Clone. This is a demo application.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
