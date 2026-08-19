import React from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';

const ServiceDashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Service Staff Interface
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Log Chargeable Service</Typography>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 2fr 1fr 1fr' }, alignItems: 'center' }}>
          <TextField fullWidth label="Guest Name or Room Number" variant="outlined" size="small" />
          <TextField fullWidth label="Select Service" variant="outlined" size="small" />
          <TextField fullWidth label="Quantity" type="number" variant="outlined" size="small" defaultValue={1} />
          <Button fullWidth variant="contained" color="primary" sx={{ height: '100%' }}>
            Log Service
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ServiceDashboard;
