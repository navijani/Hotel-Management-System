import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

import MainLayout from './layouts/MainLayout';
import ReceptionDashboard from './pages/reception/Dashboard';
import ServiceDashboard from './pages/service/ServiceDashboard';

import GuestLayout from './layouts/GuestLayout';
import Home from './pages/guest/Home';
import About from './pages/guest/About';
import Rooms from './pages/guest/Rooms';
import Book from './pages/guest/Book';
import SignIn from './pages/guest/SignIn';
import SignUp from './pages/guest/SignUp';
import Profile from './pages/guest/Profile';

import SystemAdminLayout from './layouts/SystemAdminLayout';
import SystemDashboard from './pages/system-admin/Dashboard';
import SystemRooms from './pages/system-admin/Rooms';
import SystemUsers from './pages/system-admin/Users';
import SystemBookings from './pages/system-admin/Bookings';
import SystemSettings from './pages/system-admin/Settings';
<<<<<<< HEAD
=======
import SystemReports from './pages/system-admin/Reports';
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
import ExclusiveOffers from './pages/system-admin/ExclusiveOffers';
import AccessPortal from './pages/AccessPortal';
import AdminLogin from './pages/AdminLogin';

import ReceptionLayout from './pages/reception/ReceptionLayout';
import ReceptionHome from './pages/reception/ReceptionHome';
import NewBooking from './pages/reception/NewBooking';
import ReceptionBookings from './pages/reception/ReceptionBookings';
import ReceptionBilling from './pages/reception/ReceptionBilling';

import CleaningStaff from './pages/staff/CleaningStaff';
import BarKeepingStaff from './pages/staff/BarKeepingStaff';
import TherapistStaff from './pages/staff/TherapistStaff';
import WaiterStaff from './pages/staff/WaiterStaff';
<<<<<<< HEAD
import BarItemsAdmin from './pages/bar/BarItemsAdmin';
import BarItemsStaff from './pages/bar/BarItemsStaff';

const GuestGuard: React.FC<{ children: ReactNode }> = ({ children }) => (
  sessionStorage.getItem('guestAuthenticated') === 'true' ? <>{children}</> : <Navigate to="/signin" replace />
);

const AdminGuard: React.FC<{ children: ReactNode }> = ({ children }) => (
  (sessionStorage.getItem('adminAuthenticated') === 'true' || sessionStorage.getItem('hmsAdminSignedIn') === 'true')
    ? <>{children}</>
    : <Navigate to="/admin" replace />
=======
import HousekeepingStaff from './pages/staff/HousekeepingStaff';
import BarItemsAdmin from './pages/bar/BarItemsAdmin';
import BarItemsStaff from './pages/bar/BarItemsStaff';

import { getStoredStaffSession } from './api/auth';
import type { StaffRole } from './api/auth';

const GuestGuard: React.FC<{ children: ReactNode }> = ({ children }) => (
  sessionStorage.getItem('guestAuthenticated') === 'true' || sessionStorage.getItem('guestSignedIn') === 'true'
    ? <>{children}</>
    : <Navigate to="/signin" replace />
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
);

const AdminGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const session = getStoredStaffSession();
  const isAdmin = session?.role?.toLowerCase() === 'admin'
    || sessionStorage.getItem('adminAuthenticated') === 'true'
    || sessionStorage.getItem('hmsAdminSignedIn') === 'true';

  return isAdmin ? <>{children}</> : <Navigate to="/admin" replace />;
};

