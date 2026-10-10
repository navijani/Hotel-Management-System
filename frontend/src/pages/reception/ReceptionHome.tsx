import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { checkInBooking, fetchOverview } from '../../api/reception';
import type { DeskBooking, DeskOverview } from '../../api/reception';
import { currencyFormatter, darkButtonSx, featureCardSx, formatDate, headCellSx, outlineButtonSx, surfaceSx } from './shared';

const roomStatusColor: Record<string, string> = {
  Available: '#10b981',
  Occupied: '#ef4444',
  Reserved: '#3b82f6',
  Cleaning: '#f59e0b',
  Maintenance: '#f59e0b',
};

const ReceptionHome: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<DeskOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setOverview(await fetchOverview());
    } catch (error) {
      setAlert({ severity: 'error', message: error instanceof Error ? error.message : 'Unable to load the front desk.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCheckIn = async (booking: DeskBooking) => {
    setBusyId(booking.booking_id);
    try {
      const result = await checkInBooking(booking.booking_id);
      setAlert({ severity: 'success', message: result.message });
      await load();
    } catch (error) {
      setAlert({ severity: 'error', message: error instanceof Error ? error.message : 'Unable to check in.' });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  const counts = overview?.counts;
  const stats = [
    { label: 'Arrivals to check in', value: String(counts?.arrivals_due ?? 0), color: '#1a1a2e' },
    { label: 'Guests in house', value: String(counts?.in_house ?? 0), color: 'success.main' },
    { label: 'Departures due', value: String(counts?.departures_due ?? 0), color: '#9a7620' },
    { label: 'Outstanding dues', value: currencyFormatter.format(counts?.outstanding ?? 0), color: 'error.main' },
  ];

  const renderTable = (title: string, subtitle: string, rows: DeskBooking[], mode: 'arrival' | 'departure') => (
    <Paper sx={{ p: 3, ...surfaceSx }}>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{subtitle}</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={headCellSx}>Guest</TableCell>
              <TableCell sx={headCellSx}>Room</TableCell>
              <TableCell sx={headCellSx}>{mode === 'arrival' ? 'Arrival' : 'Departure'}</TableCell>
              {mode === 'departure' && <TableCell sx={headCellSx}>Balance</TableCell>}
              <TableCell sx={headCellSx} align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>Nothing waiting.</TableCell></TableRow>
            )}
            {rows.map((booking) => (
              <TableRow key={booking.booking_id} hover>
                <TableCell>
                  <Typography sx={{ fontWeight: 700 }}>{booking.guest_name}</Typography>
                  <Typography variant="caption" color="text.secondary">#{booking.booking_id}</Typography>
                </TableCell>
                <TableCell>{booking.room_number}</TableCell>
                <TableCell>{formatDate(mode === 'arrival' ? booking.check_in_date : booking.check_out_date)}</TableCell>
                {mode === 'departure' && (
                  <TableCell sx={{ fontWeight: 700, color: booking.outstanding_balance > 0 ? 'error.main' : 'success.main' }}>
                    {currencyFormatter.format(booking.outstanding_balance)}
                  </TableCell>
                )}
                <TableCell align="right">
                  {mode === 'arrival' ? (
                    <Button size="small" variant="contained" disabled={busyId === booking.booking_id} onClick={() => handleCheckIn(booking)} sx={darkButtonSx}>
                      {busyId === booking.booking_id ? 'Checking in...' : 'Check in'}
                    </Button>
                  ) : (
                    <Button size="small" variant="outlined" onClick={() => navigate(`/reception/bookings/${booking.booking_id}`)} sx={outlineButtonSx}>
                      Billing & checkout
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box>
      {alert && <Alert severity={alert.severity} sx={{ mb: 3 }} onClose={() => setAlert(null)}>{alert.message}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card elevation={0} sx={featureCardSx}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>{stat.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: stat.color }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mb: 3, ...surfaceSx }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Room status</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
              {(overview?.room_status ?? []).map((entry) => (
                <Chip key={entry.status} label={`${entry.status}: ${entry.count}`} sx={{ bgcolor: roomStatusColor[entry.status] ?? '#64748b', color: '#fff', fontWeight: 600 }} />
              ))}
            </Stack>
          </Box>
          <Button variant="contained" onClick={() => navigate('/reception/new-booking')} sx={{ ...darkButtonSx, px: 4, py: 1.3 }}>
            Make a new booking
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>{renderTable('Arrivals', 'Booked guests due today or earlier.', overview?.arrivals ?? [], 'arrival')}</Grid>
        <Grid size={{ xs: 12, lg: 6 }}>{renderTable('Departures', 'In-house guests whose stay ends today or earlier.', overview?.departures ?? [], 'departure')}</Grid>
      </Grid>
    </Box>
  );
};

export default ReceptionHome;
