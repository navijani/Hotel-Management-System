import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const About: React.FC = () => {
  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: 8, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 800,
            color: '#1a1a1a',
            mb: 6
          }}
        >
          About Paradise Resorts
        </Typography>

        <Grid container spacing={6} sx={{ alignItems: 'center', mb: 8 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              component="img"
              src="https://images.unsplash.com/photo-1542314831-c6a4d142104d?auto=format&fit=crop&w=800&q=80"
              alt="Paradise Resort Exterior"
              sx={{
                width: '100%',
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 600 }}>
              Our Story
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, mb: 2 }}>
              Founded in 1995, Paradise Resorts began with a simple vision: to create a sanctuary where luxury meets nature. Over the decades, we have grown from a single boutique hotel to a collection of award-winning resorts across the most breathtaking locations.
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, mb: 2 }}>
              Our commitment to exceptional hospitality, sustainable practices, and creating unforgettable experiences remains the cornerstone of everything we do. We believe in anticipating your needs and exceeding your expectations.
            </Typography>
          </Grid>
        </Grid>

        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            color: '#1a1a1a',
            mb: 6,
            mt: 12
          }}
        >
          Our Core Values
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              icon: <HotelIcon sx={{ fontSize: 48, color: '#d4af37' }} />,
              title: "Uncompromising Comfort",
              description: "Every detail of our rooms is meticulously designed to provide the ultimate relaxation experience."
            },
            {
              icon: <RestaurantIcon sx={{ fontSize: 48, color: '#d4af37' }} />,
              title: "Culinary Excellence",
              description: "Our world-class chefs craft exceptional dining experiences using the finest local ingredients."
            },
            {
              icon: <EmojiEventsIcon sx={{ fontSize: 48, color: '#d4af37' }} />,
              title: "Award-Winning Service",
              description: "Our dedicated team is passionate about delivering personalized, intuitive service round the clock."
            }
          ].map((value, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-10px)' } }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {value.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
