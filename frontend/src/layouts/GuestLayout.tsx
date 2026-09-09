import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Button,
  Container
} from '@mui/material';
import { ArrowRightAlt } from '@mui/icons-material';
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
    const isSignedIn = window.sessionStorage.getItem('guestSignedIn') === 'true';

    if (isSignedIn) {
      navigate('/rooms');
      return;
    }

    navigate('/?panel=auth&mode=signin');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
                onClick={() => navigate('/admin')}
                sx={navItemStyle}
              >
                Staff
              </Button>
              <Button 
                variant="contained"
                onClick={handleBookNow}
                endIcon={<ArrowRightAlt sx={{ transition: 'transform 0.3s', ml: 0.5 }} />}
                sx={{ 
                  background: 'linear-gradient(45deg, #1a1a1a 30%, #333333 90%)',
                  color: 'white',
                  borderRadius: '50px',
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
      
      <Box component="footer" sx={{ py: 4, bgcolor: '#1a1a1a', color: '#fff', textAlign: 'center' }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} Paradise Resorts. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default GuestLayout;
