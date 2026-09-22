import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert, Avatar, Box, Button, Card, Chip, Divider, Grid, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { useNavigate } from 'react-router-dom';

export type StaffRole = 'cleaning' | 'bar' | 'therapist' | 'waiter';

type Attendance = {
  id: number;
  attendance_date: string;
  check_in_time: string;
  check_out_time: string | null;
  check_in_location: string;
  check_out_location: string | null;
  is_busy: boolean;
};

const roleDetails: Record<StaffRole, { title: string; short: string; accent: string; soft: string; orders: string; focus: string }> = {
  cleaning: { title: 'Cleaning Staff', short: 'Housekeeping', accent: '#168f83', soft: '#e5f5f1', orders: 'Room readiness queue', focus: 'Rooms that need a reset, refresh, or final inspection.' },
  bar: { title: 'Bar Keeping Staff', short: 'Bar service', accent: '#b45a3c', soft: '#f9e9df', orders: 'Bar service queue', focus: 'Drinks, stock requests, and guest moments in motion.' },
  therapist: { title: 'Therapist Staff', short: 'Wellness', accent: '#7656a8', soft: '#eee8f8', orders: 'Wellness appointments', focus: 'Treatments and guest care, arranged with calm precision.' },
  waiter: { title: 'Waiter Staff', short: 'Dining service', accent: '#2671a8', soft: '#e5f0fa', orders: 'Dining service queue', focus: 'Tables, room service, and delivery requests to move forward.' },
};

const orderSets: Record<StaffRole, { id: string; guest: string; detail: string; status: string }[]> = {
  cleaning: [
    { id: 'RM-204', guest: 'A. Perera', detail: 'Deep clean · checkout', status: 'Ready next' },
    { id: 'RM-118', guest: 'J. Silva', detail: 'Refresh towels · occupied', status: 'In progress' },
    { id: 'RM-306', guest: 'M. Chen', detail: 'Final inspection', status: 'Waiting' },
  ],
  bar: [
    { id: 'BAR-18', guest: 'Suite 402', detail: 'Two mocktails · terrace', status: 'Mixing' },
    { id: 'BAR-19', guest: 'Table 07', detail: 'Sparkling water · lime', status: 'Queued' },
    { id: 'BAR-20', guest: 'Suite 108', detail: 'Sunset tasting set', status: 'Ready next' },
  ],
  therapist: [
    { id: 'SPA-08', guest: 'N. Fernando', detail: 'Aromatherapy · 60 min', status: 'Confirmed' },
    { id: 'SPA-09', guest: 'K. Wong', detail: 'Deep tissue · 90 min', status: 'Starting soon' },
    { id: 'SPA-10', guest: 'S. Khan', detail: 'Couples retreat', status: 'Confirmed' },
  ],
  waiter: [
    { id: 'ORD-411', guest: 'Suite 214', detail: 'Breakfast for two', status: 'Preparing' },
    { id: 'ORD-412', guest: 'Table 12', detail: 'Chef tasting menu', status: 'Served' },
    { id: 'ORD-413', guest: 'Suite 509', detail: 'Late-night supper', status: 'Queued' },
  ],
};

