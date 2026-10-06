import React, { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/admin/signin', { username: email.trim(), password });

      if (res.status === 200 || res.data?.message) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        sessionStorage.setItem('hmsAdminSignedIn', 'true');
        navigate('/system-admin');
      }
    } catch (requestError: any) {
      setError(
        axios.isAxiosError(requestError)
          ? requestError.response?.data?.error || 'Invalid username or password.'
          : 'Unable to sign in. Please check backend server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3, bgcolor: '#1e1e2f' }}>
      <Container maxWidth="xs">
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="overline" sx={{ color: '#4facfe', fontWeight: 700, letterSpacing: 2 }}>
                RESTRICTED ACCESS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e1e2f', mt: 0.5 }}>
                Admin Login
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Paradise Resorts Administration Panel
              </Typography>
            </Box>

            <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
              <TextField 
                label="Username / Email" 
                type="email" 
                value={email} 
                onChange={(event) => setEmail(event.target.value)} 
                autoComplete="username"
                required
                fullWidth
              />
              <TextField 
                label="Password" 
                type="password" 
                value={password} 
                onChange={(event) => setPassword(event.target.value)} 
                autoComplete="current-password"
                required
                fullWidth
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
                sx={{ bgcolor: '#1e1e2f', color: '#fff', py: 1.2, fontWeight: 'bold', '&:hover': { bgcolor: '#4facfe' } }}
              >
                {loading ? 'Signing in...' : 'Login to Admin Dashboard'}
              </Button>
              <Button type="button" size="small" color="inherit" onClick={() => navigate('/portal')}>
                Back to access portal
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminLogin;
