import React from 'react';
import { Container, Typography } from '@mui/material';

const PostDetails = () => (
  <Container maxWidth="sm">
    <Typography variant="h4" align="center" gutterBottom>Post Details</Typography>
    {/* Post content, comments, and likes will be shown here */}
  </Container>
);

export default PostDetails;
