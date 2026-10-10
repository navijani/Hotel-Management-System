import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, InputAdornment, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  CreditCard as CreditCardIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addServiceCharge, checkInBooking, checkOutBooking, fetchDeskBooking, fetchDeskServices, paymentMethods, recordPayment,
} from '../../api/reception';
import type { DeskBookingDetail, DeskService, PaymentMethod } from '../../api/reception';
import { currencyFormatter, darkButtonSx, formatDate, formatDateTime, headCellSx, outlineButtonSx, StatusChip, surfaceSx } from './shared';

const todayIso = () => new Date().toISOString().slice(0, 10);

const ReceptionBilling: React.FC = () => {
  const navigate = useNavigate();
  const bookingId = Number(useParams().bookingId);

  const [detail, setDetail] = useState<DeskBookingDetail | null>(null);
  const [services, setServices] = useState<DeskService[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState<{ severity: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [serviceId, setServiceId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [usageDate, setUsageDate] = useState(todayIso());

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');

  const load = useCallback(async () => {
    try {
      const [bookingDetail, catalogue] = await Promise.all([fetchDeskBooking(bookingId), fetchDeskServices(bookingId)]);
      setDetail(bookingDetail);
      setServices(catalogue);
    } catch (error) {
      setAlert({ severity: 'error', message: error instanceof Error ? error.message : 'Unable to load this booking.' });
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      setLoading(false);
      setAlert({ severity: 'error', message: 'Invalid booking.' });
      return;
    }
    void load();
  }, [bookingId, load]);

  // Run a desk action, show its message and reload the invoice.
  const runAction = async (action: () => Promise<{ message: string }>) => {
    setBusy(true);
    try {
      const result = await action();
      setAlert({ severity: 'success', message: result.message });
      await load();
      return true;
    } catch (error) {
      setAlert({ severity: 'error', message: error instanceof Error ? error.message : 'Something went wrong.' });
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>;

  if (!detail) {
    return (
      <Box>
        {alert && <Alert severity={alert.severity} sx={{ mb: 2 }}>{alert.message}</Alert>}
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/reception/bookings')}>Back to bookings</Button>
      </Box>
    );
  }

  const { booking, services: usages, payments } = detail;
  const closed = booking.booking_status === 'Checked-Out' || booking.booking_status === 'Cancelled';
  const settled = booking.outstanding_balance === 0;
  const checkoutBlocked = booking.booking_status !== 'Checked-In' || !settled;
  const checkoutHint = booking.booking_status !== 'Checked-In'
    ? 'Only a checked-in guest can be checked out.'
    : !settled ? 'Clear the balance before checkout.' : 'Complete check-out';

  const handleAddService = async () => {
    const added = await runAction(() => addServiceCharge(bookingId, { service_id: Number(serviceId), quantity: Number(quantity), usage_date: usageDate }));
    if (added) {
      setServiceId('');
      setQuantity('1');
    }
  };

  const handleSavePayment = async () => {
    const saved = await runAction(() => recordPayment(bookingId, { amount_paid: Number(paymentAmount), payment_method: paymentMethod }));
    if (saved) setPaymentOpen(false);
  };

  const openPayment = () => {
    setPaymentAmount(String(booking.outstanding_balance));
    setPaymentMethod('Cash');
    setPaymentOpen(true);
  };

  const paymentValue = Number(paymentAmount);
  const paymentInvalid = !Number.isFinite(paymentValue) || paymentValue <= 0 || paymentValue > booking.outstanding_balance;

  const totals: [string, number, boolean?][] = [
    [`Room (${booking.nights} night${booking.nights > 1 ? 's' : ''} x ${currencyFormatter.format(booking.room_daily_rate)})`, booking.room_total],
    ['Services', booking.service_total],
    ['Tax', booking.tax_amount],
    ['Net total', booking.net_total, true],
    ['Paid', booking.total_paid],
  ];

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/reception/bookings')} sx={{ mb: 2, textTransform: 'none', color: '#1a1a1a' }}>
        Back to bookings
      </Button>
      {alert && <Alert severity={alert.severity} sx={{ mb: 3 }} onClose={() => setAlert(null)}>{alert.message}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, ...surfaceSx }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="overline" sx={{ color: '#9a7620', fontWeight: 700, letterSpacing: 2 }}>Booking #{booking.booking_id}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{booking.guest_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{booking.identification_no}</Typography>
                </Box>
                <StatusChip status={booking.booking_status} />
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">Room</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{booking.room_number}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.room_type} {booking.branch ? `- ${booking.branch}` : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">Stay</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{booking.nights} night{booking.nights > 1 ? 's' : ''}</Typography>
                      <Typography variant="body2" color="text.secondary">{formatDate(booking.check_in_date)} to {formatDate(booking.check_out_date)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, ...surfaceSx }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Itemized services</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headCellSx}>Service</TableCell>
                      <TableCell sx={headCellSx}>Date</TableCell>
                      <TableCell sx={headCellSx}>Qty</TableCell>
                      <TableCell sx={headCellSx} align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          No services charged yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {usages.map((usage) => (
                      <TableRow key={usage.usage_id}>
                        <TableCell>
                          {usage.service_name}
                          <Typography variant="caption" component="div" color="text.secondary">
                            {usage.category}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(usage.usage_date)}</TableCell>
                        <TableCell>{usage.quantity}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {currencyFormatter.format(usage.total_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {!closed && (
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
                  <TextField
                    select
                    size="small"
                    label="Service"
                    value={serviceId}
                    onChange={(event) => setServiceId(event.target.value)}
                    sx={{ flex: 2 }}
                  >
                    {services.map((service) => (
                      <MenuItem key={service.service_id} value={String(service.service_id)}>
                        {service.service_name} ({currencyFormatter.format(service.unit_price)})
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    type="number"
                    label="Qty"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    slotProps={{ htmlInput: { min: 1, step: 1 } }}
                    sx={{ width: 90 }}
                  />
                  <TextField
                    size="small"
                    type="date"
                    label="Date"
                    value={usageDate}
                    onChange={(event) => setUsageDate(event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    disabled={busy || !serviceId || Number(quantity) < 1}
                    onClick={handleAddService}
                    sx={darkButtonSx}
                  >
                    Add charge
                  </Button>
                </Stack>
              )}
            </Paper>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, ...surfaceSx }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Invoice</Typography>
                <Chip label={settled ? 'Settled' : 'Pending payment'} color={settled ? 'success' : 'warning'} size="small" />
              </Stack>
              <Stack spacing={1.2}>
                {totals.map(([label, amount, bold]) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary" sx={bold ? { fontWeight: 700, color: 'text.primary' } : undefined}>{label}</Typography>
                    <Typography sx={{ fontWeight: bold ? 800 : 600 }}>{currencyFormatter.format(amount)}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 2, bgcolor: settled ? 'rgba(76,175,80,0.08)' : 'rgba(244,67,54,0.08)' }}>
                  <Typography sx={{ fontWeight: 800 }}>Outstanding</Typography>
                  <Typography sx={{ fontWeight: 800, color: settled ? 'success.main' : 'error.main' }}>{currencyFormatter.format(booking.outstanding_balance)}</Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, ...surfaceSx }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Payment history</Typography>
              <Stack spacing={1.5}>
                {payments.length === 0 && <Typography variant="body2" color="text.secondary">No payments recorded.</Typography>}
                {payments.map((payment) => (
                  <Box key={payment.payment_id} sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontWeight: 800 }}>{currencyFormatter.format(payment.amount_paid)}</Typography>
                      <Chip size="small" label={payment.payment_method} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">{formatDateTime(payment.payment_date)}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, ...surfaceSx }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Front desk actions</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Checkout stays blocked until the outstanding balance is zero.</Typography>
              <Stack spacing={1.5}>
                {booking.booking_status === 'Booked' && (
                  <Button variant="contained" disabled={busy} onClick={() => runAction(() => checkInBooking(bookingId))} sx={darkButtonSx}>Check in guest</Button>
                )}
                <Button variant="outlined" startIcon={<CreditCardIcon />} disabled={busy || closed || settled} onClick={openPayment} sx={outlineButtonSx}>Record payment</Button>
                <Tooltip title={checkoutHint}>
                  <span>
                    <Button fullWidth variant="contained" startIcon={<CheckCircleIcon />} disabled={busy || checkoutBlocked} onClick={() => runAction(() => checkOutBooking(bookingId))} sx={darkButtonSx}>
                      Complete check-out
                    </Button>
                  </span>
                </Tooltip>
                <Button variant="text" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ textTransform: 'none', color: '#1a1a1a' }}>Print invoice</Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={paymentOpen} onClose={() => setPaymentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record payment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Amount paid"
              type="number"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              error={paymentInvalid}
              helperText={paymentInvalid ? 'Enter an amount up to the outstanding balance.' : ' '}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">LKR</InputAdornment> }, htmlInput: { min: 0, step: 0.01 } }}
            />
            <TextField select label="Payment method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
              {paymentMethods.map((method) => <MenuItem key={method} value={method}>{method}</MenuItem>)}
            </TextField>
            <Alert severity="info">Outstanding balance: {currencyFormatter.format(booking.outstanding_balance)}</Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPaymentOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" disabled={busy || paymentInvalid} onClick={handleSavePayment} sx={darkButtonSx}>{busy ? 'Saving...' : 'Save payment'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReceptionBilling;