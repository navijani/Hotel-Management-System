import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, Button, Chip, Stack, Alert } from '@mui/material';
import { People, MeetingRoom, AttachMoney, TrendingUp, Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [error, setError] = useState('');

  const loadStaff = async () => {
    try {
      const response = await axios.get<StaffMember[]>('http://localhost:5000/api/staff');
      setStaff(response.data);
    } catch {
      setError('Unable to load staff accounts.');
    }
  };

  useEffect(() => {
    void loadStaff();
  }, []);

  const handleRemoveStaff = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/staff/${id}`);
      await loadStaff();
    } catch {
      setError('Unable to remove staff member.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#1a1a2e' }}>
        System Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Staff" value={String(staff.length || 0)} icon={<People fontSize="large" />} color="#4facfe" />
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Active Staff Members</Typography>
              <Button size="small" startIcon={<PersonAddIcon />} onClick={() => navigate('/system-admin/users')} sx={{ textTransform: 'none' }}>
                Add User
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Administrators directly manage all system users and staff accounts.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {staff.length === 0 && !error && <Typography color="text.secondary">No staff accounts found.</Typography>}
            <Stack spacing={2} sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
              {staff.map((member) => (
                <Box key={member.id} sx={{ pb: 1.5, borderBottom: '1px solid #eee' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{member.username}</Typography>
                    <Chip size="small" label={member.active ? 'Active' : 'Inactive'} color={member.active ? 'success' : 'default'} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{member.role} staff</Typography>
                    <Button size="small" color="error" startIcon={<DeleteIcon fontSize="small" />} onClick={() => void handleRemoveStaff(member.id)} sx={{ textTransform: 'none', py: 0.2 }}>
                      Remove
                    </Button>
                  </Box>
                </Box>
              ))}
            </Stack>
            <Button fullWidth variant="outlined" sx={{ mt: 3, borderRadius: 2 }} onClick={() => navigate('/system-admin/users')}>
              Manage All Users
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
