import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import SpaIcon from '@mui/icons-material/Spa';
import PoolIcon from '@mui/icons-material/Pool';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const About: React.FC = () => {
  const navigate = useNavigate();

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
              src={`${import.meta.env.BASE_URL}images/colombo.jpg`}
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

        <Grid container spacing={2} sx={{ mb: 12 }}>
          {[
            { value: '30+', label: 'Years of hospitality' },
            { value: '3', label: 'Beautiful destinations' },
            { value: '24/7', label: 'Guest care' },
            { value: '98%', label: 'Guest satisfaction' },
          ].map((stat) => (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <Box sx={{ textAlign: 'center', p: { xs: 2, md: 3 }, borderRadius: 3, bgcolor: '#fff', border: '1px solid #e2e8f0' }}>
                <Typography sx={{ color: '#d4af37', fontSize: { xs: '1.8rem', md: '2.3rem' }, fontWeight: 800, fontFamily: '"Playfair Display", serif' }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mb: 12 }}>
          <Typography variant="h3" align="center" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
            The Paradise experience
          </Typography>
          <Typography align="center" sx={{ color: '#64748b', maxWidth: 650, mx: 'auto', mb: 5, lineHeight: 1.7 }}>
            Every stay is thoughtfully designed around the moments that matter most.
          </Typography>
          <Grid container spacing={3}>
            {[
              { icon: <SpaIcon />, title: 'Wellness & renewal', text: 'Restore your rhythm with calming spa treatments, quiet spaces, and slow island mornings.' },
              { icon: <PoolIcon />, title: 'Leisure without limits', text: 'Enjoy beautiful pools, peaceful views, and spaces made for effortless relaxation.' },
              { icon: <RoomServiceIcon />, title: 'Care at every moment', text: 'From a warm welcome to a late-night request, our team is here whenever you need us.' },
              { icon: <NaturePeopleIcon />, title: 'Rooted in Sri Lanka', text: 'Discover local flavours, stories, and landscapes through experiences with a sense of place.' },
            ].map((feature) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={feature.title}>
                <Card sx={{ height: '100%', borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 30px rgba(15,23,42,0.1)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'inline-flex', p: 1.2, mb: 2, borderRadius: 2, bgcolor: 'rgba(212,175,55,0.12)', color: '#b58b00' }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{feature.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.7 }}>{feature.text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

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

        <Box sx={{ mt: 12, p: { xs: 4, md: 6 }, borderRadius: 5, bgcolor: '#111827', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', bgcolor: 'rgba(212,175,55,0.12)', top: -130, right: -60 }} />
          <Typography variant="h4" sx={{ position: 'relative', fontFamily: '"Playfair Display", serif', fontWeight: 700, mb: 1 }}>
            Your next escape starts here
          </Typography>
          <Typography sx={{ position: 'relative', color: 'rgba(255,255,255,0.72)', maxWidth: 600, mx: 'auto', mb: 3, lineHeight: 1.7 }}>
            Find a room that feels like yours and let Paradise take care of the rest.
          </Typography>
          <Box component="button" onClick={() => navigate('/rooms')} sx={{ position: 'relative', border: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 1, px: 3, py: 1.4, borderRadius: '100px', bgcolor: '#d4af37', color: '#111827', fontSize: '1rem', fontWeight: 700, '&:hover': { bgcolor: '#f3e5ab' } }}>
            Explore rooms <ArrowForwardIcon fontSize="small" />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default About;
