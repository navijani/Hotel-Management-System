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
  Drawer,
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
  LocationOn,
  MenuRounded,
  CloseRounded
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const getAuthStatus = () => {
    const flag =
      window.sessionStorage.getItem('guestSignedIn') === 'true' ||
      window.localStorage.getItem('guestSignedIn') === 'true' ||
      window.sessionStorage.getItem('guestAuthenticated') === 'true' ||
      window.localStorage.getItem('guestAuthenticated') === 'true';
    const profile =
      window.sessionStorage.getItem('guestProfile') ||
      window.localStorage.getItem('guestProfile');
    return Boolean(flag && profile);
  };

  const [isSignedIn, setIsSignedIn] = useState(getAuthStatus);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const handleAuthChange = () => setIsSignedIn(getAuthStatus());
    window.addEventListener('guestAuthChanged', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('guestAuthChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
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

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Rooms', path: '/rooms' },
    { label: 'About', path: '/about' },
    { label: isSignedIn ? 'Profile' : 'Sign In', path: isSignedIn ? '/profile' : '/signin' },
  ];

  const handleBookNow = () => {
    navigate('/rooms');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#ffffff' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: scrolled ? 'rgba(255, 255, 255, 0.97)' : 'rgba(255, 255, 255, 0.91)',
          backdropFilter: 'blur(20px)',
          color: 'text.primary',
          borderBottom: '1px solid rgba(26, 26, 26, 0.08)',
          boxShadow: scrolled ? '0 12px 34px rgba(17, 24, 39, 0.1)' : '0 6px 24px rgba(17, 24, 39, 0.04)',
          top: 0,
          zIndex: 1100,
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
          animation: `${slideDown} 0.6s ease-out`
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{
            minHeight: { xs: 68, lg: scrolled ? 74 : 84 },
            transition: 'min-height 0.3s ease',
            px: { xs: 0, md: 1 },
            gap: 2,
          }}>
            <Typography
              component="a"
              href={import.meta.env.BASE_URL || '/'}
              aria-label="Paradise Resorts home"
              sx={{
                mr: 'auto',
                cursor: 'pointer',
                fontFamily: '"Playfair Display", serif',
                fontSize: { xs: '1.55rem', sm: '1.9rem', md: '2.1rem' },
                letterSpacing: '0.02em',
                color: '#202020',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}
            >
              <Box component="span" sx={{
                color: '#b58b21',
                fontWeight: 800,
                mr: 0.8,
              }}>
                Paradise
              </Box>
              <Box component="span" sx={{ fontWeight: 500 }}>Resorts</Box>
            </Typography>

            <Box component="nav" aria-label="Guest navigation" sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 0.5, p: 0.6, borderRadius: '100px', bgcolor: 'rgba(246, 242, 233, 0.78)', border: '1px solid rgba(181, 139, 33, 0.12)' }}>
              {navLinks.map(({ label, path }) => {
                const active = location.pathname === path;
                return (
                  <Button
                    key={path}
                    onClick={() => navigate(path)}
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      minWidth: 0,
                      px: { md: 1.6, lg: 2.4 },
                      py: 1,
                      borderRadius: '100px',
                      color: active ? '#6f5211' : '#383838',
                      bgcolor: active ? 'rgba(212, 175, 55, 0.19)' : 'transparent',
                      fontFamily: '"Montserrat", sans-serif',
                      fontWeight: active ? 700 : 600,
                      fontSize: '0.76rem',
                      letterSpacing: '0.08em',
                      whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.22)', color: '#6f5211' },
                    }}
                  >
                    {label}
                  </Button>
                );
              })}
            </Box>
            <Box sx={{ display: { xs: 'none', lg: 'block' }, ml: 1 }}>
              <Button
                variant="contained"
                onClick={handleBookNow}
                endIcon={<ArrowRightAlt sx={{ transition: 'transform 0.25s ease' }} />}
                sx={{
                  background: '#202020',
                  color: '#fff',
                  borderRadius: '100px',
                  px: { md: 2.5, lg: 3.5 },
                  py: 1.35,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  fontSize: '0.78rem',
                  fontFamily: '"Montserrat", sans-serif',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.14)',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    background: '#b58b21',
                    boxShadow: '0 12px 24px rgba(181, 139, 33, 0.26)',
                    '& .MuiButton-endIcon': { transform: 'translateX(4px)' },
                  }
                }}
              >
                Book Now
              </Button>
            </Box>
            <IconButton
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ display: { xs: 'inline-flex', lg: 'none' }, color: '#202020', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 2 }}
            >
              <MenuRounded />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        slotProps={{ paper: { sx: { width: { xs: 'min(86vw, 340px)', sm: 360 }, p: 3, bgcolor: '#faf9f6' } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '1.35rem', fontWeight: 700, color: '#202020' }}>Paradise <Box component="span" sx={{ color: '#b58b21' }}>Resorts</Box></Typography>
          <IconButton aria-label="Close navigation menu" onClick={() => setMobileMenuOpen(false)}><CloseRounded /></IconButton>
        </Box>
        <Box component="nav" aria-label="Mobile guest navigation" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navLinks.map(({ label, path }) => {
            const active = location.pathname === path;
            return (
              <Button
                key={path}
                onClick={() => { setMobileMenuOpen(false); navigate(path); }}
                aria-current={active ? 'page' : undefined}
                sx={{ justifyContent: 'flex-start', px: 2, py: 1.5, borderRadius: 2, color: active ? '#6f5211' : '#202020', bgcolor: active ? 'rgba(212,175,55,0.16)' : 'transparent', fontWeight: active ? 700 : 600, '&:hover': { bgcolor: 'rgba(212,175,55,0.2)' } }}
              >
                {label}
              </Button>
            );
          })}
          <Divider sx={{ my: 2 }} />
          <Button onClick={() => { setMobileMenuOpen(false); handleBookNow(); }} endIcon={<ArrowRightAlt />} sx={{ bgcolor: '#202020', color: '#fff', borderRadius: '100px', py: 1.5, fontWeight: 700, '&:hover': { bgcolor: '#b58b21' } }}>
            Book Now
          </Button>
        </Box>
      </Drawer>

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
                  <Typography
                    key={link}
                    variant="body2"
                    onClick={() => link === 'Our Story' && navigate('/about')}
                    sx={{ opacity: 0.7, cursor: 'pointer', transition: '0.2s', '&:hover': { opacity: 1, color: '#d4af37', transform: 'translateX(4px)' } }}
                  >
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
