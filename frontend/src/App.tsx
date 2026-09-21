import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

import MainLayout from './layouts/MainLayout';
import ReceptionDashboard from './pages/reception/Dashboard';
import ServiceDashboard from './pages/service/ServiceDashboard';
import ReportsDashboard from './pages/management/ReportsDashboard';

import GuestLayout from './layouts/GuestLayout';
import Home from './pages/guest/Home';
import Rooms from './pages/guest/Rooms';
import StaffPortal from './pages/staff/StaffPortal';
import BarItemsAdmin from './pages/bar/BarItemsAdmin';
import BarItemsStaff from './pages/bar/BarItemsStaff';
import AdminSignIn from './pages/admin/AdminSignIn';

const AdminGate = () => (
  window.sessionStorage.getItem('hmsAdminSignedIn') === 'true'
    ? <MainLayout />
    : <Navigate to="/admin/signin" replace />
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* Guest Website Routes */}
          <Route path="/" element={<GuestLayout />}>
            <Route index element={<Home />} />
            <Route path="rooms" element={<Rooms />} />
            {/* <Route path="book" element={<Book />} /> */}
          </Route>

          {/* Admin Panel Routes */}
          <Route path="/admin/signin" element={<AdminSignIn />} />
          <Route path="/admin" element={<AdminGate />}>
            <Route index element={<ReceptionDashboard />} />
            <Route path="service" element={<ServiceDashboard />} />
            <Route path="management" element={<ReportsDashboard />} />
            <Route path="bar" element={<BarItemsAdmin />} />
          </Route>

          <Route path="/staff" element={<StaffPortal />} />
          <Route path="/staff/bar" element={<BarItemsStaff />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
