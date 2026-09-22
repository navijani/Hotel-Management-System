import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, CreditCard as CreditCardIcon } from '@mui/icons-material';
import { completeBillingCheckout, fetchBillingWorkspace, paymentMethods, recordBillingPayment } from '../../../api/billing';
import type { BillingPaymentRequest, BillingWorkspace, DetailedServiceUsage, Payment, PaymentMethod } from '../../../types';
import BillingPageShell from './BillingPageShell';

const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  maximumFractionDigits: 0,
});

const surfaceSx = {
  borderRadius: 3,
  border: '1px solid rgba(0,0,0,0.05)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
} as const;

const dateTimeFormatter = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const summarizePayments = (payments: Payment[], bookingId: number) =>
  payments
    .filter((payment) => payment.booking_id === bookingId)
    .sort((left, right) => new Date(right.payment_date).getTime() - new Date(left.payment_date).getTime());

const BillingInvoice: React.FC = () => {
  const [workspace, setWorkspace] = useState<BillingWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [unpaidOnly, setUnpaidOnly] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ severity: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [paymentForm, setPaymentForm] = useState<BillingPaymentRequest>({ amount_paid: 0, payment_method: 'Cash', payment_notes: '' });

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const data = await fetchBillingWorkspace();
      setWorkspace(data);
      setSelectedBookingId(data.bookings.find((booking) => booking.outstanding_balance > 0)?.booking_id ?? data.bookings[0]?.booking_id ?? null);
      setLoading(false);
    })();
  }, []);

  const bookings = workspace?.bookings ?? [];
  const selectedBooking = bookings.find((booking) => booking.booking_id === selectedBookingId) ?? null;

  useEffect(() => {
    if (!selectedBooking) {
      return;
    }

    setPaymentForm({
      amount_paid: selectedBooking.outstanding_balance,
      payment_method: 'Cash',
      payment_notes: '',
    });
  }, [selectedBooking?.booking_id]);

  const selectedServiceUsage: DetailedServiceUsage[] = useMemo(
    () => (workspace?.service_usages ?? []).filter((usage) => usage.booking_id === selectedBooking?.booking_id),
    [selectedBooking?.booking_id, workspace?.service_usages],
  );

  const selectedPayments = useMemo(
    () => summarizePayments(workspace?.payments ?? [], selectedBooking?.booking_id ?? -1),
    [selectedBooking?.booking_id, workspace?.payments],
  );

  const checkoutBlocked = !selectedBooking || selectedBooking.outstanding_balance > 0 || selectedBooking.booking_status === 'Checked-Out';
  const roomChargeTotal = selectedBooking ? selectedBooking.nights * selectedBooking.room_daily_rate : 0;

  const handleRecordPayment = async () => {
    if (!selectedBooking) {
      return;
    }

    setPaymentSubmitting(true);
    try {
      const payment = await recordBillingPayment(selectedBooking.booking_id, paymentForm);
      setWorkspace((currentWorkspace) => {
        if (!currentWorkspace) {
          return currentWorkspace;
        }

        return {
          ...currentWorkspace,
          bookings: currentWorkspace.bookings.map((booking) => {
            if (booking.booking_id !== selectedBooking.booking_id) {
              return booking;
            }

            const nextOutstanding = Math.max(0, booking.outstanding_balance - payment.amount_paid);
            return {
              ...booking,
              total_paid: booking.total_paid + payment.amount_paid,
              outstanding_balance: nextOutstanding,
              invoice_status: nextOutstanding === 0 ? 'Paid' : 'Partial',
            };
          }),
          payments: [payment, ...currentWorkspace.payments],
        };
      });
      setAlert({ severity: 'success', message: 'Payment recorded successfully.' });
      setPaymentDialogOpen(false);
    } catch {
      setAlert({ severity: 'error', message: 'Unable to record payment right now.' });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedBooking || selectedBooking.outstanding_balance > 0) {
      return;
    }

    setCheckoutSubmitting(true);
    try {
      await completeBillingCheckout(selectedBooking.booking_id);
      setWorkspace((currentWorkspace) => {
        if (!currentWorkspace) {
          return currentWorkspace;
        }

        return {
          ...currentWorkspace,
          bookings: currentWorkspace.bookings.map((booking) =>
            booking.booking_id === selectedBooking.booking_id ? { ...booking, booking_status: 'Checked-Out' } : booking,
          ),
        };
      });
      setAlert({ severity: 'success', message: 'Checkout completed.' });
    } catch {
      setAlert({ severity: 'error', message: 'Unable to complete checkout right now.' });
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  return (
    <BillingPageShell
      activePage="invoice"
      title="Invoice & Checkout"
      subtitle="Review a booking, apply payments, and complete checkout only when the balance is fully settled."
    >
      {alert && (
        <Alert severity={alert.severity} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ p: 3, ...surfaceSx }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Guest billing summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select a booking to inspect its invoice details.
                </Typography>
              </Box>
              <FormControlLabel
                control={<Switch checked={unpaidOnly} onChange={(event) => setUnpaidOnly(event.target.checked)} />}
                label="Unpaid only"
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Guest</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Balance</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                        Loading bookings...
                      </TableCell>
                    </TableRow>
                  ) : (unpaidOnly ? bookings.filter((booking) => booking.outstanding_balance > 0) : bookings).map((booking) => (
                    <TableRow
                      key={booking.booking_id}
                      hover
                      selected={booking.booking_id === selectedBooking?.booking_id}
                      onClick={() => setSelectedBookingId(booking.booking_id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography sx={{ fontWeight: 700 }}>{booking.guest_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.identification_no}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {booking.room_number}
                        <Typography variant="caption" component="div" color="text.secondary">
                          {booking.room_type}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: booking.outstanding_balance === 0 ? 'success.main' : 'error.main' }}>
                        {currencyFormatter.format(booking.outstanding_balance)}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={booking.outstanding_balance === 0 ? 'Settled / Paid' : 'Outstanding Dues'} color={booking.outstanding_balance === 0 ? 'success' : 'warning'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, ...surfaceSx }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Selected invoice
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current billing breakdown.
                  </Typography>
                </Box>
                {selectedBooking && (
                  <Chip label={selectedBooking.outstanding_balance === 0 ? 'Ready to close' : 'Pending payment'} color={selectedBooking.outstanding_balance === 0 ? 'success' : 'warning'} />
                )}
              </Box>

              {selectedBooking ? (
                <>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 14px 28px rgba(0,0,0,0.08)' } }}>
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            Guest
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {selectedBooking.guest_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedBooking.identification_no}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 14px 28px rgba(0,0,0,0.08)' } }}>
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            Stay
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {selectedBooking.room_number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedBooking.branch} • {selectedBooking.nights} nights
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2, borderColor: 'rgba(0,0,0,0.08)' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                      Room charges
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {selectedBooking.nights} nights × {currencyFormatter.format(selectedBooking.room_daily_rate)}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {currencyFormatter.format(roomChargeTotal)}
                      </Typography>
                    </Box>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2, borderColor: 'rgba(0,0,0,0.08)' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                      Itemized services
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Qty</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedServiceUsage.map((usage) => (
                            <TableRow key={usage.usage_id}>
                              <TableCell>{usage.service_name}</TableCell>
                              <TableCell>{dateTimeFormatter.format(new Date(usage.usage_date))}</TableCell>
                              <TableCell>{usage.quantity}</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>{currencyFormatter.format(usage.total_price)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderColor: 'rgba(0,0,0,0.08)' }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                          <Typography variant="caption" color="text.secondary">
                            Net total
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {currencyFormatter.format(selectedBooking.net_total)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: selectedBooking.outstanding_balance === 0 ? 'rgba(76,175,80,0.08)' : 'rgba(244,67,54,0.08)' }}>
                          <Typography variant="caption" color="text.secondary">
                            Outstanding
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: selectedBooking.outstanding_balance === 0 ? 'success.main' : 'error.main' }}>
                            {currencyFormatter.format(selectedBooking.outstanding_balance)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </>
              ) : (
                <Typography color="text.secondary">No booking selected.</Typography>
              )}
            </Paper>

            <Paper sx={{ p: 3, ...surfaceSx }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Payment history
              </Typography>
              <Stack spacing={1.5}>
                {selectedPayments.map((payment) => (
                  <Box key={payment.payment_id} sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontWeight: 800 }}>{currencyFormatter.format(payment.amount_paid)}</Typography>
                      <Chip size="small" label={payment.payment_method} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {dateTimeFormatter.format(new Date(payment.payment_date))}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, ...surfaceSx }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Checkout gatekeeping
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Checkout remains blocked until the outstanding balance is zero.
              </Typography>
              <Stack spacing={1.5}>
                <Button variant="outlined" startIcon={<CreditCardIcon />} onClick={() => setPaymentDialogOpen(true)} sx={{ borderColor: '#1a1a1a', color: '#1a1a1a', '&:hover': { borderColor: '#d4af37', color: '#d4af37', bgcolor: 'rgba(212,175,55,0.08)' } }}>
                  Record payment
                </Button>
                <Tooltip title={checkoutBlocked ? 'Clear the balance before checkout.' : 'Complete check-out'}>
                  <span>
                    <Button variant="contained" fullWidth startIcon={<CheckCircleIcon />} disabled={checkoutBlocked} onClick={handleCheckout} sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#d4af37' } }}>
                      {checkoutSubmitting ? 'Processing...' : 'Complete Check-Out'}
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record payment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Amount Paid"
              type="number"
              value={paymentForm.amount_paid}
              onChange={(event) => setPaymentForm((current) => ({ ...current, amount_paid: Number(event.target.value) }))}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">LKR</InputAdornment> }, htmlInput: { min: 0, step: 0.01 } }}
            />
            <TextField select label="Payment Method" value={paymentForm.payment_method} onChange={(event) => setPaymentForm((current) => ({ ...current, payment_method: event.target.value as PaymentMethod }))}>
              {paymentMethods.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </TextField>
            <TextField multiline minRows={3} label="Payment Notes" value={paymentForm.payment_notes} onChange={(event) => setPaymentForm((current) => ({ ...current, payment_notes: event.target.value }))} />
            {selectedBooking && <Alert severity="info">Outstanding balance: {currencyFormatter.format(selectedBooking.outstanding_balance)}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPaymentDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleRecordPayment} disabled={paymentSubmitting || !selectedBooking}>
            {paymentSubmitting ? 'Saving...' : 'Save payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </BillingPageShell>
  );
};

export default BillingInvoice;