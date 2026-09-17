import React, { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Container, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
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
  const [staffMode, setStaffMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<StaffRole>('cleaning');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleStaffSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password) {
      setError('Enter an email and password to continue.');
      return;
    }

    try {
      if (staffMode === 'signup') {
        const response = await axios.post('http://localhost:5000/api/staff/signup', { username: email.trim(), password, role });
        setSuccess(response.data.message);
        setStaffMode('signin');
        setPassword('');
        return;
      }

      await axios.post('http://localhost:5000/api/staff/signin', { username: email.trim(), password, role });
      sessionStorage.setItem('staffRole', role);
      navigate(`/staff/${role}`);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.error || 'Unable to connect to the staff service.');
      } else {
        setError('Unable to connect to the staff service.');
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 5, md: 9 }, bgcolor: '#f5f1e8' }}>
      <Container maxWidth="md">
        <Typography variant="overline" sx={{ color: '#9a7620', fontWeight: 700, letterSpacing: 3 }}>
          Paradise Resorts Operations
        </Typography>
        <Typography variant="h2" sx={{ mt: 1, mb: 2, fontWeight: 800, color: '#20251f', fontFamily: 'Georgia, serif' }}>
          Choose your workspace
        </Typography>
        <Typography sx={{ mb: 5, color: '#5c625a', maxWidth: 650 }}>
          Sign in to the area that matches your role. Guests can continue booking from the main website.
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Card sx={{ flex: 1, border: '1px solid #e0d6bd', boxShadow: '0 12px 30px rgba(52, 47, 32, 0.08)' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <AdminPanelSettingsIcon sx={{ color: '#9a7620', fontSize: 36, mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Administrator</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Manage rooms, bookings, users, and system settings.</Typography>
              <Button fullWidth variant="contained" onClick={() => navigate('/admin')} sx={{ bgcolor: '#20251f', '&:hover': { bgcolor: '#3a4037' } }}>
                Login as admin
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, border: '1px solid #e0d6bd', boxShadow: '0 12px 30px rgba(52, 47, 32, 0.08)' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <BadgeIcon sx={{ color: '#9a7620', fontSize: 36, mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Staff workspace</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Create or access an account for your hotel team role.</Typography>
              <Stack component="form" spacing={2} onSubmit={handleStaffSubmit}>
                <TextField select label="Staff role" value={role} onChange={(event) => setRole(event.target.value as StaffRole)}>
                  {staffRoles.map((staffRole) => <MenuItem key={staffRole.value} value={staffRole.value}>{staffRole.label}</MenuItem>)}
                </TextField>
                <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}
                <Button type="submit" variant="contained" sx={{ bgcolor: '#9a7620', '&:hover': { bgcolor: '#765a15' } }}>
                  {staffMode === 'signin' ? 'Sign in as staff' : 'Create staff account'}
                </Button>
                <Divider />
                <Button type="button" onClick={() => { setStaffMode(staffMode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}>
                  {staffMode === 'signin' ? 'Need a staff account? Sign up' : 'Already registered? Sign in'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default AccessPortal;
