import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { ArrowForward, AutoGraph, CalendarMonth, Hotel, Payments, PeopleAlt, Refresh } from '@mui/icons-material';
import { fetchReportSummary } from '../../api/reception';
import type { DeskBooking, ReportSummary } from '../../api/reception';

type StaffMember = { id: number; username: string; role: string; active: boolean };
type Room = { room_id: number; status: string };
type Source = 'staff' | 'rooms' | 'bookings' | 'report';

const apiBase = import.meta.env.VITE_API_URL || '';
const money = (value: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(value);
const compactMoney = (value: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
const dateLabel = (value: string) => new Date(value).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' });
const localIso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const surface = { borderRadius: 3, border: '1px solid #e8edf3', boxShadow: '0 12px 32px rgba(22,35,56,0.045)', bgcolor: '#fff' };

function Metric({ label, value, note, icon, accent, loading }: { label: string; value: string; note: string; icon: ReactNode; accent: string; loading: boolean }) {
  return (
    <Paper sx={{ ...surface, height: '100%', p: 2.75, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: accent }} />
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>{label}</Typography>
        <Avatar variant="rounded" sx={{ bgcolor: `${accent}18`, color: accent, width: 42, height: 42, borderRadius: 2 }}>{icon}</Avatar>
      </Stack>
      <Typography sx={{ color: '#162339', fontSize: { xs: 29, xl: 34 }, fontWeight: 800, lineHeight: 1.2, mt: 1.5, fontVariantNumeric: 'tabular-nums' }}>
        {loading ? <CircularProgress size={25} sx={{ color: accent }} /> : value}
      </Typography>
      <Typography variant="caption" sx={{ color: '#8090a5', display: 'block', mt: 0.65 }}>{note}</Typography>
    </Paper>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [bookings, setBookings] = useState<DeskBooking[] | null>(null);
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Source, string>>>({});
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const from = localIso(new Date(now.getFullYear(), now.getMonth(), 1));
    const to = localIso(now);
    const results = await Promise.allSettled([
      axios.get<StaffMember[]>(`${apiBase}/api/staff`),
      axios.get<Room[]>(`${apiBase}/api/rooms`),
      axios.get<DeskBooking[]>(`${apiBase}/api/bookings`),
      fetchReportSummary(from, to),
    ]);
    const sources: Source[] = ['staff', 'rooms', 'bookings', 'report'];
    const nextErrors: Partial<Record<Source, string>> = {};
    results.forEach((result, index) => {
      const source = sources[index];
      if (result.status === 'rejected') nextErrors[source] = `Could not load ${source} data.`;
    });
    setStaff(results[0].status === 'fulfilled' && Array.isArray(results[0].value.data) ? results[0].value.data : null);
    setRooms(results[1].status === 'fulfilled' && Array.isArray(results[1].value.data) ? results[1].value.data : null);
    setBookings(results[2].status === 'fulfilled' && Array.isArray(results[2].value.data) ? results[2].value.data : null);
    setReport(results[3].status === 'fulfilled' ? results[3].value : null);
    setErrors(nextErrors);
    setUpdatedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openBookings = useMemo(() => bookings?.filter((booking) => ['Booked', 'Checked-In'].includes(booking.booking_status)) ?? [], [bookings]);
  const recentBookings = useMemo(() => [...(bookings ?? [])].sort((a, b) => b.booking_id - a.booking_id).slice(0, 5), [bookings]);
  const availableRooms = rooms?.filter((room) => room.status === 'Available').length ?? 0;
  const maintenanceRooms = rooms?.filter((room) => room.status === 'Maintenance').length ?? 0;
  const chart = report?.daily_collections.slice(-10) ?? [];
  const chartMax = Math.max(1, ...chart.map((point) => point.total));
  const activeStaff = staff?.filter((member) => Boolean(member.active)).length ?? 0;

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3.5 }}>
        <Box>
          <Typography variant="overline" sx={{ color: '#ba9228', fontWeight: 800, letterSpacing: 2 }}>PARADISE RESORTS / ADMIN</Typography>
          <Typography variant="h4" sx={{ color: '#162339', fontWeight: 800, letterSpacing: '-0.035em' }}>Dashboard overview</Typography>
          <Typography variant="body2" sx={{ color: '#718096', mt: 0.5 }}>A live view of your properties, reservations, team and payments.</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {updatedAt && <Typography variant="caption" sx={{ color: '#8290a1', display: { xs: 'none', md: 'block' } }}>Updated {updatedAt.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}</Typography>}
          <Button variant="outlined" startIcon={loading ? <CircularProgress size={16} /> : <Refresh />} onClick={() => void load()} disabled={loading} sx={{ borderColor: '#d9e1e9', color: '#334155', bgcolor: '#fff', borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Refresh</Button>
          <Button variant="contained" endIcon={<ArrowForward />} onClick={() => navigate('/system-admin/reports')} sx={{ bgcolor: '#162339', borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#283f5e' } }}>View reports</Button>
        </Stack>
      </Stack>

      {Object.keys(errors).length > 0 && <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>{Object.values(errors).join(' ')} Unavailable metrics are shown as —.</Alert>}

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><Metric label="Active staff" value={staff ? String(activeStaff) : '—'} note={staff ? `${staff.length} total accounts` : 'Team data unavailable'} icon={<PeopleAlt />} accent="#4877bc" loading={loading && !updatedAt} /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><Metric label="Total rooms" value={rooms ? String(rooms.length) : '—'} note={rooms ? `${availableRooms} currently available` : 'Room data unavailable'} icon={<Hotel />} accent="#12a899" loading={loading && !updatedAt} /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><Metric label="Open reservations" value={bookings ? String(openBookings.length) : '—'} note="Booked and checked-in" icon={<CalendarMonth />} accent="#d49e2f" loading={loading && !updatedAt} /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><Metric label="Collected this month" value={report ? money(report.kpis.collected) : '—'} note="Payments received month to date" icon={<Payments />} accent="#8b69c8" loading={loading && !updatedAt} /></Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ ...surface, p: { xs: 2.5, md: 3 }, height: '100%', minHeight: 365 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box><Typography variant="h6" sx={{ color: '#162339', fontWeight: 800 }}>Payment activity</Typography><Typography variant="body2" sx={{ color: '#7b899b' }}>Latest payment days this month · LKR collected</Typography></Box>
              <Avatar variant="rounded" sx={{ bgcolor: '#f2f5fb', color: '#4877bc' }}><AutoGraph /></Avatar>
            </Stack>
            {loading && !updatedAt ? <Box sx={{ height: 245, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box> : !report ? <Box sx={{ height: 245, display: 'grid', placeItems: 'center' }}><Typography color="text.secondary">Payment activity is unavailable.</Typography></Box> : chart.length === 0 ? <Box sx={{ height: 245, display: 'grid', placeItems: 'center', textAlign: 'center' }}><Typography color="text.secondary">No payments have been recorded this month.</Typography></Box> : (
              <Stack direction="row" alignItems="flex-end" spacing={1.5} sx={{ height: 240, mt: 2.5, borderBottom: '1px solid #e8edf3', pb: 1 }}>
                {chart.map((point) => <Box key={point.day} title={`${dateLabel(point.day)}: ${money(point.total)}`} sx={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 0.7 }}>
                  <Typography variant="caption" sx={{ color: '#66768c', fontWeight: 700, fontSize: 10, whiteSpace: 'nowrap' }}>{compactMoney(point.total)}</Typography>
                  <Box sx={{ width: 'min(100%, 48px)', height: `${Math.max(8, point.total / chartMax * 175)}px`, borderRadius: '7px 7px 2px 2px', background: 'linear-gradient(180deg, #dcb54b, #e9dba7)' }} />
                  <Typography variant="caption" sx={{ color: '#7d899b', fontSize: 11, whiteSpace: 'nowrap' }}>{dateLabel(point.day)}</Typography>
                </Box>)}
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ ...surface, p: { xs: 2.5, md: 3 }, height: '100%' }}>
            <Typography variant="h6" sx={{ color: '#162339', fontWeight: 800 }}>Property snapshot</Typography>
            <Typography variant="body2" sx={{ color: '#7b899b', mb: 3 }}>Live room inventory and availability</Typography>
            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}><Typography sx={{ color: '#162339', fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{rooms ? availableRooms : '—'}</Typography><Typography color="text.secondary">available of {rooms ? rooms.length : '—'} rooms</Typography></Stack>
            <LinearProgress variant="determinate" value={rooms?.length ? availableRooms / rooms.length * 100 : 0} sx={{ height: 10, borderRadius: 5, bgcolor: '#edf1f5', '& .MuiLinearProgress-bar': { bgcolor: '#12a899', borderRadius: 5 } }} />
            <Stack spacing={1.4} sx={{ mt: 3, mb: 3 }}>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Available</Typography><Typography variant="body2" fontWeight={700}>{rooms ? availableRooms : '—'}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Maintenance</Typography><Typography variant="body2" fontWeight={700}>{rooms ? maintenanceRooms : '—'}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Other statuses</Typography><Typography variant="body2" fontWeight={700}>{rooms ? rooms.length - availableRooms - maintenanceRooms : '—'}</Typography></Stack>
            </Stack>
            <Button onClick={() => navigate('/system-admin/rooms')} endIcon={<ArrowForward />} sx={{ p: 0, textTransform: 'none', fontWeight: 700 }}>Manage rooms</Button>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ ...surface, p: { xs: 2.5, md: 3 }, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}><Box><Typography variant="h6" sx={{ color: '#162339', fontWeight: 800 }}>Recent reservations</Typography><Typography variant="body2" color="text.secondary">Most recent booking references</Typography></Box><Button endIcon={<ArrowForward />} onClick={() => navigate('/system-admin/bookings')} sx={{ textTransform: 'none', fontWeight: 700 }}>View all</Button></Stack>
            {bookings === null ? <Typography color="text.secondary">Reservations unavailable.</Typography> : recentBookings.length === 0 ? <Typography color="text.secondary">No reservations yet.</Typography> : <Stack>{recentBookings.map((booking) => <Stack key={booking.booking_id} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ py: 1.55, borderTop: '1px solid #eef1f5' }}><Stack direction="row" alignItems="center" spacing={1.5}><Avatar sx={{ bgcolor: '#edf3fa', color: '#3a668f', width: 37, height: 37, fontSize: 13, fontWeight: 800 }}>#{booking.booking_id}</Avatar><Box><Typography variant="body2" sx={{ fontWeight: 700, color: '#243348' }}>{booking.guest_name || 'Guest'}</Typography><Typography variant="caption" color="text.secondary">Room {booking.room_number || '—'} · {booking.branch || 'Unassigned'}</Typography></Box></Stack><Stack direction="row" alignItems="center" spacing={1.5}><Typography variant="caption" color="text.secondary">{booking.check_in_date ? dateLabel(booking.check_in_date) : '—'}</Typography><Chip size="small" label={booking.booking_status} sx={{ fontWeight: 700, bgcolor: booking.booking_status === 'Checked-In' ? '#e7f6f1' : booking.booking_status === 'Cancelled' ? '#fceced' : '#edf3fa', color: booking.booking_status === 'Checked-In' ? '#13866e' : booking.booking_status === 'Cancelled' ? '#bf4c59' : '#3d6b9c' }} /></Stack></Stack>)}</Stack>}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ ...surface, p: { xs: 2.5, md: 3 }, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}><Box><Typography variant="h6" sx={{ color: '#162339', fontWeight: 800 }}>Team at a glance</Typography><Typography variant="body2" color="text.secondary">Staff accounts</Typography></Box><Avatar variant="rounded" sx={{ bgcolor: '#eff4fa', color: '#4877bc' }}><PeopleAlt /></Avatar></Stack>
            {staff === null ? <Typography color="text.secondary">Staff data unavailable.</Typography> : staff.length === 0 ? <Typography color="text.secondary">No staff accounts found.</Typography> : <Stack>{staff.slice(0, 4).map((member) => <Stack key={member.id} direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ py: 1.4, borderTop: '1px solid #eef1f5' }}><Stack direction="row" alignItems="center" spacing={1.2} sx={{ minWidth: 0 }}><Avatar sx={{ bgcolor: '#f0f3f8', color: '#4d6480', width: 34, height: 34, fontSize: 13 }}>{member.username.slice(0, 1).toUpperCase()}</Avatar><Box sx={{ minWidth: 0 }}><Typography variant="body2" noWrap sx={{ fontWeight: 700, color: '#243348' }}>{member.username}</Typography><Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{member.role}</Typography></Box></Stack><Chip size="small" label={member.active ? 'Active' : 'Inactive'} sx={{ bgcolor: member.active ? '#e7f6f1' : '#f1f2f4', color: member.active ? '#13866e' : '#707987', fontWeight: 700 }} /></Stack>)}</Stack>}
            <Button onClick={() => navigate('/system-admin/users')} endIcon={<ArrowForward />} sx={{ p: 0, mt: 2.5, textTransform: 'none', fontWeight: 700 }}>Manage team</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