const getLocation = () => new Promise<string>((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('Location is not supported by this browser.'));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`),
    () => reject(new Error('Location permission is needed to record attendance.')),
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

const StaffRolePage: React.FC<{ role: StaffRole }> = ({ role }) => {
  const navigate = useNavigate();
  const details = roleDetails[role];
  const staffId = sessionStorage.getItem('staffId');
  const profile = JSON.parse(sessionStorage.getItem('staffProfile') || '{}');
  const [section, setSection] = useState('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [salary, setSalary] = useState({ role, rate: 7, salary_amount: 0 });
  const [staff, setStaff] = useState({ username: profile.username || '', mobile_number: profile.mobile_number || '' });
  const [settings, setSettings] = useState({ username: profile.username || '', mobile_number: profile.mobile_number || '', password: '' });
  const [orders, setOrders] = useState(orderSets[role]);

const timeToDate = (time: string, reference: Date) => {
  const [hours, minutes, seconds = 0] = time.split(':').map(Number);
  const value = new Date(reference);
  value.setHours(hours, minutes, seconds, 0);
  return value;
};

const formatDuration = (seconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const localDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
  const [message, setMessage] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const loadWorkspace = async () => {
    if (!staffId) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/staff/${staffId}/workspace`);
      setAttendance(response.data.attendance);
      setSalary(response.data.salary);
      setStaff(response.data.staff);
      setSettings({ username: response.data.staff.username, mobile_number: response.data.staff.mobile_number || '', password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: axios.isAxiosError(error) ? error.response?.data?.error || 'Unable to load workspace.' : 'Unable to load workspace.' });
    }
  };

  useEffect(() => { loadWorkspace(); }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const attendanceToday = attendance.find((item) => item.attendance_date.slice(0, 10) === localDateKey(currentTime));
  const workedSecondsToday = attendanceToday?.check_in_time
    ? Math.max(0, ((attendanceToday.check_out_time ? timeToDate(attendanceToday.check_out_time, currentTime) : currentTime).getTime() - timeToDate(attendanceToday.check_in_time, currentTime).getTime()) / 1000)
    : 0;
  const workedHours = workedSecondsToday / 3600;
  const hourlyRate = Number(salary.rate || 0);
  const earned = workedHours * hourlyRate;

  const recordAttendance = async (action: 'check-in' | 'check-out') => {
    if (!staffId) return;
    setMessage({ type: '', text: '' });
    try {
      const location = await getLocation();
      const payload = action === 'check-in'
        ? { check_in_location: location, location }
        : { check_out_location: location, location };
      const response = await axios.post(`http://localhost:5000/api/staff/${staffId}/attendance/${action}`, payload);
      await loadWorkspace();
      setMessage({ type: 'success', text: response.data.message || (action === 'check-in' ? 'You are checked in.' : 'You are checked out.') });
    } catch (error) {
      const text = error instanceof Error ? error.message : axios.isAxiosError(error) ? error.response?.data?.error : 'Attendance could not be recorded.';
      setMessage({ type: 'error', text: text || 'Attendance could not be recorded.' });
    }
  };

  const updateBusy = async () => {
    if (!staffId || !attendanceToday) return;
    try {
      setBusy(!attendanceToday.is_busy);
      await axios.patch(`http://localhost:5000/api/staff/${staffId}/attendance/busy`, { is_busy: !attendanceToday.is_busy });
      await loadWorkspace();
    } catch {
      setMessage({ type: 'error', text: 'Busy status could not be updated.' });
    }
  };

  const updateSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!staffId) return;
    try {
      await axios.patch(`http://localhost:5000/api/staff/${staffId}/profile`, settings);
      sessionStorage.setItem('staffProfile', JSON.stringify({ ...profile, username: settings.username }));
      setStaff({ username: settings.username, mobile_number: settings.mobile_number });
      setSettings((current) => ({ ...current, password: '' }));
      setMessage({ type: 'success', text: 'Your account settings were updated.' });
    } catch (error) {
      setMessage({ type: 'error', text: axios.isAxiosError(error) ? error.response?.data?.error || 'Settings could not be updated.' : 'Settings could not be updated.' });
    }
  };

  const advanceOrder = (orderId: string) => {
    setOrders((currentOrders) => currentOrders.map((order) => order.id === orderId ? { ...order, status: order.status === 'Completed' ? 'Completed' : 'Completed' } : order));
  };

  const signOut = () => {
    sessionStorage.removeItem('staffRole');
    sessionStorage.removeItem('staffId');
    sessionStorage.removeItem('staffProfile');
    navigate('/portal');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <DashboardRoundedIcon /> },
    { id: 'attendance', label: 'Attendance', icon: <EventAvailableRoundedIcon /> },
    { id: 'payments', label: 'Payments', icon: <PaymentsRoundedIcon /> },
    { id: 'settings', label: 'Account settings', icon: <SettingsRoundedIcon /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8f6', color: '#1c2928', display: 'flex' }}>
      <Box sx={{ width: { xs: mobileNav ? 260 : 0, md: 252 }, flexShrink: 0, overflow: 'hidden', transition: 'width .25s ease', bgcolor: '#172423', color: '#f1f5f2', minHeight: '100vh', position: { xs: 'fixed', md: 'relative' }, zIndex: 4 }}>
        <Box sx={{ p: 3, minWidth: 252 }}>
          <Typography sx={{ fontWeight: 800, letterSpacing: 1, color: details.accent }}>PARADISE</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.55)', letterSpacing: 2 }}>STAFF DESK</Typography>
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,.12)' }} />
          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,.4)', letterSpacing: 2 }}>Your workspace</Typography>
          <List sx={{ mt: 1 }}>
            {navItems.map((item) => <ListItemButton key={item.id} selected={section === item.id} onClick={() => { setSection(item.id); setMobileNav(false); }} sx={{ borderRadius: 2, mb: .5, color: 'rgba(255,255,255,.72)', '&.Mui-selected': { bgcolor: details.accent, color: '#fff' }, '&:hover': { bgcolor: 'rgba(255,255,255,.1)' } }}><ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>{item.icon}</ListItemIcon><ListItemText primary={item.label} /></ListItemButton>)}
          </List>
          <ListItemButton onClick={signOut} sx={{ mt: 5, borderRadius: 2, color: 'rgba(255,255,255,.65)' }}><ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}><LogoutRoundedIcon /></ListItemIcon><ListItemText primary="Sign out" /></ListItemButton>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ px: { xs: 2, md: 5 }, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e9e6', bgcolor: 'rgba(255,255,255,.8)', backdropFilter: 'blur(10px)' }}>
          <IconButton onClick={() => setMobileNav(!mobileNav)} sx={{ display: { md: 'none' } }}><MenuRoundedIcon /></IconButton>
          <Box sx={{ ml: { xs: 1, md: 0 } }}><Typography variant="caption" sx={{ color: details.accent, fontWeight: 800, letterSpacing: 2 }}>{details.short.toUpperCase()}</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>{details.title}</Typography></Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ bgcolor: details.accent }}>{(staff.username || 'S')[0].toUpperCase()}</Avatar><Box sx={{ display: { xs: 'none', sm: 'block' } }}><Typography variant="body2" sx={{ fontWeight: 700 }}>{staff.username || 'Staff member'}</Typography><Typography variant="caption" color="text.secondary">On duty desk</Typography></Box></Box>
        </Box>

        <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: 1450, mx: 'auto' }}>
          {message.text && <Alert severity={message.type === 'success' ? 'success' : 'error'} onClose={() => setMessage({ type: '', text: '' })} sx={{ mb: 3 }}>{message.text}</Alert>}
          {section === 'settings' ? <Card component="form" onSubmit={updateSettings} sx={{ maxWidth: 680, p: { xs: 2, md: 4 }, borderRadius: 4, boxShadow: '0 16px 40px rgba(23,36,35,.08)' }}><Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Account settings</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Keep your staff profile current.</Typography><Stack spacing={2}><TextField label="Username" value={settings.username} onChange={(event) => setSettings({ ...settings, username: event.target.value })} required /><TextField label="Mobile number" value={settings.mobile_number} onChange={(event) => setSettings({ ...settings, mobile_number: event.target.value })} required /><TextField label="New password" type="password" helperText="Leave blank to keep your current password" value={settings.password} onChange={(event) => setSettings({ ...settings, password: event.target.value })} /><Button type="submit" variant="contained" sx={{ bgcolor: details.accent, '&:hover': { bgcolor: details.accent } }}>Save changes</Button></Stack></Card> : <>
            <Box sx={{ mb: 4 }}><Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1, color: '#17302d' }}>Good to see you, {staff.username || 'team member'}.</Typography><Typography sx={{ mt: 1, color: '#667571' }}>{details.focus}</Typography></Box>
            {section === 'overview' && <Card sx={{ mb: 3, borderRadius: 4, overflow: 'hidden', border: `2px solid ${details.accent}`, boxShadow: `0 14px 34px ${details.accent}25` }}>
              <Box sx={{ p: 3, bgcolor: details.soft, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box><Typography variant="overline" sx={{ color: details.accent, fontWeight: 900, letterSpacing: 2 }}>Priority queue</Typography><Typography variant="h5" sx={{ fontWeight: 900 }}>{details.orders}</Typography><Typography variant="body2" color="text.secondary">Start here to keep today&apos;s service moving.</Typography></Box>
                <Chip label={`${orders.filter((order) => order.status !== 'Completed').length} open`} sx={{ bgcolor: details.accent, color: '#fff', fontWeight: 800 }} />
              </Box>
              <OrderTable rows={orders} accent={details.accent} onAdvance={advanceOrder} />
            </Card>}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}><Card sx={{ p: 2.5, borderRadius: 4, bgcolor: '#17302d', color: '#fff', boxShadow: 'none' }}><Typography variant="caption" sx={{ color: 'rgba(255,255,255,.65)' }}>CURRENT TIME</Typography><Typography variant="h4" sx={{ mt: 1, fontWeight: 900, letterSpacing: 1 }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Typography><Typography variant="body2" sx={{ color: 'rgba(255,255,255,.65)' }}>{currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</Typography></Card></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><Card sx={{ p: 2.5, borderRadius: 4, bgcolor: details.soft, boxShadow: 'none' }}><Typography variant="caption" sx={{ fontWeight: 800, color: details.accent }}>WORKED TIME</Typography><Typography variant="h4" sx={{ mt: 1, fontWeight: 900, color: details.accent, letterSpacing: 1 }}>{formatDuration(workedSecondsToday)}</Typography><Typography variant="body2" color="text.secondary">{attendanceToday?.check_out_time ? 'Completed today' : attendanceToday?.check_in_time ? 'Live from check-in' : 'Check in to start'}</Typography></Card></Grid>
            </Grid>
            <Grid container spacing={2.5} sx={{ mb: 3 }}><Grid size={{ xs: 12, md: 4 }}><Card sx={{ p: 2.5, borderRadius: 4, bgcolor: details.soft, boxShadow: 'none' }}><Typography variant="caption" sx={{ fontWeight: 800, color: details.accent }}>TODAY&apos;S ATTENDANCE</Typography><Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>{attendanceToday?.check_in_time ? (attendanceToday.check_out_time ? 'Completed' : 'On shift') : 'Not checked in'}</Typography><Stack direction="row" spacing={1} sx={{ mt: 2 }}><Button size="small" variant="contained" disabled={Boolean(attendanceToday?.check_in_time)} onClick={() => recordAttendance('check-in')} startIcon={<LocationOnRoundedIcon />} sx={{ bgcolor: details.accent }}>Check in</Button><Button size="small" variant="outlined" disabled={!attendanceToday?.check_in_time || Boolean(attendanceToday?.check_out_time)} onClick={() => recordAttendance('check-out')} sx={{ borderColor: details.accent, color: details.accent }}>Check out</Button></Stack></Card></Grid><Grid size={{ xs: 12, md: 4 }}><Card sx={{ p: 2.5, borderRadius: 4, bgcolor: '#fff', boxShadow: '0 12px 30px rgba(23,36,35,.06)' }}><Typography variant="caption" color="text.secondary">HOURLY RATE</Typography><Typography variant="h4" sx={{ mt: 1, fontWeight: 900 }}>${hourlyRate.toFixed(2)}<Typography component="span" variant="body2" color="text.secondary"> / hour</Typography></Typography><Typography variant="body2" color="text.secondary">Role rate · {salary.role}</Typography><Typography variant="caption" color="text.secondary">Salary amount: ${Number(salary.salary_amount || 0).toFixed(2)}</Typography></Card></Grid><Grid size={{ xs: 12, md: 4 }}><Card sx={{ p: 2.5, borderRadius: 4, bgcolor: '#17302d', color: '#fff', boxShadow: 'none' }}><Typography variant="caption" sx={{ color: 'rgba(255,255,255,.65)' }}>ESTIMATED EARNINGS</Typography><Typography variant="h4" sx={{ mt: 1, fontWeight: 900 }}>${earned.toFixed(2)}</Typography><Typography variant="body2" sx={{ color: 'rgba(255,255,255,.65)' }}>{workedHours.toFixed(1)} tracked hours × ${hourlyRate.toFixed(2)}</Typography></Card></Grid></Grid>
            {section === 'attendance' ? <Card sx={{ borderRadius: 4, overflow: 'hidden' }}><Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Box><Typography variant="h6" sx={{ fontWeight: 800 }}>Attendance history</Typography><Typography variant="body2" color="text.secondary">Location-proofed shift records</Typography></Box><Button onClick={updateBusy} disabled={!attendanceToday?.check_in_time || Boolean(attendanceToday?.check_out_time)} variant="outlined" sx={{ borderColor: details.accent, color: details.accent }}>{attendanceToday?.is_busy || busy ? 'Mark available' : 'Mark busy'}</Button></Box><AttendanceTable rows={attendance} /></Card> : section === 'payments' ? <Card sx={{ p: 3, borderRadius: 4 }}><Typography variant="h6" sx={{ fontWeight: 800 }}>Payments</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Your fixed hourly rate is read from the staff salary record and calculated from completed attendance hours.</Typography><Typography variant="h2" sx={{ fontWeight: 900, color: details.accent }}>${earned.toFixed(2)}</Typography><Typography color="text.secondary">Estimated total from {workedHours.toFixed(1)} completed hours</Typography></Card> : null}
          </>}
        </Box>
      </Box>
    </Box>
  );
};

