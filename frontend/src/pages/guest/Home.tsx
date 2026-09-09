import React, { useEffect, useRef, useState } from 'react';
import { Typography, Box, Button, Grid, Card, CardContent, Container, TextField, MenuItem, IconButton, Rating, Avatar, AvatarGroup, InputAdornment, Chip } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import WifiIcon from '@mui/icons-material/Wifi';
import PoolIcon from '@mui/icons-material/Pool';
import SpaIcon from '@mui/icons-material/Spa';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.sessionStorage.getItem('guestSignedIn') === 'true';
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const panel = searchParams.get('panel');
    const mode = searchParams.get('mode');

    if (panel === 'auth') {
      setAuthMode(mode === 'signup' ? 'signup' : 'signin');
      setIsFlipped(true);
      return;
    }

    setIsFlipped(false);
  }, [searchParams]);

  const amenities = [
    { icon: <WifiIcon fontSize="large" color="primary" />, title: 'Free High-Speed Wi-Fi', description: 'Stay connected wherever you are in the hotel.' },
    { icon: <PoolIcon fontSize="large" color="primary" />, title: 'Infinity Pool', description: 'Relax in our temperature-controlled infinity pool.' },
    { icon: <SpaIcon fontSize="large" color="primary" />, title: 'Luxury Spa', description: 'Rejuvenate your senses with our premium spa treatments.' },
    { icon: <RoomServiceIcon fontSize="large" color="primary" />, title: '24/7 Room Service', description: 'Enjoy delicious meals delivered right to your door.' },
  ];

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const openAuthPanel = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsFlipped(true);
    setSearchParams({ panel: 'auth', mode });
  };

  const closeAuthPanel = () => {
    setIsFlipped(false);
    setSearchParams({});
  };

  const markSignedIn = () => {
    window.sessionStorage.setItem('guestSignedIn', 'true');
    setIsSignedIn(true);
    closeAuthPanel();
  };

  const handleProtectedStay = () => {
    if (isSignedIn) {
      navigate('/rooms');
      return;
    }

    openAuthPanel('signin');
  };

  const heroActionButtonSx = {
    px: 3.5,
    py: 2,
    fontSize: '1.05rem',
    fontWeight: 700,
    borderRadius: '50px',
    textTransform: 'none',
    transition: 'all 0.3s ease-in-out',
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          color: 'white',
          pt: { xs: 10, md: 12 },
          pb: { xs: 8, md: 12 },
          px: 2,
          textAlign: 'center',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          '@keyframes fadeInUp': {
            '0%': { opacity: 0, transform: 'translateY(40px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
          '@keyframes pulseGlow': {
            '0%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
            '70%': { boxShadow: '0 0 0 20px rgba(212, 175, 55, 0)' },
            '100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' },
          }
        }}
      >
        {/* Video Background Container */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -2,
            pointerEvents: 'none',
            overflow: 'hidden',
            backgroundColor: '#0a0a0a'
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: -2,
              opacity: 0.85,
              filter: 'contrast(1.1) saturate(1.2)'
            }}
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        </Box>
        
        {/* Modern Gradient Overlay */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(212, 175, 55, 0.2) 100%)',
            zIndex: -1
          }}
        />

        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 1, 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              perspective: '1800px',
              width: '100%',
              maxWidth: '900px',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                minHeight: { xs: '860px', md: '860px' },
              }}
            >
              <Box
                sx={{
                  p: { xs: 4, md: 8 },
                  borderRadius: 8,
                  bgcolor: 'rgba(15, 23, 42, 0.4)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                  width: '100%',
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  overflow: 'hidden'
                }}
              >
                <Chip 
                  icon={<LocalOfferIcon sx={{ color: '#d4af37 !important' }} />} 
                  label="Summer Special: 20% Off All Suites" 
                  variant="outlined"
                  sx={{ 
                    mb: 3, 
                    color: '#d4af37', 
                    borderColor: 'rgba(212, 175, 55, 0.5)',
                    bgcolor: 'rgba(212, 175, 55, 0.1)',
                    fontWeight: 'bold',
                    animation: 'fadeInUp 1s ease-out forwards',
                    opacity: 0,
                    backdropFilter: 'blur(4px)'
                  }} 
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: 'center', animation: 'fadeInUp 1s ease-out forwards', opacity: 0, animationDelay: '0.2s' }}>
                  <AvatarGroup total={2000} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.8rem', borderColor: 'rgba(255,255,255,0.2)' } }}>
                    <Avatar alt="Guest" src="https://i.pravatar.cc/100?img=1" />
                    <Avatar alt="Guest" src="https://i.pravatar.cc/100?img=2" />
                    <Avatar alt="Guest" src="https://i.pravatar.cc/100?img=3" />
                  </AvatarGroup>
                  <Box sx={{ textAlign: 'left' }}>
                    <Rating value={5} readOnly size="small" sx={{ color: '#d4af37' }} />
                    <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                      Loved by our guests
                    </Typography>
                  </Box>
                </Box>

                <Typography 
                  variant="overline"
                  sx={{
                    display: 'block',
                    color: '#d4af37',
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontWeight: 700,
                    letterSpacing: 4,
                    mb: 1,
                    animation: 'fadeInUp 1s ease-out forwards',
                    animationDelay: '0.4s',
                    opacity: 0,
                  }}
                >
                  Welcome To Paradise
                </Typography>

                <Typography 
                  variant="h1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 900, 
                    fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                    fontFamily: '"Playfair Display", serif',
                    lineHeight: 1.1,
                    mb: 3,
                    background: 'linear-gradient(to right, #ffffff, #d4af37)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0px 10px 20px rgba(0,0,0,0.3)',
                    animation: 'fadeInUp 1s ease-out forwards',
                    animationDelay: '0.6s',
                    opacity: 0,
                  }}
                >
                  Experience <br /> Ultimate Luxury
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4, 
                    fontWeight: 300,
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: 1.8,
                    maxWidth: '700px',
                    mx: 'auto',
                    fontSize: { xs: '1.05rem', md: '1.2rem' },
                    animation: 'fadeInUp 1s ease-out forwards',
                    animationDelay: '0.8s',
                    opacity: 0,
                  }}
                >
                  Discover the perfect blend of comfort, elegance, and world-class service at our premium hotel branches across Sri Lanka.
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 2, md: 4 }, 
                  justifyContent: 'center', 
                  mb: 5,
                  flexWrap: 'wrap',
                  animation: 'fadeInUp 1s ease-out forwards',
                  animationDelay: '1s',
                  opacity: 0,
                }}>
                  {['Best Price Guarantee', 'Free Cancellation', 'No Prepayment'].map((text, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutlineIcon sx={{ color: '#d4af37', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, letterSpacing: 0.5 }}>
                        {text}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'center', 
                    flexWrap: 'wrap',
                    animation: 'fadeInUp 1s ease-out forwards',
                    animationDelay: '1.2s',
                    opacity: 0,
                  }}
                >
                  <Button 
                    variant="contained" 
                    size="large" 
                    onClick={handleProtectedStay}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      ...heroActionButtonSx,
                      px: 6,
                      background: 'linear-gradient(45deg, #d4af37 30%, #f3e5ab 90%)',
                      color: '#1a1a1a',
                      boxShadow: '0 8px 25px -8px #d4af37',
                      animation: isSignedIn ? 'none' : 'pulseGlow 2s infinite',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.02)',
                        background: 'linear-gradient(45deg, #f3e5ab 30%, #d4af37 90%)',
                        boxShadow: '0 12px 30px -8px #d4af37',
                      }
                    }}
                  >
                    Book Your Stay
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large" 
                    sx={{ 
                      ...heroActionButtonSx,
                      px: 6,
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.5)',
                      borderWidth: '2px',
                      backdropFilter: 'blur(4px)',
                      '&:hover': {
                        borderWidth: '2px',
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => {
                      const element = document.getElementById('amenities-section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Explore More
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => openAuthPanel('signup')}
                    sx={{ 
                      ...heroActionButtonSx,
                      px: 4,
                      color: '#d4af37',
                      borderColor: 'rgba(212, 175, 55, 0.6)',
                      borderWidth: '2px',
                      bgcolor: 'rgba(212, 175, 55, 0.08)',
                      '&:hover': {
                        borderWidth: '2px',
                        borderColor: '#d4af37',
                        bgcolor: 'rgba(212, 175, 55, 0.18)',
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              </Box>

              <Box
                sx={{
                  p: { xs: 4, md: 8 },
                  borderRadius: 8,
                  bgcolor: 'rgba(15, 23, 42, 0.45)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: '1px solid rgba(212, 175, 55, 0.22)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
                  width: '100%',
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box sx={{ maxWidth: 620, width: '100%', textAlign: 'center' }}>
                  <Chip
                    label={authMode === 'signup' ? 'Create your guest account' : 'Welcome back, guest'}
                    sx={{
                      mb: 3,
                      color: '#d4af37',
                      borderColor: 'rgba(212, 175, 55, 0.5)',
                      bgcolor: 'rgba(212, 175, 55, 0.12)',
                      fontWeight: 'bold',
                    }}
                    variant="outlined"
                  />

                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 900,
                      mb: 2,
                      fontSize: { xs: '2.3rem', md: '3.5rem' },
                      fontFamily: '"Playfair Display", serif',
                      background: 'linear-gradient(to right, #ffffff, #d4af37)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {authMode === 'signup' ? 'Sign up to begin your stay' : 'Sign in to continue your stay'}
                  </Typography>

                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.82)',
                      mb: 5,
                      lineHeight: 1.9,
                      fontSize: { xs: '1rem', md: '1.15rem' },
                    }}
                  >
                    {authMode === 'signup'
                      ? 'Create your guest profile to unlock room bookings, special offers, and a personalized hotel experience.'
                      : 'Sign in to your guest account to continue with bookings, reservations, and your saved stay details.'}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={markSignedIn}
                      sx={{
                        ...heroActionButtonSx,
                        px: 5,
                        background: 'linear-gradient(45deg, #d4af37 30%, #f3e5ab 90%)',
                        color: '#1a1a1a',
                        boxShadow: '0 8px 25px -8px #d4af37',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          background: 'linear-gradient(45deg, #f3e5ab 30%, #d4af37 90%)',
                        },
                      }}
                    >
                      {authMode === 'signup' ? 'Sign Up' : 'Sign In'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => openAuthPanel(authMode === 'signup' ? 'signin' : 'signup')}
                      sx={{
                        ...heroActionButtonSx,
                        px: 4,
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.45)',
                        borderWidth: '2px',
                        '&:hover': {
                          borderWidth: '2px',
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.12)',
                        },
                      }}
                    >
                      {authMode === 'signup' ? 'Sign In' : 'Sign Up'}
                    </Button>
                    <Button
                      variant="text"
                      onClick={closeAuthPanel}
                      sx={{
                        color: 'rgba(255,255,255,0.85)',
                        textTransform: 'none',
                        fontWeight: 600,
                        alignSelf: 'center',
                        '&:hover': {
                          color: '#d4af37',
                          bgcolor: 'transparent'
                        }
                      }}
                    >
                      Back to home
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

          </Box>

          {/* Quick Availability Search Bar */}
          <Box
            sx={{
              mt: { xs: 4, md: 6 },
              p: 2,
              borderRadius: 4,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              width: '100%',
              maxWidth: '1000px',
              animation: 'fadeInUp 1s ease-out forwards',
              animationDelay: '1.1s',
              opacity: 0,
            }}
          >
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  select
                  label="Location"
                  defaultValue="colombo"
                  variant="filled"
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ color: 'white' }}/></InputAdornment>,
                      sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' }, '&::before': { display: 'none' }, '&::after': { display: 'none' } }
                    },
                    inputLabel: { style: { color: 'rgba(255,255,255,0.8)' } },
                    select: { style: { color: 'white' } }
                  }}
                >
                  <MenuItem value="colombo">Colombo Branch</MenuItem>
                  <MenuItem value="kandy">Kandy Branch</MenuItem>
                  <MenuItem value="galle">Galle Branch</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Check-in Date"
                  variant="filled"
                  slotProps={{
                    inputLabel: { shrink: true, style: { color: 'rgba(255,255,255,0.8)' } },
                    input: { sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' }, '&::before': { display: 'none' }, '&::after': { display: 'none' } } }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Check-out Date"
                  variant="filled"
                  slotProps={{
                    inputLabel: { shrink: true, style: { color: 'rgba(255,255,255,0.8)' } },
                    input: { sx: { color: 'white', bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' }, '&::before': { display: 'none' }, '&::after': { display: 'none' } } }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={() => navigate('/rooms')}
                  sx={{ 
                    height: '56px',
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #d4af37 30%, #f3e5ab 90%)',
                    color: '#1a1a1a',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #f3e5ab 30%, #d4af37 90%)',
                      boxShadow: '0 6px 20px rgba(212, 175, 55, 0.6)',
                    }
                  }}
                >
                  Check Availability
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>

        {/* Video Control */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 20, md: 40 },
            left: { xs: 20, md: 40 },
            zIndex: 2,
            animation: 'fadeInUp 1s ease-out forwards',
            animationDelay: '1.3s',
            opacity: 0,
          }}
        >
          <IconButton 
            onClick={toggleVideo}
            sx={{ 
              color: 'white', 
              bgcolor: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Box>

        {/* Scroll Indicator */}
        <Box 
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'bounce 2s infinite, fadeInUp 1s ease-out forwards',
            animationDelay: '1.4s',
            opacity: 0,
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0) translateX(-50%)' },
              '40%': { transform: 'translateY(-20px) translateX(-50%)' },
              '60%': { transform: 'translateY(-10px) translateX(-50%)' },
            },
            cursor: 'pointer',
            zIndex: 2,
            color: 'rgba(255,255,255,0.7)',
            transition: 'color 0.3s ease',
            '&:hover': { color: 'white' },
            display: { xs: 'none', md: 'block' }
          }}
          onClick={() => {
            const element = document.getElementById('amenities-section');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 48 }} />
        </Box>

        {/* Floating Award Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 100, md: 'auto' },
            bottom: { xs: 'auto', md: 80 },
            right: { xs: 20, md: 40 },
            zIndex: 2,
            animation: 'fadeInUp 1s ease-out forwards',
            animationDelay: '1.6s',
            opacity: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            p: 2,
            borderRadius: 4,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}
        >
          <Box sx={{ bgcolor: 'rgba(212, 175, 55, 0.2)', p: 1, borderRadius: '50%' }}>
            <WorkspacePremiumIcon sx={{ color: '#d4af37', fontSize: 32 }} />
          </Box>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
              Travelers' Choice
            </Typography>
            <Typography variant="caption" sx={{ color: '#d4af37' }}>
              Best Hotel 2024
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Amenities Section */}
      <Container id="amenities-section" sx={{ py: 8 }}>
        <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 6 }}>
          Hotel Amenities
        </Typography>
        <Grid container spacing={4}>
          {amenities.map((item, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: '100%', textAlign: 'center', boxShadow: 0, bgcolor: 'transparent' }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{item.icon}</Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Branches */}
      <Box sx={{ bgcolor: '#f9f9f9', py: 8 }}>
        <Container>
          <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 6 }}>
            Our Locations
          </Typography>
          <Grid container spacing={4}>
            {[
              { name: 'Colombo', img: '/images/colombo.jpg' },
              { name: 'Kandy', img: '/images/kandy.jpg' },
              { name: 'Galle', img: '/images/galle.jpg' }
            ].map((branch, index) => (
              <Grid key={index} size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'scale(1.02)' } }}>
                  <Box 
                    sx={{ 
                      height: 200, 
                      bgcolor: 'grey.300',
                      backgroundImage: `url("${branch.img}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }} 
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {branch.name} Branch
                    </Typography>
                    <Typography color="text.secondary">
                      Experience the heart of {branch.name} with our prime location and exquisite services.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Culinary & Wellness Experiences Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}>
          Unforgettable Experiences
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>
          Immerse yourself in world-class dining, signature cocktails, and rejuvenating wellness.
        </Typography>
        <Grid container spacing={4}>
          {[
            { title: 'Fine Dining', img: '/images/fine_dining.jpg', desc: 'Savor exquisite dishes crafted by world-renowned chefs.' },
            { title: 'Rooftop Bar', img: '/images/rooftop_bar.jpg', desc: 'Enjoy signature cocktails with panoramic sunset views.' },
            { title: 'Spa & Wellness', img: '/images/spa_wellness.jpg', desc: 'Rejuvenate your body and mind with our holistic treatments.' }
          ].map((exp, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.4s', borderRadius: 4, overflow: 'hidden', '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}>
                <Box 
                  sx={{ 
                    height: 250, 
                    backgroundImage: `url("${exp.img}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} 
                />
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {exp.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {exp.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Special Offers Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}>
          Exclusive Offers
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>
          Indulge in our carefully curated packages for an unforgettable experience.
        </Typography>
        <Grid container spacing={4}>
          {[
            { title: 'Romantic Getaway', discount: '15% Off', img: '/images/romantic.jpg', desc: 'Enjoy a romantic weekend with complimentary champagne and late checkout.' },
            { title: 'Business Retreat', discount: 'Free Upgrades', img: '/images/business.jpg', desc: 'Seamlessly blend work and relaxation with premium Wi-Fi and lounge access.' }
          ].map((offer, index) => (
            <Grid key={index} size={{ xs: 12, md: 6 }}>
              <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, height: '100%', transition: '0.3s', '&:hover': { transform: 'scale(1.02)', boxShadow: 6 } }}>
                <Box 
                  sx={{ 
                    width: { xs: '100%', sm: 200 }, 
                    height: { xs: 200, sm: 'auto' },
                    backgroundImage: `url("${offer.img}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <Chip 
                    label={offer.discount} 
                    sx={{ position: 'absolute', top: 16, left: 16, bgcolor: '#d4af37', color: 'white', fontWeight: 'bold' }} 
                  />
                </Box>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {offer.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {offer.desc}
                  </Typography>
                  <Button variant="outlined" sx={{ alignSelf: 'flex-start', color: '#1a1a1a', borderColor: '#d4af37', '&:hover': { borderColor: '#1a1a1a', bgcolor: 'rgba(212, 175, 55, 0.1)' } }}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials */}
      <Box sx={{ bgcolor: '#1a1a1a', color: 'white', py: 8 }}>
        <Container>
          <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 6, color: '#d4af37' }}>
            What Our Guests Say
          </Typography>
          <Grid container spacing={4}>
            {[
              { name: 'Sarah Jenkins', role: 'Leisure Traveler', text: 'The infinity pool at the Colombo branch is absolutely breathtaking. Best hotel experience I have ever had!', rating: 5 },
              { name: 'Michael Chen', role: 'Business Executive', text: 'Impeccable service and world-class amenities. The staff went above and beyond to make my stay comfortable.', rating: 5 },
              { name: 'Emma Watson', role: 'Travel Blogger', text: 'A perfect blend of luxury and local culture. The spa treatments are highly recommended for anyone visiting.', rating: 4 }
            ].map((testimonial, index) => (
              <Grid key={index} size={{ xs: 12, md: 4 }}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Rating value={testimonial.rating} readOnly sx={{ color: '#d4af37', mb: 2 }} />
                    <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 3, opacity: 0.9 }}>
                      "{testimonial.text}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#d4af37', color: 'white' }}>{testimonial.name[0]}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{testimonial.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#d4af37' }}>{testimonial.role}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 6 }}>
          Frequently Asked Questions
        </Typography>
        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          <Grid size={{ xs: 12, md: 8 }}>
            {[
              { q: 'What is the check-in and check-out time?', a: 'Check-in is from 2:00 PM, and check-out is until 12:00 PM (noon). Early check-in or late check-out can be arranged based on availability.' },
              { q: 'Are pets allowed in the hotel?', a: 'Yes, we are a pet-friendly hotel! We welcome well-behaved pets in specific rooms. Please notify us in advance when booking.' },
              { q: 'Is there parking available?', a: 'Complimentary valet parking and secure underground parking are available for all our guests.' },
              { q: 'Do you offer airport transportation?', a: 'Yes, we provide luxury airport transfers. Please contact our concierge at least 24 hours prior to your arrival to arrange transportation.' }
            ].map((faq, index) => (
              <Box key={index} sx={{ mb: 3, p: 3, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#1a1a1a' }}>
                  {faq.q}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {faq.a}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Container>

      {/* Newsletter */}
      <Box sx={{ py: 8, bgcolor: '#f3e5ab' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
            Join Our Newsletter
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.7)', mb: 4 }}>
            Subscribe to receive exclusive offers, travel inspiration, and updates from our luxury hotels.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              fullWidth 
              placeholder="Your Email Address" 
              variant="outlined" 
              sx={{ bgcolor: 'white', borderRadius: 1 }}
            />
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                bgcolor: '#1a1a1a', 
                color: 'white', 
                px: 4, 
                py: { xs: 2, sm: 0 },
                '&:hover': { bgcolor: '#333' }
              }}
            >
              Subscribe
            </Button>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default Home;
