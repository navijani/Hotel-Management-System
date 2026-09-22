import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Chip, Grid, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, FormControlLabel } from '@mui/material';
import { fetchBillingWorkspace } from '../../../api/billing';
import type { BillingWorkspace } from '../../../types';
import BillingPageShell from './BillingPageShell';

const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  maximumFractionDigits: 0,
});

const revenueCardSx = {
  borderRadius: 3,
  border: '1px solid rgba(0,0,0,0.05)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 18px 36px rgba(0,0,0,0.08)',
  },
} as const;

const BillingRevenue: React.FC = () => {
  const [workspace, setWorkspace] = useState<BillingWorkspace | null>(null);
  const [unpaidOnly, setUnpaidOnly] = useState(true);

  useEffect(() => {
    void (async () => {
      setWorkspace(await fetchBillingWorkspace());
    })();
  }, []);

  const bookings = workspace?.bookings ?? [];
  const monthlyRevenue = workspace?.monthly_revenue ?? [];

  const totals = useMemo(
    () => ({
      room: monthlyRevenue.reduce((sum, branch) => sum + branch.room_charges, 0),
      service: monthlyRevenue.reduce((sum, branch) => sum + branch.service_charges, 0),
      revenue: monthlyRevenue.reduce((sum, branch) => sum + branch.total_revenue, 0),
      outstanding: bookings.reduce((sum, booking) => sum + booking.outstanding_balance, 0),
    }),
    [bookings, monthlyRevenue],
  );

  return (
    <BillingPageShell
      activePage="revenue"
      title="Revenue Report"
      subtitle="See branch-level monthly revenue alongside the guest billing summary for unpaid balances."
    >
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={revenueCardSx}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                Total revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                {currencyFormatter.format(totals.revenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={revenueCardSx}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                Room charges
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#4facfe' }}>
                {currencyFormatter.format(totals.room)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={revenueCardSx}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                Service charges
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'success.main' }}>
                {currencyFormatter.format(totals.service)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={revenueCardSx}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                Outstanding dues
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'error.main' }}>
                {currencyFormatter.format(totals.outstanding)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Guest billing summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filter down to bookings that still have unpaid balances.
            </Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={unpaidOnly} onChange={(event) => setUnpaidOnly(event.target.checked)} />}
            label="Unpaid only"
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Guest</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total paid</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Outstanding</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(unpaidOnly ? bookings.filter((booking) => booking.outstanding_balance > 0) : bookings).map((booking) => (
                <TableRow key={booking.booking_id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{booking.guest_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {booking.identification_no}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {booking.room_number}
                    <Typography variant="caption" component="div" color="text.secondary">
                      {booking.room_type}
                    </Typography>
                  </TableCell>
                  <TableCell>{booking.branch}</TableCell>
                  <TableCell>{currencyFormatter.format(booking.total_paid)}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: booking.outstanding_balance === 0 ? 'success.main' : 'error.main' }}>{currencyFormatter.format(booking.outstanding_balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {monthlyRevenue.map((branch) => (
          <Grid key={branch.branch} size={{ xs: 12, md: 4 }}>
            <Card elevation={0} sx={{ ...revenueCardSx, height: '100%' }}>
              <CardContent>
                <Typography variant="overline" sx={{ letterSpacing: 1, color: 'text.secondary' }}>
                  {branch.branch}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  {currencyFormatter.format(branch.total_revenue)}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Room charges</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{currencyFormatter.format(branch.room_charges)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Service charges</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{currencyFormatter.format(branch.service_charges)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Bookings</Typography>
                  <Chip size="small" label={branch.booking_count} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Branch revenue table
        </Typography>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Room charges</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Service charges</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyRevenue.map((branch) => (
                <TableRow key={branch.branch}>
                  <TableCell sx={{ fontWeight: 700 }}>{branch.branch}</TableCell>
                  <TableCell>{currencyFormatter.format(branch.room_charges)}</TableCell>
                  <TableCell>{currencyFormatter.format(branch.service_charges)}</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{currencyFormatter.format(branch.total_revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </BillingPageShell>
  );
};

export default BillingRevenue;