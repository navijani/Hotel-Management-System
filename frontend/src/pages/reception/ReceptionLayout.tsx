import React from 'react';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { label: 'Front Desk', path: '/reception', match: (p: string) => p === '/reception' || p === '/reception/' },
  { label: 'New Booking', path: '/reception/new-booking', match: (p: string) => p.startsWith('/reception/new-booking') },
  { label: 'Bookings & Billing', path: '/reception/bookings', match: (p: string) => p.startsWith('/reception/bookings') },
];

const ReceptionLayout: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleSignOut = () => {
    ['hmsStaffSession', 'staffRole', 'staffId', 'staffProfile', 'staffToken'].forEach((key) => sessionStorage.removeItem(key));
    navigate('/portal', { replace: true });
  };

  return (
    <Box sx={{ bgcolor: '#fdfbf7', minHeight: '100vh', pb: 10 }}>
      <Paper
        elevation={0}
        sx={{
          pt: { xs: 6, md: 8 },
          pb: { xs: 9, md: 10 },
          color: '#fff',
          textAlign: 'center',
          borderRadius: 0,
          backgroundImage:
            'linear-gradient(rgba(26, 26, 26, 0.82), rgba(26, 26, 26, 0.92)), url(https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2000&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ color: '#d4af37', fontWeight: 700, letterSpacing: 3 }}>
            Paradise Resorts
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: '"Playfair Display", serif', color: '#d4af37' }}>
            Reception Desk
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            Bookings, check-in, guest charges, payments and checkout.
          </Typography>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ mt: -5, position: 'relative' }}>
        <Paper
          elevation={0}
          sx={{ mb: 4, p: { xs: 2, md: 2.5 }, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              {tabs.map((tab) => {
                const active = tab.match(pathname);
                return (
                  <Button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    variant={active ? 'contained' : 'outlined'}
                    sx={{
                      minWidth: { md: 180 },
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2,
                      bgcolor: active ? '#1a1a1a' : '#fff',
                      color: active ? '#fff' : '#1a1a1a',
                      borderColor: active ? '#1a1a1a' : 'rgba(0,0,0,0.12)',
                      '&:hover': { bgcolor: active ? '#d4af37' : '#f7f4ec', borderColor: '#d4af37', color: active ? '#fff' : '#1a1a1a' },
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Stack>
            <Button onClick={handleSignOut} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
              Sign out
            </Button>
          </Stack>
        </Paper>

        <Outlet />
      </Container>
    </Box>
  );
};

export default ReceptionLayout;
