import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import {
  AttachMoney, Download as DownloadIcon, Hotel, Payments, TrendingUp, WarningAmber,
} from '@mui/icons-material';
import { fetchReportSummary } from '../../api/reception';
import type { ReportSummary } from '../../api/reception';

const currencyFormatter = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 });

const cardSx = { borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' } as const;
const headSx = { fontWeight: 'bold' } as const;

const iso = (date: Date) => date.toISOString().slice(0, 10);
const daysAgo = (days: number) => iso(new Date(Date.now() - days * 86400000));

const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
  <Card sx={{ height: '100%', ...cardSx }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>{title}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>{value}</Typography>
      </Box>
      <Box sx={{ bgcolor: `${color}15`, p: 2, borderRadius: '50%', color }}>{icon}</Box>
    </CardContent>
  </Card>
);

// Simple horizontal bar so no chart library is needed.
const Bar = ({ value, max, color = '#4facfe' }: { value: number; max: number; color?: string }) => (
  <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#eef2f7', overflow: 'hidden' }}>
    <Box sx={{ height: '100%', width: `${max > 0 ? Math.max(2, (value / max) * 100) : 0}%`, bgcolor: color, borderRadius: 4 }} />
  </Box>
);

const downloadCsv = (filename: string, rows: (string | number)[][]) => {
  const escape = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;
  const blob = new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const presets = [
  { label: 'Last 7 days', from: () => daysAgo(6) },
  { label: 'Last 30 days', from: () => daysAgo(29) },
  { label: 'Last 90 days', from: () => daysAgo(89) },
  { label: 'This year', from: () => `${new Date().getFullYear()}-01-01` },
];

const Reports: React.FC = () => {
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(iso(new Date()));
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!from || !to || from > to) {
      setError('The start date must be on or before the end date.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setReport(await fetchReportSummary(from, to));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load the report.');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxDaily = useMemo(() => Math.max(0, ...(report?.daily_collections ?? []).map((entry) => entry.total)), [report]);
  const maxBranch = useMemo(() => Math.max(0, ...(report?.by_branch ?? []).map((entry) => entry.collected)), [report]);
  const maxService = useMemo(() => Math.max(0, ...(report?.top_services ?? []).map((entry) => entry.revenue)), [report]);

  const exportBranches = () => {
    if (!report) return;
    downloadCsv(`branch-revenue_${report.range.from}_to_${report.range.to}.csv`, [
      ['Branch', 'Bookings', 'Room charges', 'Service charges', 'Collected', 'Outstanding'],
      ...report.by_branch.map((row) => [row.branch, row.bookings, row.room_charges, row.service_charges, row.collected, row.outstanding]),
    ]);
  };

  const kpis = report?.kpis;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e' }}>Reports</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Revenue, occupancy and outstanding dues from the front desk billing records.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />} disabled={!report || report.by_branch.length === 0} onClick={exportBranches} sx={{ textTransform: 'none', borderRadius: 2 }}>
          Export branch table (CSV)
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3, ...cardSx }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' } }}>
          <TextField type="date" size="small" label="From" value={from} onChange={(event) => setFrom(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField type="date" size="small" label="To" value={to} onChange={(event) => setTo(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
            {presets.map((preset) => (
              <Chip key={preset.label} label={preset.label} variant="outlined" onClick={() => { setFrom(preset.from()); setTo(iso(new Date())); }} />
            ))}
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          Money collected is counted by payment date. Bookings, room and service charges are counted by check-in date.
        </Typography>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {loading && <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>}

      {!loading && report && kpis && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Collected" value={currencyFormatter.format(kpis.collected)} icon={<AttachMoney fontSize="large" />} color="#43e97b" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Billed (incl. tax)" value={currencyFormatter.format(kpis.billed)} icon={<Payments fontSize="large" />} color="#4facfe" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Outstanding" value={currencyFormatter.format(kpis.outstanding)} icon={<WarningAmber fontSize="large" />} color="#fa709a" /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Occupancy now" value={`${kpis.occupancy_percent}%`} icon={<Hotel fontSize="large" />} color="#00f2fe" /></Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3, height: '100%', ...cardSx }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>Daily collections</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{kpis.bookings} booking(s) in range - average stay {kpis.avg_nights} night(s)</Typography>
                {report.daily_collections.length === 0 ? (
                  <Typography color="text.secondary">No payments in this range.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 200, overflowX: 'auto' }}>
                    {report.daily_collections.map((entry) => (
                      <Box key={entry.day} title={`${entry.day}: ${currencyFormatter.format(entry.total)}`} sx={{ flex: '1 0 14px', minWidth: 14, maxWidth: 40, textAlign: 'center' }}>
                        <Box sx={{ height: `${Math.max(2, (entry.total / maxDaily) * 170)}px`, bgcolor: '#4facfe', borderRadius: '4px 4px 0 0' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>{entry.day.slice(5)}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, height: '100%', ...cardSx }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Revenue mix</Typography>
                <Stack spacing={1.2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography color="text.secondary">Room charges</Typography><Typography sx={{ fontWeight: 700 }}>{currencyFormatter.format(kpis.room_revenue)}</Typography></Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography color="text.secondary">Service charges</Typography><Typography sx={{ fontWeight: 700 }}>{currencyFormatter.format(kpis.service_revenue)}</Typography></Box>
                </Stack>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 3, mb: 1 }}>Payment methods</Typography>
                <Stack spacing={1.2}>
                  {report.payment_methods.length === 0 && <Typography variant="body2" color="text.secondary">No payments.</Typography>}
                  {report.payment_methods.map((entry) => (
                    <Box key={entry.method}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{entry.method} ({entry.payments})</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{currencyFormatter.format(entry.total)}</Typography>
                      </Box>
                      <Bar value={entry.total} max={kpis.collected} color="#43e97b" />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mb: 3, ...cardSx }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Revenue by branch</Typography>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={headSx}>Branch</TableCell>
                    <TableCell sx={headSx}>Bookings</TableCell>
                    <TableCell sx={headSx}>Room charges</TableCell>
                    <TableCell sx={headSx}>Service charges</TableCell>
                    <TableCell sx={headSx}>Collected</TableCell>
                    <TableCell sx={headSx}>Outstanding</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.by_branch.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No bookings in this range.</TableCell></TableRow>}
                  {report.by_branch.map((row) => (
                    <TableRow key={row.branch} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{row.branch}</TableCell>
                      <TableCell>{row.bookings}</TableCell>
                      <TableCell>{currencyFormatter.format(row.room_charges)}</TableCell>
                      <TableCell>{currencyFormatter.format(row.service_charges)}</TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>{currencyFormatter.format(row.collected)}</Typography>
                        <Bar value={row.collected} max={maxBranch} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: row.outstanding > 0 ? 'error.main' : 'success.main' }}>{currencyFormatter.format(row.outstanding)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: '100%', ...cardSx }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Top services</Typography>
                <Stack spacing={1.5}>
                  {report.top_services.length === 0 && <Typography variant="body2" color="text.secondary">No services charged in this range.</Typography>}
                  {report.top_services.map((service) => (
                    <Box key={service.service_name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{service.service_name} <Typography component="span" variant="caption" color="text.secondary">x{service.quantity}</Typography></Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{currencyFormatter.format(service.revenue)}</Typography>
                      </Box>
                      <Bar value={service.revenue} max={maxService} color="#fa709a" />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: '100%', ...cardSx }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Bookings & rooms</Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Booking status (by check-in date)</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 3 }}>
                  {report.booking_statuses.map((entry) => <Chip key={entry.status} label={`${entry.status}: ${entry.count}`} />)}
                  {report.booking_statuses.length === 0 && <Typography variant="body2" color="text.secondary">No bookings.</Typography>}
                </Stack>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Rooms right now ({kpis.total_rooms} total)</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  {report.room_status.map((entry) => <Chip key={entry.status} variant="outlined" label={`${entry.status}: ${entry.count}`} />)}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, ...cardSx }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUp sx={{ color: '#fa709a' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Largest outstanding balances</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={headSx}>Booking</TableCell>
                    <TableCell sx={headSx}>Guest</TableCell>
                    <TableCell sx={headSx}>Room</TableCell>
                    <TableCell sx={headSx}>Branch</TableCell>
                    <TableCell sx={headSx}>Net total</TableCell>
                    <TableCell sx={headSx}>Paid</TableCell>
                    <TableCell sx={headSx}>Outstanding</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.outstanding_bookings.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>No outstanding balances.</TableCell></TableRow>}
                  {report.outstanding_bookings.map((row) => (
                    <TableRow key={row.booking_id} hover>
                      <TableCell sx={{ fontWeight: 800 }}>#{row.booking_id}</TableCell>
                      <TableCell>{row.guest_name}</TableCell>
                      <TableCell>{row.room_number}</TableCell>
                      <TableCell>{row.branch}</TableCell>
                      <TableCell>{currencyFormatter.format(row.net_total)}</TableCell>
                      <TableCell>{currencyFormatter.format(row.total_paid)}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'error.main' }}>{currencyFormatter.format(row.outstanding_balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Reports;
