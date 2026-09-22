import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, Paper, 
  Container, Stepper, Step, StepLabel, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Book: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  // Basic form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    identificationNo: '',
    checkInDate: '',
    checkOutDate: '',
    roomType: 'Single', // Or ideally passed via location.state from Rooms page
  });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/bookings', formData);
      setSuccess('Booking confirmed successfully! Booking ID: ' + response.data.bookingId);
      setActiveStep((prev) => prev + 1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Guest Details', 'Stay Dates', 'Confirmation'];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Room Reservation
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 6, mt: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {activeStep === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField required fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField required fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField required fullWidth label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField required fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField required fullWidth label="ID / Passport Number" name="identificationNo" value={formData.identificationNo} onChange={handleChange} />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button variant="contained" onClick={handleNext} size="large">Next</Button>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="Check-In Date"
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleChange}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  label="Check-Out Date"
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleChange}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack} size="large">Back</Button>
              <Button 
                variant="contained" 
                onClick={submitBooking} 
                size="large"
                disabled={loading || !formData.checkInDate || !formData.checkOutDate}
              >
                {loading ? <CircularProgress size={24} /> : 'Confirm Booking'}
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="success" sx={{ mb: 4, justifyContent: 'center', fontSize: '1.1rem' }}>
              {success}
            </Alert>
            <Typography variant="h6" gutterBottom>
              Thank you for choosing HRGSMS Grand Hotel!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              We have sent a confirmation email with your booking details.
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/')} size="large">
              Return to Home
            </Button>
          </Box>
        )}

      </Paper>
    </Container>
  );
};

export default Book;
