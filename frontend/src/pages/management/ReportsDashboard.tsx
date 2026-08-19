import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReportsDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Management Dashboard
      </Typography>
      
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' } }}>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Room Occupancy</Typography>
          <Typography variant="h3" color="primary.main">78%</Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Monthly Revenue</Typography>
          <Typography variant="h3" color="success.main">LKR 4.2M</Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Pending Bills</Typography>
          <Typography variant="h3" color="error.main">12</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default ReportsDashboard;
