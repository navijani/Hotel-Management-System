import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

import MainLayout from './layouts/MainLayout';
import ReceptionDashboard from './pages/reception/Dashboard';
import ServiceDashboard from './pages/service/ServiceDashboard';
import ReportsDashboard from './pages/management/ReportsDashboard';
import BillingOverview from './pages/management/billing/BillingOverview';
import BillingInvoice from './pages/management/billing/BillingInvoice';
import BillingRevenue from './pages/management/billing/BillingRevenue';

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
import AccessPortal from './pages/AccessPortal';
import AdminLogin from './pages/AdminLogin';
import CleaningStaff from './pages/staff/CleaningStaff';
import BarKeepingStaff from './pages/staff/BarKeepingStaff';
import TherapistStaff from './pages/staff/TherapistStaff';
import WaiterStaff from './pages/staff/WaiterStaff';

const AdminGuard: React.FC<{ children: ReactNode }> = ({ children }) => (
  sessionStorage.getItem('adminAuthenticated') === 'true' ? <>{children}</> : <Navigate to="/admin" replace />
);

const StaffGuard: React.FC<{ role: string; children: ReactNode }> = ({ role, children }) => (
  sessionStorage.getItem('staffRole') === role ? <>{children}</> : <Navigate to="/portal" replace />
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* Website Routes with Top Navigation */}
          <Route path="/" element={<GuestLayout />}>
            <Route index element={<Home />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="book" element={<Book />} />
            <Route path="portal" element={<AccessPortal />} />
          </Route>

          {/* Administrator login and protected administration panels */}
          <Route path="/admin" element={<AdminLogin />} />

          <Route path="/admin/dashboard" element={<AdminGuard><MainLayout /></AdminGuard>}>
            <Route index element={<ReceptionDashboard />} />
            <Route path="service" element={<ServiceDashboard />} />
            <Route path="management" element={<ReportsDashboard />} />
            <Route path="management/billing" element={<BillingOverview />} />
            <Route path="management/billing/invoice" element={<BillingInvoice />} />
            <Route path="management/billing/revenue" element={<BillingRevenue />} />
          </Route>

          {/* Temporary preview route for local billing UI review */}
          <Route path="/billing-preview" element={<BillingOverview />} />
          <Route path="/invoice-preview" element={<BillingInvoice />} />
          <Route path="/revenue-preview" element={<BillingRevenue />} />
          
          {/* System Admin Panel Routes */}
          <Route path="/system-admin" element={<AdminGuard><SystemAdminLayout /></AdminGuard>}>
            <Route index element={<SystemDashboard />} />
            <Route path="rooms" element={<SystemRooms />} />
            <Route path="users" element={<SystemUsers />} />
            <Route path="bookings" element={<SystemBookings />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          {/* Dedicated staff workspaces */}
          <Route path="/staff/cleaning" element={<StaffGuard role="cleaning"><CleaningStaff /></StaffGuard>} />
          <Route path="/staff/bar" element={<StaffGuard role="bar"><BarKeepingStaff /></StaffGuard>} />
          <Route path="/staff/therapist" element={<StaffGuard role="therapist"><TherapistStaff /></StaffGuard>} />
          <Route path="/staff/waiter" element={<StaffGuard role="waiter"><WaiterStaff /></StaffGuard>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
