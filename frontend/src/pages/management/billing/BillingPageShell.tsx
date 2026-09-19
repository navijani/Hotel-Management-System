import React from 'react';
import { Box, Button, Card, CardContent, Container, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

type BillingPageKey = 'overview' | 'invoice' | 'revenue';

const routeMap: Record<BillingPageKey, string> = {
  overview: '/admin/dashboard/management/billing',
  invoice: '/admin/dashboard/management/billing/invoice',
  revenue: '/admin/dashboard/management/billing/revenue',
};

const tabLabels: Array<{ key: BillingPageKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'invoice', label: 'Invoice & Checkout' },
  { key: 'revenue', label: 'Revenue Report' },
];

interface BillingPageShellProps {
  title: string;
  subtitle: string;
  activePage: BillingPageKey;
  children: React.ReactNode;
}

const BillingPageShell: React.FC<BillingPageShellProps> = ({ title, subtitle, activePage, children }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#fdfbf7', minHeight: '100vh', pb: 10 }}>
      <Paper
        elevation={0}
        sx={{
          pt: { xs: 15, md: 20 },
          pb: { xs: 8, md: 10 },
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
          borderRadius: 0,
          backgroundImage: 'linear-gradient(rgba(26, 26, 26, 0.82), rgba(26, 26, 26, 0.92)), url(https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2000&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontFamily: '"Playfair Display", serif',
              color: '#d4af37',
            }}
          >
            {title}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, color: 'rgba(255,255,255,0.8)', maxWidth: 900, mx: 'auto' }}>
            {subtitle}
          </Typography>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ mt: -5, position: 'relative' }}>
        <Card
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2.5, justifyContent: 'space-between', alignItems: { xs: 'stretch', lg: 'center' } }}>
            <Box>
              <Typography variant="overline" sx={{ color: '#9a7620', fontWeight: 700, letterSpacing: 2 }}>
                Billing navigation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Switch between overview, invoice handling, and revenue reporting.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', lg: 'auto' } }}>
              {tabLabels.map((tab) => {
                const isActive = tab.key === activePage;

                return (
                  <Button
                    key={tab.key}
                    onClick={() => navigate(routeMap[tab.key])}
                    variant={isActive ? 'contained' : 'outlined'}
                    sx={{
                      minWidth: { xs: '100%', md: 180 },
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2,
                      bgcolor: isActive ? '#1a1a1a' : '#fff',
                      color: isActive ? '#fff' : '#1a1a1a',
                      borderColor: isActive ? '#1a1a1a' : 'rgba(0,0,0,0.12)',
                      '&:hover': {
                        bgcolor: isActive ? '#d4af37' : '#f7f4ec',
                        borderColor: '#d4af37',
                        color: isActive ? '#fff' : '#1a1a1a',
                      },
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        {children}
      </Container>
    </Box>
  );
};

export default BillingPageShell;