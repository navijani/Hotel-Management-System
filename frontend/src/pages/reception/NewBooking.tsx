import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Grid, Paper, Stepper, Step, StepLabel, CircularProgress, Alert,
  Divider, CardMedia, Chip, MenuItem, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel,
} from '@mui/material';
import {
  MeetingRoom as MeetingRoomIcon,
  Hotel as HotelIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  LocalAtm as LocalAtmIcon,
  PointOfSale as PointOfSaleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { PickerDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

declare global {
  interface Window {
    payhere?: any;
  }
}

interface RoomRow {
  room_id: number;
  room_number: string;
  type: string;
  price_per_night: number | string;
  status: string;
  image?: string;
  bed_type?: string;
  discount?: number | null;
}

type PaymentMethodType = 'CASH' | 'CARD' | 'PAYHERE';

const fallbackImage = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop';

const NewBooking: React.FC = () => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [payhereOrderId, setPayhereOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CASH');
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [bookedDates, setBookedDates] = useState<{ start: Dayjs; end: Dayjs }[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    identificationNo: '',
    checkInDate: null as Dayjs | null,
    checkOutDate: null as Dayjs | null,
    roomType: '',
    roomId: null as number | null,
  });

  const CustomPickerDay = (props: any) => {
    const { day, ...other } = props;
    const isBooked = day && bookedDates.some(range =>
      day.isSame(range.start, 'day') || day.isSame(range.end, 'day') ||
      (day.isAfter(range.start, 'day') && day.isBefore(range.end, 'day'))
    );
    return (
      <PickerDay
        {...other}
        day={day}
        sx={{
          ...(isBooked && {
            backgroundColor: 'rgba(239, 68, 68, 0.1) !important',
            color: '#ef4444 !important',
            textDecoration: 'line-through',
            fontWeight: 'bold',
          }),
        }}
      />
    );
  };

  const selectedRoom = rooms.find((room) => room.room_id === formData.roomId) || null;
  const basePrice = Number(selectedRoom?.price_per_night || 0);
  const discount = Number(selectedRoom?.discount || 0);
  const selectedPrice = Math.round(basePrice * (100 - discount) / 100);
  const selectedRoomType = selectedRoom?.type || 'Select a room';
  const selectedImage = selectedRoom?.image || fallbackImage;

  useEffect(() => {
    axios.get('/api/rooms')
      .then((res) => setRooms((res.data as RoomRow[]).filter((room) => room.status !== 'Maintenance')))
      .catch(() => setError('Unable to load the room list.'));
  }, []);

  useEffect(() => {
    if (!formData.roomId) {
      setBookedDates([]);
      return;
    }
    axios.get(`/api/bookings/room/${formData.roomId}/dates`)
      .then(res => {
        const dates = res.data.map((b: { check_in_date: string; check_out_date: string }) => ({
          start: dayjs(b.check_in_date).startOf('day'),
          end: dayjs(b.check_out_date).startOf('day'),
        }));
        setBookedDates(dates);
      })
      .catch(err => console.error('Failed to load booked dates', err));
  }, [formData.roomId]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoomChange = (roomId: number) => {
    const room = rooms.find((entry) => entry.room_id === roomId);
    setFormData({ ...formData, roomId, roomType: room?.type || '', checkInDate: null, checkOutDate: null });
  };

  const shouldDisableDate = (date: Dayjs) => {
    return bookedDates.some(range =>
      date.isSame(range.start, 'day') || date.isSame(range.end, 'day') ||
      (date.isAfter(range.start, 'day') && date.isBefore(range.end, 'day'))
    );
  };

  const calculateTotal = () => {
    if (formData.checkInDate && formData.checkOutDate) {
      const days = formData.checkOutDate.diff(formData.checkInDate, 'day');
      return days > 0 ? days * selectedPrice : 0;
    }
    return 0;
  };

  // Direct Booking Confirmation for Cash or Physical POS Card
  const handleDirectPaymentConfirm = async (method: 'CASH' | 'CARD') => {
    setLoading(true);
    setError('');
    const refOrder = `${method}_${Date.now()}`;
    try {
      const payload = {
        ...formData,
        checkInDate: formData.checkInDate ? formData.checkInDate.format('YYYY-MM-DD') : '',
        checkOutDate: formData.checkOutDate ? formData.checkOutDate.format('YYYY-MM-DD') : '',
        paymentStatus: 'PAID',
        paymentMethod: method === 'CASH' ? 'Cash' : 'Card',
        payhereOrderId: refOrder,
      };

      const response = await axios.post('/api/bookings', payload);
      setSuccess(String(response.data.bookingId));
      setPayhereOrderId(refOrder);
      setActiveStep(3);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to save booking. Please try again.');
      } else {
        setError('Failed to save booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Confirm booking ONLY after PayHere payment passes
  const confirmBookingWithPayment = async (orderId: string) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        checkInDate: formData.checkInDate ? formData.checkInDate.format('YYYY-MM-DD') : '',
        checkOutDate: formData.checkOutDate ? formData.checkOutDate.format('YYYY-MM-DD') : '',
        paymentStatus: 'PAID',
        paymentMethod: 'Online',
        payhereOrderId: orderId,
      };

      const response = await axios.post('/api/bookings', payload);
      setSuccess(String(response.data.bookingId));
      setPayhereOrderId(orderId);
      setActiveStep(3);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to save booking. Please try again.');
      } else {
        setError('Failed to save booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Trigger Official PayHere Sandbox SDK Popup
  const handlePayHereCheckout = async () => {
    setError('');
    const totalAmount = calculateTotal();
    if (totalAmount <= 0) {
      setError('Please select valid check-in and check-out stay dates first.');
      return;
    }

    try {
      setLoading(true);
      const orderId = 'RESORT_' + Date.now();

      const hashRes = await axios.post('/api/bookings/payhere-hash', {
        order_id: orderId,
        amount: totalAmount,
        currency: 'LKR',
      });

      if (!window.payhere) {
        throw new Error('PayHere Payment SDK is loading... Please ensure payhere.js is loaded.');
      }

      const payment = {
        sandbox: hashRes.data.sandbox !== undefined ? hashRes.data.sandbox : true,
        merchant_id: hashRes.data.merchant_id,
        return_url: import.meta.env.VITE_PAYHERE_RETURN_URL || window.location.origin + '/reception/new-booking',
        cancel_url: import.meta.env.VITE_PAYHERE_CANCEL_URL || window.location.origin + '/reception/new-booking',
        notify_url: import.meta.env.VITE_PAYHERE_NOTIFY_URL || window.location.origin + '/api/bookings/payhere-notify',
        order_id: orderId,
        items: `Resort Room Booking - ${selectedRoomType}`,
        amount: hashRes.data.amount,
        currency: hashRes.data.currency || 'LKR',
        hash: hashRes.data.hash,
        first_name: formData.firstName || 'Guest',
        last_name: formData.lastName || 'Member',
        email: formData.email || 'guest@example.com',
        phone: formData.phone || '0770000000',
        address: 'Paradise Resorts Hotel',
        city: 'Colombo',
        country: 'Sri Lanka',
      };

      window.payhere.onCompleted = function onCompleted(completedOrderId: string) {
        confirmBookingWithPayment(completedOrderId || orderId);
      };

      window.payhere.onDismissed = function onDismissed() {
        setError('PayHere Payment was cancelled.');
        setLoading(false);
      };

      window.payhere.onError = function onError(payhereErr: any) {
        setError('PayHere Payment Error: ' + (typeof payhereErr === 'string' ? payhereErr : JSON.stringify(payhereErr)));
        setLoading(false);
      };

      window.payhere.startPayment(payment);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to initialize PayHere gateway.';
      setError(msg);
      setLoading(false);
    }
  };

  const handlePaymentSubmit = () => {
    if (paymentMethod === 'CASH') {
      void handleDirectPaymentConfirm('CASH');
    } else if (paymentMethod === 'CARD') {
      void handleDirectPaymentConfirm('CARD');
    } else {
      void handlePayHereCheckout();
    }
  };

  const resetForNextGuest = () => {
    setFormData({ firstName: '', lastName: '', email: '', phone: '', identificationNo: '', checkInDate: null, checkOutDate: null, roomType: '', roomId: null });
    setSuccess('');
    setPayhereOrderId('');
    setError('');
    setPaymentMethod('CASH');
    setActiveStep(0);
  };

  const steps = ['Guest Details', 'Room & Dates', 'Payment Method', 'Confirmation'];
  const nights = formData.checkOutDate && formData.checkInDate ? formData.checkOutDate.diff(formData.checkInDate, 'day') : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={4}>
        {/* Left Column: Room Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', position: 'sticky', top: 24 }}>
            <CardMedia component="img" height="220" image={selectedImage} alt={selectedRoomType} sx={{ filter: 'brightness(0.95)' }} />
            <Box sx={{ p: 3 }}>
              <Typography variant="overline" sx={{ color: '#d4af37', fontWeight: 800, letterSpacing: 1.5 }}>
                Guest Selection
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, mb: 2, color: '#1a1a2e', fontFamily: '"Playfair Display", serif' }}>
                {selectedRoomType}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                <MeetingRoomIcon sx={{ mr: 1.5, color: '#4facfe' }} fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Room {selectedRoom?.room_number || 'TBD'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'text.secondary' }}>
                <HotelIcon sx={{ mr: 1.5, color: '#4facfe' }} fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedRoom?.bed_type || 'Premium Bedding'}</Typography>
              </Box>

              <Divider sx={{ mb: 3, opacity: 0.6 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Rate per night</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981' }}>
                  {discount > 0 ? (
                    <>
                      <Typography component="span" sx={{ textDecoration: 'line-through', color: '#888', fontSize: '0.85em', mr: 1 }}>
                        ${basePrice}
                      </Typography>
                      ${selectedPrice}
                    </>
                  ) : (
                    `$${selectedPrice}`
                  )}
                </Typography>
              </Box>

              {calculateTotal() > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Box>
                    <Typography color="text.secondary" variant="caption" sx={{ fontWeight: 700, display: 'block' }}>Total Stay Amount</Typography>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>{nights} Night(s)</Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#d4af37' }}>
                    LKR {calculateTotal().toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Booking Workflow */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#1a1a2e', mb: 1, fontFamily: '"Playfair Display", serif' }}>
              Reception Desk Booking
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Register new guest bookings and process payments via Cash, POS Card Terminal, or PayHere Gateway.
            </Typography>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      '& .MuiStepIcon-root.Mui-active': { color: '#d4af37' },
                      '& .MuiStepIcon-root.Mui-completed': { color: '#10b981' },
                    }}
                  >
                    <Typography sx={{ fontWeight: activeStep === index ? 700 : 500, fontSize: '0.85rem', mt: 0.5 }}>{label}</Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

            {/* Step 0: Guest Details */}
            {activeStep === 0 && (
              <Box component="form" noValidate autoComplete="off">
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#1a1a2e' }}>
                  Step 1: Guest Personal Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField required fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField required fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField required fullWidth label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField required fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField required fullWidth label="ID / Passport Number" name="identificationNo" value={formData.identificationNo} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    size="large"
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.identificationNo}
                    sx={{ bgcolor: '#1a1a2e', color: 'white', px: 6, borderRadius: 8, textTransform: 'none', fontSize: '1rem', '&:hover': { bgcolor: '#d4af37', color: '#1a1a2e' } }}
                  >
                    Continue to Room & Dates
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 1: Room & Stay Dates */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#1a1a2e' }}>
                  Step 2: Choose Room & Stay Dates
                </Typography>
                <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 3, mb: 4, border: '1px solid #e2e8f0' }}>
                  <TextField
                    select
                    fullWidth
                    label="Room"
                    value={formData.roomId ?? ''}
                    onChange={(event) => handleRoomChange(Number(event.target.value))}
                    sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
                  >
                    {rooms.map((room) => {
                      const price = Math.round(Number(room.price_per_night) * (100 - Number(room.discount || 0)) / 100);
                      return (
                        <MenuItem key={room.room_id} value={room.room_id}>
                          Room {room.room_number} - {room.type} (${price}/night) [{room.status}]
                        </MenuItem>
                      );
                    })}
                  </TextField>

                  <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} /> Real-time availability active
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Select check-in and check-out dates. Struck-out dates are unavailable for this room.
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DatePicker
                        label="Check-In Date"
                        value={formData.checkInDate}
                        onChange={(newValue: Dayjs | null) => setFormData({ ...formData, checkInDate: newValue })}
                        shouldDisableDate={shouldDisableDate}
                        disabled={!formData.roomId}
                        disablePast
                        slots={{ day: CustomPickerDay }}
                        sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DatePicker
                        label="Check-Out Date"
                        value={formData.checkOutDate}
                        onChange={(newValue: Dayjs | null) => setFormData({ ...formData, checkOutDate: newValue })}
                        shouldDisableDate={(date: Dayjs) => {
                          if (shouldDisableDate(date)) return true;
                          if (formData.checkInDate && date.isBefore(formData.checkInDate.add(1, 'day'), 'day')) return true;
                          return false;
                        }}
                        disabled={!formData.roomId}
                        disablePast
                        slots={{ day: CustomPickerDay }}
                        slotProps={{ day: { bookedDates } as any }}
                        sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {calculateTotal() > 0 && (
                  <Paper elevation={0} sx={{ p: 2.5, mb: 4, bgcolor: '#fff8e7', border: '1px solid #ffe0b2', borderRadius: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#e65100', mb: 0.5 }}>
                      Total Amount: LKR {calculateTotal().toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({nights} Nights &times; ${selectedPrice} / night)
                    </Typography>
                  </Paper>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
                  <Button onClick={handleBack} size="large" sx={{ color: '#64748b', fontWeight: 600 }}>Back</Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    size="large"
                    disabled={!formData.roomId || !formData.checkInDate || !formData.checkOutDate || calculateTotal() <= 0}
                    sx={{
                      background: 'linear-gradient(45deg, #d4af37 30%, #f3e5ab 90%)',
                      color: '#1a1a2e',
                      px: 5,
                      borderRadius: 8,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
                      '&:hover': { background: 'linear-gradient(45deg, #f3e5ab 30%, #d4af37 90%)' },
                    }}
                  >
                    Proceed to Payment Method
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 2: Select Payment Method */}
            {activeStep === 2 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <PaymentIcon sx={{ color: '#d4af37', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a2e' }}>
                      Step 3: Select Payment Method
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Select how the guest is settling the booking fee at reception.
                    </Typography>
                  </Box>
                </Box>

                {/* Summary Payment Details */}
                <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 3 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">Guest Name</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{formData.firstName} {formData.lastName}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">Stay Dates</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {formData.checkInDate?.format('MMM DD, YYYY')} &rarr; {formData.checkOutDate?.format('MMM DD, YYYY')}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a1a2e' }}>Amount Payable:</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#d4af37' }}>
                          LKR {calculateTotal().toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Payment Options Selection */}
                <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
                  <FormLabel component="legend" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 2 }}>
                    Reception Settlement Option
                  </FormLabel>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                  >
                    <Paper
                      elevation={0}
                      onClick={() => setPaymentMethod('CASH')}
                      sx={{
                        p: 2.5,
                        mb: 2,
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: paymentMethod === 'CASH' ? '#10b981' : '#e2e8f0',
                        bgcolor: paymentMethod === 'CASH' ? '#f0fdf4' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <FormControlLabel
                        value="CASH"
                        control={<Radio color="success" />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
                            <LocalAtmIcon sx={{ color: '#10b981', fontSize: 28 }} />
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a2e' }}>
                                Cash Payment
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Receive physical cash directly at the front desk counter.
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>

                    <Paper
                      elevation={0}
                      onClick={() => setPaymentMethod('CARD')}
                      sx={{
                        p: 2.5,
                        mb: 2,
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: paymentMethod === 'CARD' ? '#4facfe' : '#e2e8f0',
                        bgcolor: paymentMethod === 'CARD' ? '#f0f9ff' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <FormControlLabel
                        value="CARD"
                        control={<Radio color="primary" />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
                            <PointOfSaleIcon sx={{ color: '#0284c7', fontSize: 28 }} />
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a2e' }}>
                                Card Payment (POS / Terminal)
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Swipe or dip guest card on the physical card machine at reception.
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>

                    <Paper
                      elevation={0}
                      onClick={() => setPaymentMethod('PAYHERE')}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: paymentMethod === 'PAYHERE' ? '#d4af37' : '#e2e8f0',
                        bgcolor: paymentMethod === 'PAYHERE' ? '#fffdf0' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <FormControlLabel
                        value="PAYHERE"
                        control={<Radio sx={{ color: '#d4af37', '&.Mui-checked': { color: '#d4af37' } }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
                            <CreditCardIcon sx={{ color: '#d4af37', fontSize: 28 }} />
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a2e' }}>
                                PayHere Gateway Popup
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Launch online PayHere portal for remote card or sandbox testing.
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                  </RadioGroup>
                </FormControl>

                {/* Optional guidance box when PayHere is selected */}
                {paymentMethod === 'PAYHERE' && (
                  <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#f0f7ff', border: '1px solid #b3d7ff', borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <SecurityIcon sx={{ color: '#0066cc' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#004085' }}>
                        PayHere Official Sandbox Test Cards:
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Visa Test Card</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#004085' }}>4532 0000 0000 0000</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Expiry Date</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#004085' }}>12 / 28</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>CVV / OTP</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#004085' }}>123 / 123456</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
                  <Button onClick={handleBack} disabled={loading} size="large" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handlePaymentSubmit}
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : paymentMethod === 'CASH' ? <LocalAtmIcon /> : <CreditCardIcon />}
                    sx={{
                      background: paymentMethod === 'CASH'
                        ? 'linear-gradient(45deg, #10b981 30%, #059669 90%)'
                        : paymentMethod === 'CARD'
                          ? 'linear-gradient(45deg, #0284c7 30%, #0369a1 90%)'
                          : 'linear-gradient(45deg, #d4af37 30%, #b89528 90%)',
                      color: '#fff',
                      px: 5,
                      py: 1.5,
                      borderRadius: 8,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    {loading
                      ? 'Processing Booking...'
                      : paymentMethod === 'CASH'
                        ? 'Record Cash Payment & Confirm'
                        : paymentMethod === 'CARD'
                          ? 'Record Card Payment & Confirm'
                          : 'Pay via PayHere Gateway'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 3: Confirmation */}
            {activeStep === 3 && (
              <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                <Box sx={{ display: 'inline-flex', bgcolor: 'rgba(16, 185, 129, 0.1)', p: 2, borderRadius: '50%', mb: 3 }}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a1a2e', mb: 1.5, fontFamily: '"Playfair Display", serif' }}>
                  Payment Recorded & Booking Confirmed!
                </Typography>
                <Chip
                  icon={<VerifiedUserIcon sx={{ color: '#ffffff !important' }} />}
                  label={`SETTLED VIA ${paymentMethod}`}
                  sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 'bold', mb: 3, py: 0.5, px: 1 }}
                />
                <Typography color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                  {formData.firstName}&apos;s room booking was confirmed and marked as paid in the system.
                </Typography>

                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc', display: 'inline-block', textAlign: 'left', minWidth: '320px', mb: 5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>
                    Booking Reference
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 1 }}>#{success}</Typography>
                  {payhereOrderId && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Payment Ref: {payhereOrderId}
                    </Typography>
                  )}
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" onClick={() => navigate(`/reception/bookings/${success}`)} size="large" sx={{ borderRadius: 8, px: 4, bgcolor: '#1a1a2e', color: '#fff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#d4af37', color: '#1a1a2e' } }}>
                    Open Booking & Billing
                  </Button>
                  <Button variant="outlined" onClick={resetForNextGuest} size="large" sx={{ borderRadius: 8, px: 4, textTransform: 'none', fontWeight: 600, color: '#1a1a2e', borderColor: '#cbd5e1' }}>
                    Book Another Guest
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default NewBooking;