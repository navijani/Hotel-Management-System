import React from 'react';
import { Box, Container, Typography, Paper, Grid, Divider, Button, Avatar } from '@mui/material';
import { Person, Email, Phone, EventNote } from '@mui/icons-material';

const Profile: React.FC = () => {
  // Mock user data since we don't have a backend auth state yet
  const storedUser = sessionStorage.getItem('guestUser');
  const user = storedUser ? JSON.parse(storedUser) : {
    firstName: 'Guest',
    lastName: 'User',
    email: 'guest@example.com',
    phone: '+1 (555) 123-4567',
    joinDate: new Date().toLocaleDateString()
  };

  return (
    <Box sx={{ bgcolor: '#fdfbf7', minHeight: '80vh', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#1a1a2e', mb: 4, fontFamily: '"Playfair Display", serif' }}>
          My Profile
        </Typography>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <Avatar 
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: '#d4af37', fontSize: '2.5rem' }}
              >
                {user.firstName[0]}{user.lastName[0]}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Premium Member
              </Typography>
              <Button variant="outlined" fullWidth sx={{ borderRadius: 8, color: '#d4af37', borderColor: '#d4af37', textTransform: 'none', '&:hover': { borderColor: '#1a1a2e', color: '#1a1a2e', bgcolor: 'transparent' } }}>
                Edit Profile
              </Button>
              <Button variant="outlined" color="error" fullWidth sx={{ mt: 2, borderRadius: 8, textTransform: 'none', borderColor: 'error.main', '&:hover': { bgcolor: 'error.main', color: '#fff' } }} onClick={() => { sessionStorage.removeItem('guestAuthenticated'); sessionStorage.removeItem('guestSignedIn'); window.dispatchEvent(new Event('guestAuthChanged')); window.location.href = '/'; }}>
                Logout
              </Button>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1a1a2e' }}>
                Personal Information
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ color: '#d4af37', mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Email sx={{ color: '#d4af37', mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Email Address</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.email}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Phone sx={{ color: '#d4af37', mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.phone}</Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventNote sx={{ color: '#d4af37', mr: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Member Since</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.joinDate}</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, mt: 4, borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1a1a2e' }}>
                My Reservations
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 2, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                <Typography color="text.secondary">
                  You have no upcoming reservations.
                </Typography>
                <Button variant="text" sx={{ mt: 1, color: '#d4af37', textTransform: 'none', fontWeight: 600 }}>
                  Book a Room
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;
