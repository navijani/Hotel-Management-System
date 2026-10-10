import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/guest/signin', {
        email: email.trim(),
        password: password,
      });

      setSuccess('Login successful! Redirecting...');
      sessionStorage.setItem('guestAuthenticated', 'true');
      sessionStorage.setItem('guestSignedIn', 'true');
      sessionStorage.setItem('guestProfile', JSON.stringify(res.data));
      window.dispatchEvent(new Event('guestAuthChanged'));
      window.dispatchEvent(new Event('authChange'));

<<<<<<< HEAD
=======
      // Check if there is a pending booking intent saved before sign-in
      const pendingRaw = sessionStorage.getItem('pendingBookingIntent');
      if (pendingRaw) {
        sessionStorage.removeItem('pendingBookingIntent');
        try {
          const intent = JSON.parse(pendingRaw);
          if (intent.room_id) {
            const roomRes = await axios.get(`/api/rooms/${intent.room_id}`);
            const roomData = roomRes.data;
            const discountVal = intent.discount || roomData.discount || 0;
            const originalPrice = Number(roomData.price_per_night || 150);
            const finalPrice = discountVal > 0 ? Math.round(originalPrice * (1 - discountVal / 100)) : originalPrice;
            setTimeout(() => {
              navigate('/book', {
                state: {
                  room: {
                    RoomID: roomData.room_id,
                    RoomNumber: roomData.room_number || `Room ${roomData.room_id}`,
                    RoomTypeID: roomData.type || 'Special Offer Room',
                    Price: finalPrice,
                    OriginalPrice: originalPrice,
                    BedType: roomData.bed_type || 'Premium Bedding',
                    image: roomData.image || (intent.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop'),
                  },
                  roomId: intent.room_id,
                  roomType: roomData.type || 'Special Offer Room',
                }
              });
            }, 800);
            return;
          }
        } catch (_) {
          // fallback to profile if room fetch fails
        }
      }

>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err: any) {
      const serverError = err.response?.data?.error || 'Unable to sign in. Please check your credentials.';
      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#fdfbf7', minHeight: '80vh', display: 'flex', alignItems: 'center', py: 10 }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: { xs: 4, md: 5 }, borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#1a1a2e', mb: 1, fontFamily: '"Playfair Display", serif', textAlign: 'center' }}>
            Welcome Back
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Sign in to access your reservations and exclusive offers.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSignIn} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 4,
                mb: 2,
                bgcolor: '#d4af37',
                color: 'white',
                py: 1.5,
                borderRadius: 8,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 8px 20px -6px rgba(212, 175, 55, 0.5)',
                '&:hover': { bgcolor: '#c5a028' }
              }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account? <Box component="span" onClick={() => navigate('/signup')} sx={{ color: '#d4af37', fontWeight: 600, cursor: 'pointer' }}>Sign Up</Box>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignIn;
