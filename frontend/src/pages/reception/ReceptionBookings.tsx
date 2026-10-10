import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, InputAdornment, MenuItem, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { checkInBooking, fetchDeskBookings } from '../../api/reception';
import type { DeskBooking } from '../../api/reception';
import { currencyFormatter, darkButtonSx, formatDate, headCellSx, outlineButtonSx, StatusChip, surfaceSx } from './shared';

const statusOptions = ['', 'Booked', 'Checked-In', 'Checked-Out', 'Cancelled'];

const ReceptionBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<DeskBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBookings(await fetchDeskBookings({ status, q: search.trim() }));
    } catch (error) {
      setAlert({ severity: 'error', message: error instanceof Error ? error.message : 'Unable to load bookings.' });
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  // Re-query shortly after the receptionist stops typing.
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 300);
    return () => window.clearTimeout(timer);
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

  return (
    <Paper sx={{ p: 3, ...surfaceSx }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' }, mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Bookings & billing</Typography>
          <Typography variant="body2" color="text.secondary">Search a guest, check them in, or open their bill.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            size="small"
            placeholder="Guest, ID, room or booking #"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            sx={{ minWidth: 260 }}
          />
          <TextField select size="small" label="Status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 150 }}>
            {statusOptions.map((option) => (
              <MenuItem key={option || 'all'} value={option}>{option || 'All statuses'}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      {alert && <Alert severity={alert.severity} sx={{ mb: 2 }} onClose={() => setAlert(null)}>{alert.message}</Alert>}

      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={headCellSx}>Booking</TableCell>
              <TableCell sx={headCellSx}>Guest</TableCell>
              <TableCell sx={headCellSx}>Room</TableCell>
              <TableCell sx={headCellSx}>Stay</TableCell>
              <TableCell sx={headCellSx}>Status</TableCell>
              <TableCell sx={headCellSx}>Balance</TableCell>
              <TableCell sx={headCellSx} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}><CircularProgress size={28} /></TableCell></TableRow>
            )}
            {!loading && bookings.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>No bookings match.</TableCell></TableRow>
            )}
            {!loading && bookings.map((booking) => (
              <TableRow key={booking.booking_id} hover>
                <TableCell sx={{ fontWeight: 800 }}>#{booking.booking_id}</TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 700 }}>{booking.guest_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{booking.identification_no}</Typography>
                </TableCell>
                <TableCell>
                  {booking.room_number}
                  <Typography variant="caption" component="div" color="text.secondary">{booking.room_type}</Typography>
                </TableCell>
                <TableCell>
                  {formatDate(booking.check_in_date)}
                  <Typography variant="caption" component="div" color="text.secondary">to {formatDate(booking.check_out_date)}</Typography>
                </TableCell>
                <TableCell><StatusChip status={booking.booking_status} /></TableCell>
                <TableCell sx={{ fontWeight: 700, color: booking.booking_status === 'Cancelled' || booking.outstanding_balance === 0 ? 'text.secondary' : 'error.main' }}>
                  {currencyFormatter.format(booking.outstanding_balance)}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                    {booking.booking_status === 'Booked' && (
                      <Button size="small" variant="contained" disabled={busyId === booking.booking_id} onClick={() => handleCheckIn(booking)} sx={darkButtonSx}>
                        Check in
                      </Button>
                    )}
                    <Button size="small" variant="outlined" onClick={() => navigate(`/reception/bookings/${booking.booking_id}`)} sx={outlineButtonSx}>
                      Billing
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ReceptionBookings;
