import React from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Switch, FormControlLabel } from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e', mb: 4 }}>
        System Settings
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>General Info</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField label="Hotel Name" defaultValue="HRGSMS Grand Hotel" fullWidth />
              <TextField label="Contact Email" defaultValue="admin@hrgsms.com" fullWidth />
              <TextField label="Phone Number" defaultValue="+94 11 234 5678" fullWidth />
              <TextField label="Address" defaultValue="123 Ocean Drive, Colombo" fullWidth multiline rows={3} />
              <Button variant="contained" sx={{ alignSelf: 'flex-start', bgcolor: '#4facfe' }}>Save Changes</Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Preferences</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel control={<Switch defaultChecked color="primary" />} label="Enable Online Bookings" />
              <FormControlLabel control={<Switch defaultChecked color="primary" />} label="Send Email Notifications" />
              <FormControlLabel control={<Switch color="primary" />} label="Maintenance Mode" />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
