import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import type { Room } from '../../types';

// Mock data for rooms
const mockRooms: Room[] = [
  { room_id: 1, branch_id: 1, room_type_id: 1, room_number: '101', current_status: 'Available' },
  { room_id: 2, branch_id: 1, room_type_id: 1, room_number: '102', current_status: 'Occupied' },
  { room_id: 3, branch_id: 1, room_type_id: 1, room_number: '103', current_status: 'Reserved' },
  { room_id: 4, branch_id: 1, room_type_id: 1, room_number: '104', current_status: 'Cleaning' },
  { room_id: 5, branch_id: 1, room_type_id: 2, room_number: '201', current_status: 'Available' },
  { room_id: 6, branch_id: 1, room_type_id: 2, room_number: '202', current_status: 'Occupied' },
  { room_id: 7, branch_id: 1, room_type_id: 3, room_number: '301', current_status: 'Reserved' },
  { room_id: 8, branch_id: 1, room_type_id: 3, room_number: '302', current_status: 'Available' },
];

const getStatusColor = (status: Room['current_status']) => {
  switch (status) {
    case 'Available': return 'success.main';
    case 'Occupied': return 'error.main';
    case 'Reserved': return 'info.main';
    case 'Cleaning':
    case 'Maintenance': return 'warning.main';
    default: return 'grey.500';
  }
};

const ReceptionDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reception Dashboard
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip label="Available" sx={{ bgcolor: 'success.main', color: 'white' }} />
        <Chip label="Occupied" sx={{ bgcolor: 'error.main', color: 'white' }} />
        <Chip label="Reserved" sx={{ bgcolor: 'info.main', color: 'white' }} />
        <Chip label="Cleaning / Maintenance" sx={{ bgcolor: 'warning.main', color: 'black' }} />
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>Room Status Overview</Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
        {mockRooms.map((room) => (
          <Paper 
            key={room.room_id}
            elevation={2} 
            sx={{ 
              p: 2, 
              borderLeft: '6px solid', 
              borderColor: getStatusColor(room.current_status),
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {room.room_number}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {room.room_type_id === 1 ? 'Single' : room.room_type_id === 2 ? 'Double' : 'Suite'}
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              sx={{ color: getStatusColor(room.current_status), fontWeight: 'bold' }}
            >
              {room.current_status}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default ReceptionDashboard;
