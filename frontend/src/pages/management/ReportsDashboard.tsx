import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ReportsDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e' }}>
            Management Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Overview metrics plus entry point into the billing and revenue workspace.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => navigate('/admin/dashboard/management/billing')}>
            Open billing overview
          </Button>
          <Button variant="contained" onClick={() => navigate('/billing-preview')}>
            Open temporary billing preview
          </Button>
          <Button variant="outlined" onClick={() => navigate('/invoice-preview')}>
            Invoice preview
          </Button>
          <Button variant="outlined" onClick={() => navigate('/revenue-preview')}>
            Revenue preview
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' } }}>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Room Occupancy
          </Typography>
          <Typography variant="h3" color="primary.main">
            78%
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Monthly Revenue
          </Typography>
          <Typography variant="h3" color="success.main">
            LKR 4.2M
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pending Bills
          </Typography>
          <Typography variant="h3" color="error.main">
            12
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default ReportsDashboard;
