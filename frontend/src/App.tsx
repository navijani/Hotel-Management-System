import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

import MainLayout from './layouts/MainLayout';
import ReceptionDashboard from './pages/reception/Dashboard';
import ServiceDashboard from './pages/service/ServiceDashboard';
import ReportsDashboard from './pages/management/ReportsDashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
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
