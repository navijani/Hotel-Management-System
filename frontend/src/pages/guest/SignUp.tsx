import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Alert, Grid, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    identityNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [idError, setIdError] = useState('');
  const [checkingId, setCheckingId] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'identityNumber') {
      setIdError('');
    }
  };

  const handleCheckId = async (idVal: string) => {
    if (!idVal.trim()) return;
    try {
      setCheckingId(true);
      const res = await axios.get(`/api/guest/check-id?identity_number=${encodeURIComponent(idVal.trim())}`);
      if (res.data && res.data.available === false) {
        setIdError('ID number already in use. Please choose a different ID.');
      } else {
        setIdError('');
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setIdError(err.response.data.error);
      }
    } finally {
      setCheckingId(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { firstName, lastName, email, phone, identityNumber, password, confirmPassword } = formData;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !identityNumber.trim() || !password || !confirmPassword) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (idError) {
      setError(idError);
      return;
    }

    try {
      setLoading(true);
      // Double check ID before submission
      const checkRes = await axios.get(`/api/guest/check-id?identity_number=${encodeURIComponent(identityNumber.trim())}`);
      if (checkRes.data && checkRes.data.available === false) {
        setIdError('ID number already in use. Please choose a different ID.');
        setError('ID number already in use. Please choose a different ID.');
        setLoading(false);
        return;
      }

      await axios.post('/api/guest/signup', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
        identity_number: identityNumber.trim(),
        password: password
      });

      setSuccess('Account created successfully! Auto-signing you in...');

      // Auto sign in
      const signinRes = await axios.post('/api/guest/signin', {
        email: email.trim(),
        password: password
      });

      sessionStorage.setItem('guestAuthenticated', 'true');
      sessionStorage.setItem('guestSignedIn', 'true');
      sessionStorage.setItem('guestProfile', JSON.stringify(signinRes.data));
      window.dispatchEvent(new Event('guestAuthChanged'));
      window.dispatchEvent(new Event('authChange'));

      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err: any) {
      const serverMsg = err.response?.data?.error || 'Unable to create your account.';
      setError(serverMsg);
      if (serverMsg.toLowerCase().includes('id number')) {
        setIdError(serverMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#fdfbf7', minHeight: '80vh', display: 'flex', alignItems: 'center', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#1a1a2e', mb: 1, fontFamily: '"Playfair Display", serif', textAlign: 'center' }}>
            Create an Account
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Join Paradise Resorts for exclusive offers and faster booking.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSignUp} noValidate>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  autoFocus
                  value={formData.firstName}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              {/* ID Number Field mapping to identity_number */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="identityNumber"
                  label="ID Number (NIC / Passport)"
                  name="identityNumber"
                  placeholder="e.g. 199512345678"
                  value={formData.identityNumber}
                  onChange={handleChange}
                  onBlur={() => handleCheckId(formData.identityNumber)}
                  error={Boolean(idError)}
                  helperText={idError || (checkingId ? 'Verifying ID availability...' : 'Unique identity number')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  helperText="At least 8 characters"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>

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
              {loading ? <CircularProgress size={26} color="inherit" /> : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account? <Box component="span" onClick={() => navigate('/signin')} sx={{ color: '#d4af37', fontWeight: 600, cursor: 'pointer' }}>Sign In</Box>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignUp;
