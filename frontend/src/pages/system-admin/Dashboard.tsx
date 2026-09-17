import React from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
import { People, MeetingRoom, AttachMoney, TrendingUp } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ bgcolor: `${color}15`, p: 2, borderRadius: '50%', color: color }}>
        {icon}
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#1a1a2e' }}>
        System Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Users" value="1,245" icon={<People fontSize="large" />} color="#4facfe" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Rooms" value="120" icon={<MeetingRoom fontSize="large" />} color="#00f2fe" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Active Bookings" value="48" icon={<TrendingUp fontSize="large" />} color="#43e97b" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Revenue (MTD)" value="$45,200" icon={<AttachMoney fontSize="large" />} color="#fa709a" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography color="text.secondary">Revenue Chart Placeholder</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Recent Activity</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
               {[1,2,3,4].map(i => (
                 <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                   <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#4facfe' }} />
                   <Box>
                     <Typography variant="body2" sx={{ fontWeight: 600 }}>New booking created</Typography>
                     <Typography variant="caption" color="text.secondary">2 minutes ago</Typography>
                   </Box>
                 </Box>
               ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
