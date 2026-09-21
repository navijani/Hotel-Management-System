import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const staffSessionKey = 'hmsStaffSession';

type StaffSession = {
  id: number;
  username: string;
  role: string;
};

type Attendance = {
  attendance_date: string;
  check_in_time?: string;
  check_out_time?: string | null;
  check_in_location?: string;
  check_out_location?: string | null;
  is_busy?: number;
};

type Workspace = {
  staff: StaffSession & { active: number };
  attendance: Attendance[];
  salary: { role: string; rate: number; salary_amount: number };
};

const getErrorMessage = async (response: Response) => {
  const body = await response.json().catch(() => ({}));
  return body.error || 'Unable to connect to the staff portal.';
};

const getCurrentLocation = (): Promise<string> => new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('Location services are not supported by this browser.'));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)} (accuracy ${Math.round(coords.accuracy)}m)`),
    () => reject(new Error('Location permission is required to record attendance.')),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
});

const StaffPortal = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<StaffSession | null>(() => {
    const saved = window.sessionStorage.getItem(staffSessionKey);
    return saved ? JSON.parse(saved) : null;
  });
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cleaning');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const loadWorkspace = async (staff: StaffSession) => {
    const response = await fetch(`${API_BASE}/staff/${staff.id}/workspace`);
    if (!response.ok) throw new Error(await getErrorMessage(response));
    setWorkspace(await response.json());
  };

  useEffect(() => {
    if (!session) return;
    loadWorkspace(session).catch((error: Error) => setMessage(error.message));
  }, [session]);

  const handleSignIn = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE}/staff/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const signedInStaff: StaffSession = await response.json();
      window.sessionStorage.setItem(staffSessionKey, JSON.stringify(signedInStaff));
      setSession(signedInStaff);
      setPassword('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (action: 'check-in' | 'check-out') => {
    if (!session) return;
    setAttendanceLoading(true);
    setMessage('');
    try {
      const location = await getCurrentLocation();
      const response = await fetch(`${API_BASE}/staff/${session.id}/attendance/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const result = await response.json();
      setMessage(result.message);
      await loadWorkspace(session);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to record attendance.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSignOut = () => {
    window.sessionStorage.removeItem(staffSessionKey);
    setSession(null);
    setWorkspace(null);
  };

  if (!session) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', mt: { xs: 5, md: 10 } }}>
        <Card elevation={4}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="overline" color="primary">HMS Staff Portal</Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>Staff sign in</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Access your attendance and salary workspace.</Typography>
            <Stack spacing={2}>
              <TextField label="Username" value={username} onChange={(event) => setUsername(event.target.value)} fullWidth />
              <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={role} label="Role" onChange={(event) => setRole(event.target.value)}>
                  <MenuItem value="cleaning">Cleaning</MenuItem>
                  <MenuItem value="bar">Bar</MenuItem>
                  <MenuItem value="therapist">Therapist</MenuItem>
                  <MenuItem value="waiter">Waiter</MenuItem>
                </Select>
              </FormControl>
              {message && <Alert severity="error">{message}</Alert>}
              <Button variant="contained" size="large" onClick={handleSignIn} disabled={loading || !username || !password}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const today = workspace?.attendance.find((entry) => entry.attendance_date === new Date().toISOString().slice(0, 10));
  const checkedIn = Boolean(today?.check_in_time && !today.check_out_time);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Box>
          <Typography variant="overline" color="primary">HMS Staff Portal</Typography>
          <Typography variant="h4">Welcome, {session.username}</Typography>
          <Typography color="text.secondary">{session.role}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {['bar', 'waiter'].includes(session.role) && <Button variant="outlined" startIcon={<InventoryIcon />} onClick={() => navigate('/staff/bar')}>Update bar items</Button>}
          <Button variant="outlined" onClick={handleSignOut}>Sign out</Button>
        </Stack>
      </Stack>
      {message && <Alert severity="info" sx={{ mb: 3 }}>{message}</Alert>}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Today&apos;s attendance</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {today ? `Check-in: ${today.check_in_time || 'Not recorded'}${today.check_out_time ? ` | Check-out: ${today.check_out_time}` : ''}` : 'No attendance recorded today.'}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={() => handleAttendance('check-in')} disabled={attendanceLoading || Boolean(today)}>Check in</Button>
              <Button variant="outlined" onClick={() => handleAttendance('check-out')} disabled={attendanceLoading || !checkedIn}>Check out</Button>
            </Stack>
            <Typography variant="caption" sx={{ mt: 2, display: 'block' }} color="text.secondary">
              Your browser will ask for location permission when recording attendance.
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Salary</Typography>
            <Typography color="text.secondary">Role rate: {workspace?.salary.rate ?? '-'}</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>{workspace?.salary.salary_amount ?? 0}</Typography>
            <Typography variant="caption" color="text.secondary">Current salary amount</Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default StaffPortal;