const AttendanceTable: React.FC<{ rows: Attendance[] }> = ({ rows }) => <Table size="small"><TableHead><TableRow><TableCell>Date</TableCell><TableCell>Check in</TableCell><TableCell>Check out</TableCell><TableCell>Location proof</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell>{row.attendance_date.slice(0, 10)}</TableCell><TableCell>{row.check_in_time}</TableCell><TableCell>{row.check_out_time || 'Open'}</TableCell><TableCell>{row.check_in_location}</TableCell><TableCell><Chip size="small" label={row.check_out_time ? 'Complete' : 'Active'} color={row.check_out_time ? 'default' : 'success'} /></TableCell></TableRow>)}{rows.length === 0 && <TableRow><TableCell colSpan={5} align="center">No attendance records yet.</TableCell></TableRow>}</TableBody></Table>;

const OrderTable: React.FC<{ rows: { id: string; guest: string; detail: string; status: string }[]; accent: string; onAdvance: (orderId: string) => void }> = ({ rows, accent, onAdvance }) => <Table><TableHead><TableRow><TableCell>Request</TableCell><TableCell>Guest / location</TableCell><TableCell>Details</TableCell><TableCell>Status</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead><TableBody>{rows.map((row) => <TableRow key={row.id} hover><TableCell sx={{ fontWeight: 800, color: accent }}>{row.id}</TableCell><TableCell>{row.guest}</TableCell><TableCell>{row.detail}</TableCell><TableCell><Chip size="small" label={row.status} sx={{ bgcolor: `${accent}18`, color: accent, fontWeight: 700 }} /></TableCell><TableCell align="right"><Button size="small" disabled={row.status === 'Completed'} onClick={() => onAdvance(row.id)} sx={{ color: accent }}>{row.status === 'Completed' ? 'Done' : 'Complete'}</Button></TableCell></TableRow>)}</TableBody></Table>;

export default StaffRolePage;
