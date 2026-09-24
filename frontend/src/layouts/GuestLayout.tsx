import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  IconButton,
  Divider,
  TextField
} from '@mui/material';
import { 
  ArrowRightAlt, 
  Facebook, 
  Twitter, 
  Instagram, 
  Email, 
  Phone, 
  LocationOn 
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.5);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(212, 175, 55, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const GuestLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(() => window.sessionStorage.getItem('guestSignedIn') === 'true');

  useEffect(() => {
    const handleAuthChange = () => setIsSignedIn(window.sessionStorage.getItem('guestSignedIn') === 'true');
    window.addEventListener('guestAuthChanged', handleAuthChange);
    return () => window.removeEventListener('guestAuthChanged', handleAuthChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const navItemStyle = {
    color: scrolled ? '#333333' : '#1a1a1a',
    fontWeight: 500,
    fontSize: '0.95rem',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
    position: 'relative',
    px: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      width: '0%',
      height: '2px',
      bottom: '0px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#d4af37',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    '&:hover': {
      color: '#d4af37',
      bgcolor: 'transparent',
      '&::after': {
        width: '100%',
      }
    }
  };

  const handleBookNow = () => {
    if (isSignedIn) {
      navigate('/rooms');
      return;
    }

    navigate('/?panel=auth&mode=choice');
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem('guestSignedIn');
    window.sessionStorage.removeItem('guestProfile');
    setIsSignedIn(false);
    window.dispatchEvent(new Event('guestAuthChanged'));
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#ffffff' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        elevation={scrolled ? 8 : 0}
        sx={{ 
          bgcolor: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(25px)',
          color: 'text.primary',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
          top: 0,
          zIndex: 1100,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: `${slideDown} 0.8s cubic-bezier(0.4, 0, 0.2, 1)`
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ 
            minHeight: scrolled ? '65px' : '80px', 
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            px: { xs: 0, md: 2 }
          }}>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                cursor: 'pointer', 
                fontWeight: 800, 
                fontFamily: '"Playfair Display", serif',
                letterSpacing: '1.5px',
                color: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                transform: scrolled ? 'scale(0.9)' : 'scale(1)',
                transformOrigin: 'left center',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={() => navigate('/')}
            >
              <Box component="span" sx={{ 
                color: '#d4af37', 
                mr: 1,
                textShadow: scrolled ? 'none' : '1px 1px 2px rgba(0,0,0,0.05)'
              }}>
                Paradise
              </Box> 
              <Box component="span" sx={{ fontWeight: 400 }}>Resorts</Box>
            </Typography>
            
            <Box sx={{ display: 'flex', gap: { xs: 2, md: 5 }, alignItems: 'center' }}>
              {isSignedIn && (
                <Button onClick={handleLogout} sx={navItemStyle}>
                  Logout
                </Button>
              )}
              <Button 
                onClick={() => navigate('/rooms')}
                sx={{ 
                  ...navItemStyle, 
                  color: location.pathname === '/rooms' ? '#d4af37' : navItemStyle.color,
                  '&::after': {
                    ...navItemStyle['&::after'],
                    width: location.pathname === '/rooms' ? '100%' : '0%'
                  }
                }}
              >
                Rooms
              </Button>
              <Button 
                onClick={() => navigate('/portal')}
                sx={navItemStyle}
              >
                Staff
              </Button>
              <Button 
                variant="contained"
                onClick={handleBookNow}
                endIcon={<ArrowRightAlt sx={{ transition: 'transform 0.3s', ml: 0.5 }} />}
                sx={{ 
                  background: 'linear-gradient(45deg, #111111 30%, #333333 90%)',
                  color: 'white',
                  borderRadius: '0px',
                  px: { xs: 3, md: 5 },
                  py: scrolled ? 1.2 : 1.5,
                  fontWeight: 600,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontSize: '0.9rem',
                  fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
                  boxShadow: '0 8px 20px -6px rgba(0,0,0,0.3)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `${pulse} 2.5s infinite`,
                  ml: { xs: 0, md: 2 },
                  '&:hover': {
                    background: 'linear-gradient(45deg, #d4af37 30%, #e5c158 90%)',
                    boxShadow: '0 12px 25px -8px rgba(212, 175, 55, 0.6)',
                    transform: 'translateY(-3px)',
                    '& .MuiButton-endIcon': {
                      transform: 'translateX(4px)'
                    }
                  }
                }}
              >
                Book Now
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      
      <Box component="footer" sx={{ bgcolor: '#111111', color: '#f8fafc', pt: { xs: 8, md: 10 }, pb: 4, mt: 'auto', borderTop: '2px solid #d4af37' }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} sx={{ mb: 6 }}>
            {/* Brand Column */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: '"Playfair Display", serif', letterSpacing: '1px', mb: 3 }}>
                <Box component="span" sx={{ color: '#d4af37', mr: 1 }}>Paradise</Box> 
                <Box component="span" sx={{ fontWeight: 400 }}>Resorts</Box>
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mb: 4, lineHeight: 1.8, maxWidth: '90%' }}>
                Experience unparalleled luxury and breathtaking views at Paradise Resorts. Your perfect escape awaits in our meticulously designed rooms and suites, offering world-class amenities and unforgettable hospitality.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton sx={{ color: '#d4af37', bgcolor: 'rgba(212,175,55,0.1)', '&:hover': { bgcolor: '#d4af37', color: '#1a1a1a' } }}><Facebook fontSize="small" /></IconButton>
                <IconButton sx={{ color: '#d4af37', bgcolor: 'rgba(212,175,55,0.1)', '&:hover': { bgcolor: '#d4af37', color: '#1a1a1a' } }}><Twitter fontSize="small" /></IconButton>
                <IconButton sx={{ color: '#d4af37', bgcolor: 'rgba(212,175,55,0.1)', '&:hover': { bgcolor: '#d4af37', color: '#1a1a1a' } }}><Instagram fontSize="small" /></IconButton>
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#e2e8f0', letterSpacing: 1 }}>EXPLORE</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {['Our Story', 'Rooms & Suites', 'Dining', 'Spa & Wellness', 'Special Offers'].map((link) => (
                  <Typography key={link} variant="body2" sx={{ opacity: 0.7, cursor: 'pointer', transition: '0.2s', '&:hover': { opacity: 1, color: '#d4af37', transform: 'translateX(4px)' } }}>
                    {link}
                  </Typography>
                ))}
              </Box>
            </Grid>

            {/* Contact Info */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#e2e8f0', letterSpacing: 1 }}>CONTACT</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <LocationOn sx={{ color: '#d4af37', fontSize: 20, mt: 0.2 }} />
                  <Typography variant="body2" sx={{ opacity: 0.7, lineHeight: 1.6 }}>123 Paradise Boulevard,<br />Oceanview District,<br />CA 90210</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone sx={{ color: '#d4af37', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>+1 (800) 123-4567</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email sx={{ color: '#d4af37', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>reservations@paradiseresorts.com</Typography>
                </Box>
              </Box>
            </Grid>

            {/* Newsletter */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#e2e8f0', letterSpacing: 1 }}>NEWSLETTER</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mb: 3, lineHeight: 1.6 }}>
                Subscribe to our newsletter for exclusive offers, travel inspiration, and the latest resort news.
              </Typography>
              <Box component="form" sx={{ display: 'flex', gap: 1 }}>
                <TextField 
                  variant="outlined" 
                  size="small" 
                  placeholder="Your email address" 
                  fullWidth
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    borderRadius: 0,
                    '& input': { color: '#fff', fontSize: '0.9rem' },
                    '& fieldset': { borderColor: 'rgba(212,175,55,0.3)', borderRadius: 0 },
                    '&:hover fieldset': { borderColor: '#d4af37 !important' },
                    '&.Mui-focused fieldset': { borderColor: '#d4af37 !important' }
                  }} 
                />
                <Button variant="contained" sx={{ bgcolor: '#d4af37', color: '#1a1a1a', borderRadius: 0, fontWeight: 'bold', '&:hover': { bgcolor: '#e5c158' } }}>
                  SUBSCRIBE
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(212,175,55,0.2)', mb: 3 }} />
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              © {new Date().getFullYear()} Paradise Resorts. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                <Typography key={link} variant="caption" sx={{ opacity: 0.6, cursor: 'pointer', '&:hover': { opacity: 1, color: '#d4af37' } }}>
                  {link}
                </Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default GuestLayout;
