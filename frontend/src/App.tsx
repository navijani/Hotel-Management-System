import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

import MainLayout from './layouts/MainLayout';
import ReceptionDashboard from './pages/reception/Dashboard';
import ServiceDashboard from './pages/service/ServiceDashboard';
import ReportsDashboard from './pages/management/ReportsDashboard';

import GuestLayout from './layouts/GuestLayout';
import Home from './pages/guest/Home';
import Rooms from './pages/guest/Rooms';
import Book from './pages/guest/Book';

import SystemAdminLayout from './layouts/SystemAdminLayout';
import SystemDashboard from './pages/system-admin/Dashboard';
import SystemRooms from './pages/system-admin/Rooms';
import SystemUsers from './pages/system-admin/Users';
import SystemBookings from './pages/system-admin/Bookings';
import SystemSettings from './pages/system-admin/Settings';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* Guest Website Routes */}
          <Route path="/" element={<GuestLayout />}>
            <Route index element={<Home />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="book" element={<Book />} />
          </Route>

          {/* Admin Panel Routes */}
          <Route path="/admin" element={<MainLayout />}>
            <Route index element={<ReceptionDashboard />} />
            <Route path="service" element={<ServiceDashboard />} />
            <Route path="management" element={<ReportsDashboard />} />
          </Route>
          
          {/* System Admin Panel Routes */}
          <Route path="/system-admin" element={<SystemAdminLayout />}>
            <Route index element={<SystemDashboard />} />
            <Route path="rooms" element={<SystemRooms />} />
            <Route path="users" element={<SystemUsers />} />
            <Route path="bookings" element={<SystemBookings />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
