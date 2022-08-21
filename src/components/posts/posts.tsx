import { FunctionComponent } from 'react';
import { Container, CardContainer } from './posts.style';
import { usePosts } from './hooks';
import { Card, CardContent, Box, Typography, CardMedia } from '@mui/material';
import Link from 'next/link';

export const Posts: FunctionComponent = () => {
  const { isLoading, posts } = usePosts();

  if (isLoading) return <p>Loading...</p>;
  return (
    <Container>
      {posts.map((post) => {
        const day = new Date(post.travelDay.seconds * 1000);

        return (
          <CardContainer key={post.id}>
            <Link href={`/post/${post.id}`}>
              <Card sx={{ display: 'flex', marginTop: '40px' }}>
                <CardMedia
                  component='img'
                  sx={{ width: 151 }}
                  image='/0006141738F2_551x413y.jpeg'
                  alt='Live from space album cover'
                />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component='div' variant='h5'>
                      {post.title}
                    </Typography>
                    <Typography
                      variant='subtitle1'
                      color='text.secondary'
                      component='div'
                    >
                      {day.toString().substring(0, 15)}
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Link>
          </CardContainer>
        );
      })}
    </Container>
  );
};
