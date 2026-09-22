import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography } from '@mui/material';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminSignIn = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/admin/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Invalid administrator credentials.');
      window.sessionStorage.setItem('hmsAdminSignedIn', 'true');
      navigate('/admin', { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f5f6f8', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 440 }} elevation={4}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Typography variant="overline" color="primary">HMS administration</Typography>
          <Typography variant="h4" sx={{ mb: 1 }}>Administrator sign in</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Use your administrator account to manage the hotel system.</Typography>
          <Stack spacing={2}>
            <TextField label="Username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" fullWidth />
            <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" fullWidth />
            {error && <Alert severity="error">{error}</Alert>}
            <Button variant="contained" size="large" onClick={handleSubmit} disabled={loading || !username || !password}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminSignIn;
