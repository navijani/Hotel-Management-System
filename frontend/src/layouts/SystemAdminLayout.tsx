import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Fade,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  MeetingRoom as RoomIcon,
  People as PeopleIcon,
  EventNote as BookingIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const SystemAdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/system-admin' },
    { text: 'Rooms Management', icon: <RoomIcon />, path: '/system-admin/rooms' },
    { text: 'Bookings', icon: <BookingIcon />, path: '/system-admin/bookings' },
    { text: 'Users & Staff', icon: <PeopleIcon />, path: '/system-admin/users' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/system-admin/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#1e1e2f', color: '#fff' }}>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: '#4facfe', letterSpacing: 1 }}>
          SYS-ADMIN
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List sx={{ px: 2, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/system-admin' && location.pathname.startsWith(item.path));
          return (
            <ListItem disablePadding sx={{ mb: 1 }} key={item.text}>
              <ListItemButton 
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'rgba(79, 172, 254, 0.15)' : 'transparent',
                  color: isActive ? '#4facfe' : '#a0a0b0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(79, 172, 254, 0.25)' : 'rgba(255,255,255,0.05)',
                    color: isActive ? '#4facfe' : '#fff',
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#4facfe' : 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography sx={{ fontWeight: isActive ? 600 : 400 }}>
                      {item.text}
                    </Typography>
                  } 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
         <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
         <ListItemButton 
            onClick={() => navigate('/')}
            sx={{ borderRadius: 2, color: '#a0a0b0', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' } }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Back to Site" />
          </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#ffffff',
          color: '#333',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Super Admin
            </Typography>
            <Avatar sx={{ width: 35, height: 35, bgcolor: '#4facfe' }}>SA</Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 4, 
          width: { sm: `calc(100% - ${drawerWidth}px)` }, 
          mt: 8,
          bgcolor: '#f4f6f8',
          minHeight: '100vh'
        }}
      >
        <Fade in={true} timeout={500}>
          <Box>
            <Outlet />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default SystemAdminLayout;
