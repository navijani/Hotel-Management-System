import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, Paper, 
  Container, Stepper, Step, StepLabel, CircularProgress, Alert,
  Divider, CardMedia, Chip
} from '@mui/material';
import { 
  MeetingRoom as MeetingRoomIcon, 
  Hotel as HotelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

const Book: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { room, roomId: fallbackId, roomType: fallbackType } = location.state || {};
  
  const selectedRoomId = room?.RoomID || fallbackId || null;
  const selectedRoomType = room?.RoomTypeID || fallbackType || 'Standard';
  const selectedPrice = room?.Price || 150;
  const selectedImage = room?.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop';
  
  const [bookedDates, setBookedDates] = useState<{ start: Dayjs, end: Dayjs }[]>([]);

  // Basic form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    identificationNo: '',
    checkInDate: null as Dayjs | null,
    checkOutDate: null as Dayjs | null,
    roomType: selectedRoomType,
    roomId: selectedRoomId,
  });

  useEffect(() => {
    if (selectedRoomId) {
      axios.get(`http://localhost:5000/api/bookings/room/${selectedRoomId}/dates`)
        .then(res => {
          const dates = res.data.map((b: any) => ({
            start: dayjs(b.check_in_date).startOf('day'),
            end: dayjs(b.check_out_date).startOf('day')
          }));
          setBookedDates(dates);
        })
        .catch(err => console.error('Failed to load booked dates', err));
    }
  }, [selectedRoomId]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        checkInDate: formData.checkInDate ? formData.checkInDate.format('YYYY-MM-DD') : '',
        checkOutDate: formData.checkOutDate ? formData.checkOutDate.format('YYYY-MM-DD') : '',
      };
      const response = await axios.post('http://localhost:5000/api/bookings', payload);
      setSuccess('Booking confirmed successfully! Booking ID: ' + response.data.bookingId);
      setActiveStep((prev) => prev + 1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const steps = ['Guest Details', 'Stay Dates', 'Confirmation'];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ bgcolor: '#f4f7f6', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            
            {/* Left Column: Room Summary */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.06)', position: 'sticky', top: 100 }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={selectedImage}
                  alt={selectedRoomType}
                  sx={{ filter: 'brightness(0.95)' }}
                />
                <Box sx={{ p: 3 }}>
                  <Typography variant="overline" sx={{ color: '#d4af37', fontWeight: 800, letterSpacing: 1.5 }}>
                    Your Selection
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, mb: 2, color: '#1a1a2e', fontFamily: '"Playfair Display", serif' }}>
                    {selectedRoomType}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                    <MeetingRoomIcon sx={{ mr: 1.5, color: '#4facfe' }} fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Room {room?.RoomNumber || 'TBD'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'text.secondary' }}>
                    <HotelIcon sx={{ mr: 1.5, color: '#4facfe' }} fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{room?.BedType || 'Premium Bedding'}</Typography>
                  </Box>

                  <Divider sx={{ mb: 3, opacity: 0.6 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 600 }}>Rate per night</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981' }}>${selectedPrice}</Typography>
                  </Box>
                  
                  {calculateTotal() > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 700 }}>Estimated Total</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1a2e' }}>${calculateTotal()}</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Right Column: Booking Form */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#1a1a2e', mb: 1, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  Secure Reservation
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                  Please complete the steps below to finalize your booking.
                </Typography>
                
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel 
                        StepIconProps={{
                          sx: { 
                            '&.Mui-active': { color: '#4facfe' },
                            '&.Mui-completed': { color: '#10b981' }
                          }
                        }}
                      >
                        <Typography sx={{ fontWeight: activeStep === index ? 700 : 500, mt: 1 }}>{label}</Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

                {/* Step 1: Guest Details */}
                {activeStep === 0 && (
                  <Box component="form" noValidate autoComplete="off">
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
                        disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.identificationNo}
                        sx={{ bgcolor: '#1a1a2e', color: 'white', px: 6, borderRadius: 8, textTransform: 'none', fontSize: '1rem', '&:hover': { bgcolor: '#2a2a4a' } }}
                      >
                        Continue to Dates
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Step 2: Stay Dates */}
                {activeStep === 1 && (
                  <Box>
                    <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 3, mb: 4, border: '1px solid #e2e8f0' }}>
                      <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} /> Real-time availability active
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Select your check-in and check-out dates. Days that are greyed out are already booked for this specific room.
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DatePicker
                            label="Check-In Date"
                            value={formData.checkInDate}
                            onChange={(newValue) => setFormData({ ...formData, checkInDate: newValue })}
                            shouldDisableDate={shouldDisableDate}
                            disablePast
                            sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DatePicker
                            label="Check-Out Date"
                            value={formData.checkOutDate}
                            onChange={(newValue) => setFormData({ ...formData, checkOutDate: newValue })}
                            shouldDisableDate={(date) => {
                              if (shouldDisableDate(date)) return true;
                              if (formData.checkInDate && date.isBefore(formData.checkInDate.add(1, 'day'), 'day')) return true;
                              return false;
                            }}
                            disablePast
                            sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
                      <Button onClick={handleBack} size="large" sx={{ color: '#64748b', fontWeight: 600 }}>Back</Button>
                      <Button 
                        variant="contained" 
                        onClick={submitBooking} 
                        size="large"
                        disabled={loading || !formData.checkInDate || !formData.checkOutDate}
                        sx={{ 
                          bgcolor: '#10b981', 
                          color: 'white', 
                          px: 6, 
                          borderRadius: 8, 
                          textTransform: 'none', 
                          fontSize: '1rem', 
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                          '&:hover': { bgcolor: '#059669' } 
                        }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Reservation'}
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Step 3: Confirmation */}
                {activeStep === 2 && (
                  <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                    <Box sx={{ display: 'inline-flex', bgcolor: 'rgba(16, 185, 129, 0.1)', p: 2, borderRadius: '50%', mb: 3 }}>
                      <CheckCircleIcon sx={{ fontSize: 60, color: '#10b981' }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 2, fontFamily: '"Playfair Display", serif' }}>
                      Reservation Confirmed!
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 1, fontSize: '1.1rem' }}>
                      Thank you for choosing HRGSMS Grand Hotel, {formData.firstName}.
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 5 }}>
                      We have sent a confirmation email with your booking details.
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#f8fafc', display: 'inline-block', textAlign: 'left', minWidth: '300px', mb: 5 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Booking Reference</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1a2e' }}>#{success.split(': ')[1] || '102938'}</Typography>
                    </Paper>

                    <Box>
                      <Button variant="outlined" onClick={() => navigate('/')} size="large" sx={{ borderRadius: 8, px: 4, textTransform: 'none', fontWeight: 600, color: '#1a1a2e', borderColor: '#cbd5e1' }}>
                        Return to Homepage
                      </Button>
                    </Box>
                  </Box>
                )}

              </Paper>
            </Grid>
            
          </Grid>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default Book;
