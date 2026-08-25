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
          <Route path="/admin" element={<MainLayout />}>
            <Route index element={<ReceptionDashboard />} />
            <Route path="service" element={<ServiceDashboard />} />
            <Route path="management" element={<ReportsDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
