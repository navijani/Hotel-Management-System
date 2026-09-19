import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchBillingWorkspace } from '../../../api/billing';
import type { BillingWorkspace } from '../../../types';
import BillingPageShell from './BillingPageShell';

const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  maximumFractionDigits: 0,
});

const featureCardSx = {
  height: '100%',
  borderRadius: 3,
  border: '1px solid rgba(0,0,0,0.05)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
  },
} as const;

const BillingOverview: React.FC = () => {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<BillingWorkspace | null>(null);

  useEffect(() => {
    void (async () => {
      setWorkspace(await fetchBillingWorkspace());
    })();
  }, []);

  const metrics = useMemo(() => {
    const bookings = workspace?.bookings ?? [];
    return {
      collected: bookings.reduce((sum, booking) => sum + booking.total_paid, 0),
      outstanding: bookings.reduce((sum, booking) => sum + booking.outstanding_balance, 0),
      settled: bookings.filter((booking) => booking.outstanding_balance === 0).length,
      active: bookings.filter((booking) => booking.booking_status !== 'Checked-Out').length,
    };
  }, [workspace]);

  return (
    <BillingPageShell
      activePage="overview"
      title="Billing Overview"
      subtitle="A lighter starting point for billing tasks, with quick access to invoices and revenue reporting."
    >
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={featureCardSx}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                Collected revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#1a1a1a' }}>
                {currencyFormatter.format(metrics.collected)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={featureCardSx}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                Outstanding dues
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'error.main' }}>
                {currencyFormatter.format(metrics.outstanding)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={featureCardSx}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                Settled bookings
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'success.main' }}>
                {metrics.settled}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={featureCardSx}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                Active bookings
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#1a1a2e' }}>
                {metrics.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Quick actions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Jump straight to the part of billing you need.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button variant="contained" sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#d4af37' } }} onClick={() => navigate('/admin/dashboard/management/billing/invoice')}>
                Open invoice & checkout
              </Button>
              <Button variant="outlined" sx={{ borderColor: '#1a1a1a', color: '#1a1a1a', '&:hover': { borderColor: '#d4af37', color: '#d4af37', bgcolor: 'rgba(212,175,55,0.08)' } }} onClick={() => navigate('/admin/dashboard/management/billing/revenue')}>
                Open revenue report
              </Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Status snapshot
            </Typography>
            <Stack spacing={1.2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Total collected</Typography>
                <Typography sx={{ fontWeight: 700 }}>{currencyFormatter.format(metrics.collected)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Total outstanding</Typography>
                <Typography sx={{ fontWeight: 700, color: 'error.main' }}>{currencyFormatter.format(metrics.outstanding)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Ready to settle</Typography>
                <Chip size="small" label={`${metrics.settled} paid in full`} color="success" />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Outstanding bookings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A quick glance at bookings that still need attention.
            </Typography>
          </Box>
          <Button size="small" onClick={() => navigate('/admin/dashboard/management/billing/invoice')}>
            Open invoice page
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Guest</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Outstanding</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(workspace?.bookings ?? []).filter((booking) => booking.outstanding_balance > 0).slice(0, 5).map((booking) => (
                <TableRow key={booking.booking_id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{booking.guest_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {booking.identification_no}
                    </Typography>
                  </TableCell>
                  <TableCell>{booking.room_number}</TableCell>
                  <TableCell>{booking.branch}</TableCell>
                  <TableCell>{currencyFormatter.format(booking.total_paid)}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'error.main' }}>{currencyFormatter.format(booking.outstanding_balance)}</TableCell>
                  <TableCell><Chip size="small" label="Outstanding" color="warning" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </BillingPageShell>
  );
};

export default BillingOverview;