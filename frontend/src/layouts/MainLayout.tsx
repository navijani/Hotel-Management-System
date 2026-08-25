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
  Badge,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Avatar,
  Fade,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  RoomService as ServiceIcon,
  BarChart as ReportIcon,
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [branch, setBranch] = useState('Colombo');
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleBranchChange = (event: SelectChangeEvent) => {
    setBranch(event.target.value as string);
  };

  const menuItems = [
    { text: 'Reception', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Service Logging', icon: <ServiceIcon />, path: '/admin/service' },
    { text: 'Management', icon: <ReportIcon />, path: '/admin/management' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
          HRGSMS
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />
      <List sx={{ px: 2, pt: 2 }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Fade in={true} timeout={300 + (index * 150)} key={item.text}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    color: isActive ? '#d4af37' : '#4a4a4a',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.04)',
                      transform: 'translateX(4px)',
                      color: isActive ? '#d4af37' : '#1a1a1a',
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#d4af37' : 'inherit', minWidth: 40, transition: 'color 0.3s ease' }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography sx={{ fontWeight: isActive ? 600 : 500, transition: 'all 0.3s ease' }}>
                        {item.text}
                      </Typography>
                    } 
                  />
                </ListItemButton>
              </ListItem>
            </Fade>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          color: 'text.primary',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease'
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
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Select
              value={branch}
              onChange={handleBranchChange}
              size="small"
              sx={{ 
                ml: { xs: 0, sm: 2 }, 
                bgcolor: '#f5f5f5', 
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#ebebeb' }
              }}
            >
              <MenuItem value="Colombo">Colombo Branch</MenuItem>
              <MenuItem value="Kandy">Kandy Branch</MenuItem>
              <MenuItem value="Galle">Galle Branch</MenuItem>
            </Select>
          </Box>

          <IconButton color="inherit" sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}>
            <Badge badgeContent={4} sx={{ '& .MuiBadge-badge': { bgcolor: '#d4af37' } }}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1a1a1a', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)', cursor: 'pointer' } }}>AD</Avatar>
            <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 600 }}>
              Admin User
            </Typography>
            <IconButton color="inherit" sx={{ ml: 1, transition: 'transform 0.2s, color 0.2s', '&:hover': { transform: 'scale(1.1)', color: '#d4af37' } }}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, 
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0,0,0,0.05)',
              bgcolor: '#fafafa'
            },
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
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` }, 
          mt: 8,
          bgcolor: '#f8f9fa',
          minHeight: '100vh'
        }}
      >
        <Fade in={true} timeout={800}>
          <Box>
            <Outlet />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default MainLayout;
