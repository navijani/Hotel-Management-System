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
  Divider,
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
import {
  CheckCircle as CheckCircleIcon,
  CreditCard as CreditCardIcon,
  Dashboard as DashboardIcon,
  Payment as PaymentIcon,
  ReceiptLong as ReceiptIcon,
  Savings as SavingsIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import {
  completeBillingCheckout,
  fetchBillingWorkspace,
  paymentMethods,
  recordBillingPayment,
} from '../../../api/billing';
import type {
  BillingPaymentRequest,
  BillingWorkspace,
  BookingBillingSummary,
  DetailedServiceUsage,
  Payment,
  PaymentMethod,
} from '../../../types';

const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const dateFormatter = new Intl.DateTimeFormat('en-LK', {
  dateStyle: 'medium',
});

const summarizePayments = (payments: Payment[], bookingId: number) =>
  payments
    .filter((payment) => payment.booking_id === bookingId)
    .sort((left, right) => new Date(right.payment_date).getTime() - new Date(left.payment_date).getTime());

const BillingDashboard: React.FC = () => {
  const [workspace, setWorkspace] = useState<BillingWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [unpaidOnly, setUnpaidOnly] = useState(true);
  const [alert, setAlert] = useState<{ severity: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState<BillingPaymentRequest>({
    amount_paid: 0,
    payment_method: 'Cash',
    payment_notes: '',
  });

  useEffect(() => {
    const loadWorkspace = async () => {
      setLoading(true);
      const data = await fetchBillingWorkspace();
      setWorkspace(data);
      setSelectedBookingId((currentBookingId) => currentBookingId ?? data.bookings.find((booking) => booking.outstanding_balance > 0)?.booking_id ?? data.bookings[0]?.booking_id ?? null);
      setLoading(false);
    };

    void loadWorkspace();
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

  const filteredBookings = useMemo(
    () => (unpaidOnly ? bookings.filter((booking) => booking.outstanding_balance > 0) : bookings),
    [bookings, unpaidOnly],
  );

  const selectedServiceUsage: DetailedServiceUsage[] = useMemo(
    () => (workspace?.service_usages ?? []).filter((usage) => usage.booking_id === selectedBooking?.booking_id),
    [selectedBooking?.booking_id, workspace?.service_usages],
  );

  const selectedPayments = useMemo(
    () => summarizePayments(workspace?.payments ?? [], selectedBooking?.booking_id ?? -1),
    [selectedBooking?.booking_id, workspace?.payments],
  );

  const dashboardTotals = useMemo(() => {
    const totalRoom = bookings.reduce((sum, booking) => sum + booking.room_total, 0);
    const totalService = bookings.reduce((sum, booking) => sum + booking.service_total, 0);
    const totalOutstanding = bookings.reduce((sum, booking) => sum + booking.outstanding_balance, 0);
    const totalCollected = bookings.reduce((sum, booking) => sum + booking.total_paid, 0);
    const settledBookings = bookings.filter((booking) => booking.outstanding_balance === 0).length;

    return { totalRoom, totalService, totalOutstanding, totalCollected, settledBookings };
  }, [bookings]);

  const statusChip = (booking: BookingBillingSummary) => {
    if (booking.outstanding_balance === 0) {
      return <Chip label="Settled / Paid" color="success" size="small" icon={<CheckCircleIcon />} />;
    }

    return <Chip label="Outstanding Dues" color="warning" size="small" icon={<WarningIcon />} />;
  };

  const updateWorkspaceBooking = (bookingId: number, updater: (booking: BookingBillingSummary) => BookingBillingSummary) => {
    setWorkspace((currentWorkspace) => {
      if (!currentWorkspace) {
        return currentWorkspace;
      }

      return {
        ...currentWorkspace,
        bookings: currentWorkspace.bookings.map((booking) => (booking.booking_id === bookingId ? updater(booking) : booking)),
      };
    });
  };

  const handleOpenPaymentDialog = () => {
    if (!selectedBooking) {
      setAlert({ severity: 'info', message: 'Select a booking first.' });
      return;
    }

    setPaymentForm({
      amount_paid: selectedBooking.outstanding_balance,
      payment_method: 'Cash',
      payment_notes: '',
    });
    setPaymentDialogOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedBooking) {
      return;
    }

    if (paymentForm.amount_paid <= 0) {
      setAlert({ severity: 'error', message: 'Enter a valid payment amount.' });
      return;
    }

    if (paymentForm.amount_paid > selectedBooking.outstanding_balance) {
      setAlert({ severity: 'error', message: 'Payment cannot exceed the outstanding balance.' });
      return;
    }

    setPaymentSubmitting(true);
    try {
      const payment = await recordBillingPayment(selectedBooking.booking_id, paymentForm);
      setWorkspace((currentWorkspace) => {
        if (!currentWorkspace) {
          return currentWorkspace;
        }

        const updatedBookings = currentWorkspace.bookings.map((booking) => {
          if (booking.booking_id !== selectedBooking.booking_id) {
            return booking;
          }

          const nextTotalPaid = booking.total_paid + payment.amount_paid;
          const nextOutstanding = Math.max(0, booking.outstanding_balance - payment.amount_paid);
          const nextInvoiceStatus: BookingBillingSummary['invoice_status'] = nextOutstanding === 0 ? 'Paid' : 'Partial';

          return {
            ...booking,
            total_paid: nextTotalPaid,
            outstanding_balance: nextOutstanding,
            invoice_status: nextInvoiceStatus,
          };
        });

        return {
          ...currentWorkspace,
          bookings: updatedBookings,
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
      const response = await completeBillingCheckout(selectedBooking.booking_id);
      updateWorkspaceBooking(selectedBooking.booking_id, (booking) => ({
        ...booking,
        booking_status: 'Checked-Out',
      }));
      setAlert({ severity: 'success', message: response.message || 'Checkout completed successfully.' });
    } catch {
      setAlert({ severity: 'error', message: 'Unable to complete checkout right now.' });
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const roomChargeTotal = selectedBooking ? selectedBooking.nights * selectedBooking.room_daily_rate : 0;
  const checkoutBlocked = !selectedBooking || selectedBooking.outstanding_balance > 0 || selectedBooking.booking_status === 'Checked-Out';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e' }}>
            Billing, Invoicing & Checkout
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manager workspace for guest invoices, payments, settlement tracking, and checkout control.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<PaymentIcon />} onClick={handleOpenPaymentDialog} disabled={!selectedBooking}>
            Record payment
          </Button>
          <Tooltip
            title={
              checkoutBlocked
                ? selectedBooking?.outstanding_balance
                  ? `Settle ${currencyFormatter.format(selectedBooking.outstanding_balance)} before checkout.`
                  : 'Select a booking to continue.'
                : 'Complete check-out'
            }
          >
            <span>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                disabled={checkoutBlocked || checkoutSubmitting}
                onClick={handleCheckout}
              >
                {checkoutSubmitting ? 'Processing...' : 'Complete Check-Out'}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {alert && (
        <Alert severity={alert.severity} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                  Outstanding due
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e' }}>
                  {currencyFormatter.format(dashboardTotals.totalOutstanding)}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(244, 67, 54, 0.12)', p: 2, borderRadius: '50%', color: 'error.main' }}>
                <WarningIcon fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                  Collected revenue
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e' }}>
                  {currencyFormatter.format(dashboardTotals.totalCollected)}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(76, 175, 80, 0.12)', p: 2, borderRadius: '50%', color: 'success.main' }}>
                <SavingsIcon fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                  Room charges
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e' }}>
                  {currencyFormatter.format(dashboardTotals.totalRoom)}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(79, 172, 254, 0.12)', p: 2, borderRadius: '50%', color: '#4facfe' }}>
                <ReceiptIcon fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                  Settled bookings
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e' }}>
                  {dashboardTotals.settledBookings}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(33, 150, 243, 0.12)', p: 2, borderRadius: '50%', color: 'info.main' }}>
                <CheckCircleIcon fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Guest Billing Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the filter to show only bookings with outstanding balances.
            </Typography>
          </Box>

          <FormControlLabel
            control={<Switch checked={unpaidOnly} onChange={(event) => setUnpaidOnly(event.target.checked)} />}
            label="Unpaid balances only"
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Guest</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Booking</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Check-In / Check-Out</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Balance</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    Loading billing data...
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    No bookings match the current filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => {
                  const isSelected = booking.booking_id === selectedBooking?.booking_id;

                  return (
                    <TableRow
                      key={booking.booking_id}
                      hover
                      selected={isSelected}
                      onClick={() => setSelectedBookingId(booking.booking_id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>{booking.guest_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.identification_no}
                        </Typography>
                      </TableCell>
                      <TableCell>{booking.booking_id}</TableCell>
                      <TableCell>
                        {booking.room_number}
                        <Typography component="div" variant="caption" color="text.secondary">
                          {booking.room_type}
                        </Typography>
                      </TableCell>
                      <TableCell>{booking.branch}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{dateFormatter.format(new Date(booking.check_in_at))}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          to {dateFormatter.format(new Date(booking.check_out_at))}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{currencyFormatter.format(booking.outstanding_balance)}</TableCell>
                      <TableCell>{statusChip(booking)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Invoice #{selectedBooking?.booking_id ?? 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Billing breakdown for the selected booking.
                </Typography>
              </Box>

              {selectedBooking && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={selectedBooking.branch} color="info" />
                  <Chip label={selectedBooking.room_type} variant="outlined" />
                  {statusChip(selectedBooking)}
                </Box>
              )}
            </Box>

            {selectedBooking ? (
              <>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          Guest name
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {selectedBooking.guest_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID No. {selectedBooking.identification_no}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          Stay details
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {selectedBooking.room_number} - {selectedBooking.room_type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedBooking.branch} branch • {selectedBooking.nights} nights
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">
                          Check-in / Check-out
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {dateTimeFormatter.format(new Date(selectedBooking.check_in_at))}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Departure {dateTimeFormatter.format(new Date(selectedBooking.check_out_at))}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#fcfcfd', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Itemized room charges
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {selectedBooking.nights} nights × {currencyFormatter.format(selectedBooking.room_daily_rate)} nightly rate
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Room invoice total
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {currencyFormatter.format(roomChargeTotal)}
                    </Typography>
                  </Box>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Itemized service usage
                    </Typography>
                    <Chip label={`${selectedServiceUsage.length} services`} size="small" />
                  </Box>

                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Service</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Unit price</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Subtotal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedServiceUsage.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                              No service usage has been recorded for this booking.
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedServiceUsage.map((usage) => (
                            <TableRow key={usage.usage_id}>
                              <TableCell>
                                <Typography sx={{ fontWeight: 600 }}>{usage.service_name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {usage.branch}
                                </Typography>
                              </TableCell>
                              <TableCell>{dateTimeFormatter.format(new Date(usage.usage_date))}</TableCell>
                              <TableCell>{usage.quantity}</TableCell>
                              <TableCell>{currencyFormatter.format(usage.unit_price_at_usage)}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{currencyFormatter.format(usage.total_price)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    Financial totals
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                        <Typography variant="caption" color="text.secondary">Room total</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{currencyFormatter.format(selectedBooking.room_total)}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                        <Typography variant="caption" color="text.secondary">Service total</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{currencyFormatter.format(selectedBooking.service_total)}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                        <Typography variant="caption" color="text.secondary">Tax</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{currencyFormatter.format(selectedBooking.tax_amount)}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                        <Typography variant="caption" color="text.secondary">Discounts</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{currencyFormatter.format(selectedBooking.discount_amount)}</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(79,172,254,0.08)' }}>
                        <Typography variant="caption" color="text.secondary">Net total</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{currencyFormatter.format(selectedBooking.net_total)}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(76,175,80,0.08)' }}>
                        <Typography variant="caption" color="text.secondary">Total paid</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{currencyFormatter.format(selectedBooking.total_paid)}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: selectedBooking.outstanding_balance === 0 ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.08)' }}>
                        <Typography variant="caption" color="text.secondary">Outstanding balance</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: selectedBooking.outstanding_balance === 0 ? 'success.main' : 'error.main' }}>
                          {currencyFormatter.format(selectedBooking.outstanding_balance)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </>
            ) : (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <DashboardIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  No booking selected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pick a booking from the summary table to inspect invoice and checkout details.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Payment history
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Past payments attached to the selected booking.
              </Typography>

              <Stack spacing={2}>
                {selectedPayments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No payments recorded yet.
                  </Typography>
                ) : (
                  selectedPayments.map((payment) => (
                    <Box key={payment.payment_id} sx={{ p: 2, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{currencyFormatter.format(payment.amount_paid)}</Typography>
                        <Chip size="small" label={payment.payment_method} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {dateTimeFormatter.format(new Date(payment.payment_date))}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                        {payment.payment_notes}
                      </Typography>
                    </Box>
                  ))
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                Checkout gatekeeping
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Check-out can only be completed when the outstanding balance is zero.
              </Typography>

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Selected balance</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{currencyFormatter.format(selectedBooking?.outstanding_balance ?? 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Checkout status</Typography>
                  <Chip
                    size="small"
                    label={selectedBooking?.outstanding_balance === 0 ? 'Ready to checkout' : 'Blocked by dues'}
                    color={selectedBooking?.outstanding_balance === 0 ? 'success' : 'warning'}
                  />
                </Box>
                <Button variant="outlined" onClick={handleOpenPaymentDialog} startIcon={<CreditCardIcon />}>
                  Add partial or full payment
                </Button>
                <Tooltip
                  title={
                    checkoutBlocked
                      ? selectedBooking?.outstanding_balance
                        ? `Outstanding dues of ${currencyFormatter.format(selectedBooking.outstanding_balance)} must be cleared.`
                        : 'Select a booking first.'
                      : 'Complete the checkout process'
                  }
                >
                  <span>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<CheckCircleIcon />}
                      disabled={checkoutBlocked}
                      onClick={handleCheckout}
                    >
                      Complete Check-Out
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Monthly Revenue by Branch
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Revenue is split between room charges and service charges for each branch.
            </Typography>
          </Box>

          <Chip icon={<TrendingUpIcon />} label={`${currencyFormatter.format(dashboardTotals.totalCollected)} collected`} color="info" variant="outlined" />
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {workspace?.monthly_revenue.map((branch) => (
            <Grid key={branch.branch} size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
                    {branch.branch}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    {currencyFormatter.format(branch.total_revenue)}
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Room charges</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{currencyFormatter.format(branch.room_charges)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Service charges</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{currencyFormatter.format(branch.service_charges)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Bookings</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{branch.booking_count}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Room charges</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Service charges</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total revenue</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Bookings</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(workspace?.monthly_revenue ?? []).map((branch) => (
                <TableRow key={branch.branch}>
                  <TableCell sx={{ fontWeight: 600 }}>{branch.branch}</TableCell>
                  <TableCell>{currencyFormatter.format(branch.room_charges)}</TableCell>
                  <TableCell>{currencyFormatter.format(branch.service_charges)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{currencyFormatter.format(branch.total_revenue)}</TableCell>
                  <TableCell>{branch.booking_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Record Payment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Amount Paid"
              type="number"
              value={paymentForm.amount_paid}
              onChange={(event) => setPaymentForm((current) => ({ ...current, amount_paid: Number(event.target.value) }))}
              slotProps={{
                input: { startAdornment: <InputAdornment position="start">LKR</InputAdornment> },
                htmlInput: { min: 0, step: 0.01 },
              }}
            />
            <TextField
              select
              label="Payment Method"
              value={paymentForm.payment_method}
              onChange={(event) => setPaymentForm((current) => ({ ...current, payment_method: event.target.value as PaymentMethod }))}
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Payment Notes"
              multiline
              minRows={3}
              value={paymentForm.payment_notes}
              onChange={(event) => setPaymentForm((current) => ({ ...current, payment_notes: event.target.value }))}
              placeholder="Receipt reference, partial payment notes, or cashier comment"
            />

            {selectedBooking && (
              <Alert severity="info">
                Outstanding balance: {currencyFormatter.format(selectedBooking.outstanding_balance)}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPaymentDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleRecordPayment} variant="contained" disabled={paymentSubmitting || !selectedBooking}>
            {paymentSubmitting ? 'Saving...' : 'Save payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingDashboard;