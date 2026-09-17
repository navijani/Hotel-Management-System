import React from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';

const Bookings: React.FC = () => {
  const mockBookings = [
    { id: 'BKG-001', guest: 'Alice Wonderland', room: '101', checkIn: '2023-10-01', checkOut: '2023-10-05', status: 'Confirmed' },
    { id: 'BKG-002', guest: 'Bob Builder', room: '102', checkIn: '2023-10-02', checkOut: '2023-10-03', status: 'Checked In' },
    { id: 'BKG-003', guest: 'Charlie Chaplin', room: '201', checkIn: '2023-10-10', checkOut: '2023-10-15', status: 'Pending' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e' }}>
          Bookings
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: '#4facfe', borderRadius: 2 }}>
          New Booking
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Booking ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Guest Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Room</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Check In</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Check Out</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', align: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockBookings.map((b) => (
              <TableRow key={b.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{b.id}</TableCell>
                <TableCell>{b.guest}</TableCell>
                <TableCell>{b.room}</TableCell>
                <TableCell>{b.checkIn}</TableCell>
                <TableCell>{b.checkOut}</TableCell>
                <TableCell>
                  <Chip 
                    label={b.status} 
                    color={b.status === 'Confirmed' ? 'primary' : b.status === 'Checked In' ? 'success' : 'warning'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" color="info"><ViewIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Bookings;
