import React, { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/signin', { username: email.trim(), password });
      sessionStorage.setItem('adminAuthenticated', 'true');
      navigate('/system-admin');
    } catch (requestError) {
      setError(axios.isAxiosError(requestError) ? requestError.response?.data?.error || 'Unable to sign in.' : 'Unable to sign in.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3, bgcolor: '#20251f' }}>
      <Container maxWidth="xs">
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="overline" sx={{ color: '#9a7620', fontWeight: 700, letterSpacing: 2 }}>Restricted access</Typography>
            <Typography variant="h4" sx={{ mt: 1, mb: 1, fontWeight: 800, fontFamily: 'Georgia, serif' }}>Administrator login</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>This area is reserved for hotel administrators.</Typography>
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              <TextField label="Username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
              <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" variant="contained" sx={{ bgcolor: '#20251f', '&:hover': { bgcolor: '#3a4037' } }}>Login</Button>
              <Button type="button" onClick={() => navigate('/portal')}>Back to access portal</Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminLogin;