const StaffGuard: React.FC<{ roles?: StaffRole[]; role?: string; children: ReactNode }> = ({ roles, role, children }) => {
  const session = getStoredStaffSession();
  const activeRole = (session?.role || sessionStorage.getItem('staffRole') || '').toLowerCase();

  const allowedRoles = (roles || (role ? [role as StaffRole] : []))
    .map((r) => r.toLowerCase())
    .concat('admin');

  return allowedRoles.includes(activeRole) ? <>{children}</> : <Navigate to="/portal" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
<<<<<<< HEAD
          {/* Website Routes with Top Navigation */}
=======
          {/* Guest Website */}
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
          <Route path="/" element={<GuestLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="book" element={<Book />} />
            <Route path="portal" element={<AccessPortal />} />
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="profile" element={<GuestGuard><Profile /></GuestGuard>} />
          </Route>

<<<<<<< HEAD
          {/* Administrator login and protected administration panels */}
=======
          {/* Admin Signin */}
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/signin" element={<AdminLogin />} />

          {/* Reception Desk */}
          <Route path="/reception" element={<StaffGuard roles={['Admin', 'Receptionist']}><ReceptionLayout /></StaffGuard>}>
            <Route index element={<ReceptionHome />} />
            <Route path="new-booking" element={<NewBooking />} />
            <Route path="bookings" element={<ReceptionBookings />} />
            <Route path="bookings/:bookingId" element={<ReceptionBilling />} />
          </Route>

          {/* Teammate Management Dashboard */}
          <Route path="/admin/dashboard" element={<AdminGuard><MainLayout /></AdminGuard>}>
            <Route index element={<ReceptionDashboard />} />
            <Route path="service" element={<ServiceDashboard />} />
<<<<<<< HEAD
            <Route path="management" element={<ReportsDashboard />} />
            <Route path="bar" element={<BarItemsAdmin />} />
            <Route path="offers" element={<ExclusiveOffers />} />
            <Route path="management/billing" element={<BillingOverview />} />
            <Route path="management/billing/invoice" element={<BillingInvoice />} />
            <Route path="management/billing/revenue" element={<BillingRevenue />} />
          </Route>

          {/* Temporary preview route for local billing UI review */}
          <Route path="/billing-preview" element={<BillingOverview />} />
          <Route path="/invoice-preview" element={<BillingInvoice />} />
          <Route path="/revenue-preview" element={<BillingRevenue />} />

          {/* System Admin Panel Routes */}
=======
            <Route path="bar" element={<BarItemsAdmin />} />
            <Route path="offers" element={<ExclusiveOffers />} />
          </Route>

          {/* System Admin Dashboard */}
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
          <Route path="/system-admin" element={<AdminGuard><SystemAdminLayout /></AdminGuard>}>
            <Route index element={<SystemDashboard />} />
            <Route path="rooms" element={<SystemRooms />} />
            <Route path="users" element={<SystemUsers />} />
            <Route path="bookings" element={<SystemBookings />} />
            <Route path="bar" element={<BarItemsAdmin />} />
            <Route path="offers" element={<ExclusiveOffers />} />
<<<<<<< HEAD
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          {/* Dedicated staff workspaces */}
          <Route path="/staff/cleaning" element={<StaffGuard role="cleaning"><CleaningStaff /></StaffGuard>} />
          <Route path="/staff/bar" element={<StaffGuard role="bar"><BarKeepingStaff /></StaffGuard>} />
          <Route path="/staff/bar-items" element={<StaffGuard role="bar"><BarItemsStaff /></StaffGuard>} />
          <Route path="/staff/therapist" element={<StaffGuard role="therapist"><TherapistStaff /></StaffGuard>} />
          <Route path="/staff/waiter" element={<StaffGuard role="waiter"><WaiterStaff /></StaffGuard>} />
=======
            <Route path="reports" element={<SystemReports />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          {/* Staff Department Desks */}
          <Route path="/staff/receptionist/*" element={<Navigate to="/reception" replace />} />
          <Route path="/staff/receptionist" element={<Navigate to="/reception" replace />} />
          <Route path="/staff/housekeeping" element={<StaffGuard roles={['Housekeeping', 'cleaning']}><HousekeepingStaff /></StaffGuard>} />
          <Route path="/staff/cleaning" element={<StaffGuard roles={['cleaning', 'Housekeeping']}><CleaningStaff /></StaffGuard>} />
          <Route path="/staff/bar" element={<StaffGuard roles={['bar', 'Admin']}><BarKeepingStaff /></StaffGuard>} />
          <Route path="/staff/bar-items" element={<StaffGuard roles={['bar', 'waiter', 'Admin']}><BarItemsStaff /></StaffGuard>} />
          <Route path="/staff/therapist" element={<StaffGuard roles={['therapist']}><TherapistStaff /></StaffGuard>} />
          <Route path="/staff/waiter" element={<StaffGuard roles={['waiter']}><WaiterStaff /></StaffGuard>} />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;