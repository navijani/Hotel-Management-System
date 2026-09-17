import React from 'react';
import { Box, Button, Card, CardContent, Container, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

export type StaffRole = 'cleaning' | 'bar' | 'therapist' | 'waiter';

const roleDetails: Record<StaffRole, { title: string; description: string; tasks: string[] }> = {
  cleaning: { title: 'Cleaning Staff Workspace', description: 'Keep every room and shared space ready for our guests.', tasks: ['View rooms awaiting cleaning', 'Update room cleaning status', 'Report maintenance issues'] },
  bar: { title: 'Bar Keeping Staff Workspace', description: 'Track bar service tasks and keep guest requests moving.', tasks: ['Review active bar orders', 'Update order progress', 'Record stock or service issues'] },
  therapist: { title: 'Therapist Staff Workspace', description: 'Manage wellness appointments and guest treatment requests.', tasks: ['View today\'s appointments', 'Confirm treatment completion', 'Add guest care notes'] },
  waiter: { title: 'Waiter Staff Workspace', description: 'Coordinate dining service and deliver a smooth guest experience.', tasks: ['View open dining requests', 'Update order status', 'Mark tables and deliveries complete'] },
};

const StaffRolePage: React.FC<{ role: StaffRole }> = ({ role }) => {
  const navigate = useNavigate();
  const details = roleDetails[role];

  const signOut = () => {
    sessionStorage.removeItem('staffRole');
    navigate('/portal');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f1e8', py: { xs: 5, md: 9 } }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#9a7620', fontWeight: 700, letterSpacing: 2 }}>Staff workspace</Typography>
            <Typography variant="h3" sx={{ mt: 1, fontWeight: 800, color: '#20251f', fontFamily: 'Georgia, serif' }}>{details.title}</Typography>
          </Box>
          <Button startIcon={<LogoutIcon />} onClick={signOut}>Sign out</Button>
        </Box>
        <Card sx={{ border: '1px solid #e0d6bd', boxShadow: '0 12px 30px rgba(52, 47, 32, 0.08)' }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography sx={{ color: '#5c625a', mb: 3 }}>{details.description}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Today&apos;s work</Typography>
            <List>
              {details.tasks.map((task) => (
                <ListItem key={task} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36, color: '#9a7620' }}><CheckCircleOutlineIcon /></ListItemIcon>
                  <ListItemText primary={task} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default StaffRolePage;
