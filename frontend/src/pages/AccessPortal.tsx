import React, { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Container, MenuItem, Stack, TextField, Typography } from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type StaffRole = 'cleaning' | 'bar' | 'therapist' | 'waiter';

const staffRoles: { value: StaffRole; label: string }[] = [
  { value: 'cleaning', label: 'Cleaning Staff' },
  { value: 'bar', label: 'Bar Keeping Staff' },
  { value: 'therapist', label: 'Therapist Staff' },
  { value: 'waiter', label: 'Waiter Staff' },
];

const AccessPortal: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<StaffRole>('cleaning');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStaffSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password to sign in.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/staff/signin', { username: email.trim(), password, role });
      sessionStorage.setItem('staffRole', role);
      sessionStorage.setItem('staffId', String(response.data.staff_id || response.data.id));
      sessionStorage.setItem('staffProfile', JSON.stringify(response.data));
      navigate(`/staff/${role}`);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.error || 'Unable to connect to the staff authentication service.');
      } else {
        setError('Unable to connect to the staff authentication service.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        pt: { xs: 14, md: 18 }, 
        pb: { xs: 8, md: 12 }, 
        bgcolor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f1e8 0%, #e8e2d5 100%)'
      }}
    >
      <Container maxWidth="sm">
        <Card 
          sx={{ 
            borderRadius: 4, 
            border: '1px solid #e0d6bd', 
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ bgcolor: '#1a1a1a', py: 3, px: 4, color: 'white', textAlign: 'center' }}>
            <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', bgcolor: 'rgba(212, 175, 55, 0.15)', mb: 1 }}>
              <BadgeIcon sx={{ color: '#d4af37', fontSize: 32 }} />
            </Box>
            <Typography variant="overline" sx={{ display: 'block', color: '#d4af37', fontWeight: 700, letterSpacing: 2 }}>
              Paradise Resorts Team
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Playfair Display", Georgia, serif' }}>
              Staff Portal Login
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 4, md: 5 } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              Access your department workspace. Accounts are assigned and managed directly by hotel administration.
            </Typography>

            <Stack component="form" spacing={3} onSubmit={handleStaffSubmit}>
              <TextField 
                select 
                label="Staff Role / Department" 
                value={role} 
                onChange={(event) => setRole(event.target.value as StaffRole)}
                fullWidth
              >
                {staffRoles.map((staffRole) => (
                  <MenuItem key={staffRole.value} value={staffRole.value}>
                    {staffRole.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField 
                label="Username or Email" 
                type="text" 
                value={email} 
                onChange={(event) => setEmail(event.target.value)} 
                fullWidth
                required
              />

              <TextField 
                label="Password" 
                type="password" 
                value={password} 
                onChange={(event) => setPassword(event.target.value)} 
                fullWidth
                required
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                disabled={loading}
                startIcon={<LockOutlinedIcon />}
                sx={{ 
                  py: 1.5,
                  bgcolor: '#d4af37', 
                  color: '#1a1a1a',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '50px',
                  '&:hover': { bgcolor: '#b89528' },
                  boxShadow: '0 6px 20px rgba(212, 175, 55, 0.3)'
                }}
              >
                {loading ? 'Authenticating...' : 'Sign in to Staff Workspace'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AccessPortal;
