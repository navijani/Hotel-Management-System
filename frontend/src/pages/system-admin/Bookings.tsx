import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem,
  FormControl, InputLabel, Grid, Divider
} from '@mui/material';
import { Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

interface Booking {
  booking_id: number;
  guest_id?: number | null;
  guest_name?: string;
  email?: string;
  phone_number?: string;
  identification_no?: string;
  room_number?: string;
  room_type?: string;
  room_daily_rate?: number;
  room_total?: number;
  net_total?: number;
  check_in_at?: string;
  check_out_at?: string;
  nights?: number;
  booking_status: string;
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/bookings');
      setBookings(res.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (booking: Booking) => {
    setSelectedBooking(booking);
    setViewOpen(true);

    // Keep the dialog useful for older booking records/API responses that do
    // not contain the guest contact fields yet. The profile endpoint is the
    // source of truth for the guest's current email and phone number.
    if (booking.guest_id && (!booking.email || !booking.phone_number)) {
      try {
        const response = await axios.get(`/api/guest/${booking.guest_id}/profile`);
        const profile = response.data;
        setSelectedBooking((current) => current?.booking_id === booking.booking_id
          ? {
              ...current,
              email: current.email || profile.email || '',
              phone_number: current.phone_number || profile.phone_number || '',
            }
          : current);
      } catch (error) {
        console.error('Failed to load guest contact details:', error);
      }
    }
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditStatus(booking.booking_status);
    setEditOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedBooking) return;
    try {
      await axios.put(`/api/bookings/${selectedBooking.booking_id}/status`, {
        status: editStatus
      });
      fetchBookings();
      setEditOpen(false);
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Booked': return 'primary';
      case 'Checked-In': return 'success';
      case 'Checked-Out': return 'default';
      case 'Cancelled': return 'error';
      default: return 'warning';
    }
  };

  const formatDate = (date?: string) => date && dayjs(date).isValid()
    ? dayjs(date).format('MMM DD, YYYY')
    : 'N/A';

  const formatCurrency = (amount?: number) => `LKR ${Number(amount || 0).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, bgcolor: '#fff', p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.5, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Bookings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage all customer reservations.
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ bgcolor: 'rgba(248, 249, 250, 0.8)', backdropFilter: 'blur(8px)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, py: 3 }}>Booking Ref</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>Guest Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>Room Number</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>Check In</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>Check Out</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, align: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={30} sx={{ my: 4, color: '#4facfe' }} /></TableCell></TableRow>
            ) : bookings.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No customer bookings found.</Typography></TableCell></TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={b.booking_id} hover sx={{ transition: 'background-color 0.2s' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#1e293b' }}>
                    #{b.booking_id}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>
                    {b.guest_name || 'Guest'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>
                    {b.room_number || 'TBD'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatDate(b.check_in_at)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatDate(b.check_out_at)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={b.booking_status}
                      color={getStatusColor(b.booking_status) as any}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleView(b)} sx={{ color: '#4facfe', bgcolor: 'rgba(79, 172, 254, 0.1)', '&:hover': { bgcolor: 'rgba(79, 172, 254, 0.2)' }, mr: 1 }}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEdit(b)} sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.1)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Booking Details</DialogTitle>
        <DialogContent dividers>
          {selectedBooking && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Guest Information</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2"><strong>Name:</strong> {selectedBooking.guest_name || 'Not available'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2"><strong>Email:</strong> {selectedBooking.email || 'Not available'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2"><strong>Phone:</strong> {selectedBooking.phone_number || 'Not available'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2"><strong>ID:</strong> {selectedBooking.identification_no || 'Not available'}</Typography>
              </Grid>

              <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">Room Details</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2"><strong>Room:</strong> {selectedBooking.room_number || 'TBD'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2"><strong>Type:</strong> {selectedBooking.room_type || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2"><strong>Check-In:</strong> {formatDate(selectedBooking.check_in_at)}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2"><strong>Check-Out:</strong> {formatDate(selectedBooking.check_out_at)}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2">
                  <strong>Total Nights:</strong> {Math.max(1, Number(selectedBooking.nights || 0))}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2">
                  <strong>Total Price:</strong> {formatCurrency(selectedBooking.net_total ?? selectedBooking.room_total)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Update Status</DialogTitle>
        <DialogContent dividers>
          {selectedBooking && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editStatus}
                label="Status"
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <MenuItem value="Booked">Booked</MenuItem>
                <MenuItem value="Checked-In">Checked-In</MenuItem>
                <MenuItem value="Checked-Out">Checked-Out</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveStatus}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookings;
