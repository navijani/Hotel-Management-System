import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, Button, Chip, Stack, Alert } from '@mui/material';
import { People, MeetingRoom, AttachMoney, TrendingUp } from '@mui/icons-material';
import axios from 'axios';

type StaffMember = { id: number; username: string; role: string; active: boolean; created_at: string };

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
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [error, setError] = useState('');

  const loadStaff = async () => {
    try {
      const response = await axios.get<StaffMember[]>('http://localhost:5000/api/staff');
      setStaff(response.data);
    } catch {
      setError('Unable to load staff notifications.');
    }
  };

  useEffect(() => {
    void loadStaff();
  }, []);

  const updateStaffStatus = async (member: StaffMember, active: boolean) => {
    try {
      await axios.patch(`http://localhost:5000/api/staff/${member.id}/status`, { active });
      await loadStaff();
    } catch {
      setError('Unable to update this staff member.');
    }
  };

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
          <Paper sx={{ p: 3, borderRadius: 3, minHeight: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Staff notifications</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Approve new registrations or fire active staff members.</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {staff.length === 0 && !error && <Typography color="text.secondary">No staff registrations yet.</Typography>}
            <Stack spacing={2}>
              {staff.map((member) => (
                <Box key={member.id} sx={{ pb: 2, borderBottom: '1px solid #eee' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{member.username}</Typography>
                    <Chip size="small" label={member.active ? 'Active' : 'Pending'} color={member.active ? 'success' : 'warning'} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{member.role} staff</Typography>
                  <Button size="small" sx={{ mt: 1, display: 'block' }} color={member.active ? 'error' : 'primary'} onClick={() => void updateStaffStatus(member, !member.active)}>
                    {member.active ? 'Fire / deactivate' : 'Approve account'}
                  </Button>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
