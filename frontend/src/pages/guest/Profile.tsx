import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Badge as BadgeIcon,
  Lock as LockIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface GuestUser {
  guest_id?: number;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone_number?: string;
  phone?: string;
  identity_number?: string;
  identityNumber?: string;
}

interface Reservation {
  booking_id: number;
  check_in_date: string;
  check_out_date: string;
  booking_status: string;
  created_at?: string;
  room_number?: string;
  room_type?: string;
  price_per_night?: number;
  room_image?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<GuestUser>(() => {
    const rawProfile = sessionStorage.getItem('guestProfile') || sessionStorage.getItem('guestUser');
    if (rawProfile) {
      try { return JSON.parse(rawProfile); } catch (e) { }
    }
    return {
      first_name: 'Guest',
      last_name: 'User',
      email: 'guest@example.com',
      phone_number: '+94 77 123 4567',
      identity_number: '199512345678',
    };
  });

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState<boolean>(true);

  // Edit Modal State
  const [openEdit, setOpenEdit] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const rawProfile = sessionStorage.getItem('guestProfile') || sessionStorage.getItem('guestUser');
    let currentUser = user;
    if (rawProfile) {
      try {
        currentUser = JSON.parse(rawProfile);
        setUser(currentUser);
      } catch (e) { }
    }

    const fetchReservations = async () => {
      setLoadingReservations(true);
      try {
        const guestId = currentUser.guest_id || 0;
        const identityNo = currentUser.identity_number || currentUser.identityNumber || '';
        const email = currentUser.email || '';

        const params = new URLSearchParams();
        if (identityNo) params.append('identity_number', identityNo);
        if (email) params.append('email', email);

        const res = await fetch(`/api/bookings/guest/${guestId}?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setReservations(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching reservations:', err);
      } finally {
        setLoadingReservations(false);
      }
    };

    fetchReservations();
  }, []);

  const getFirstName = () => user.first_name || user.firstName || 'Guest';
  const getLastName = () => user.last_name || user.lastName || 'Member';
  const getPhone = () => user.phone_number || user.phone || 'Not provided';
  const getIdentityNumber = () => user.identity_number || user.identityNumber || 'Not provided';

  const handleOpenEdit = () => {
    setFirstNameInput(getFirstName());
    setLastNameInput(getLastName());
    setPhoneInput(getPhone() === 'Not provided' ? '' : getPhone());
    setError(null);
    setSuccess(null);
    setOpenEdit(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      setError('Phone number is required.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const guestId = user.guest_id || 1;

    try {
      const res = await fetch(`/api/guest/${guestId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneInput.trim(),
          first_name: firstNameInput.trim(),
          last_name: lastNameInput.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update profile.');
      }

      const responseData = await res.json();
      const updatedUser = {
        ...user,
        first_name: responseData.guest?.first_name || firstNameInput.trim(),
        last_name: responseData.guest?.last_name || lastNameInput.trim(),
        phone_number: responseData.guest?.phone_number || phoneInput.trim(),
        phone: responseData.guest?.phone_number || phoneInput.trim(),
        identity_number: responseData.guest?.identity_number || getIdentityNumber(),
      };

      setUser(updatedUser);
      sessionStorage.setItem('guestProfile', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('guestAuthChanged'));

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setOpenEdit(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#fdfbf7', minHeight: '80vh', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#1a1a2e', mb: 4, fontFamily: '"Playfair Display", serif' }}>
          My Guest Profile
        </Typography>

        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3, borderRadius: 3 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', textAlign: 'center', bgcolor: '#fff' }}>
              <Avatar
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: '#d4af37', fontSize: '2.5rem', fontWeight: 'bold' }}
              >
                {getFirstName()[0]}{getLastName()[0]}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                {getFirstName()} {getLastName()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Registered Guest
              </Typography>

              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleOpenEdit}
                fullWidth
                sx={{
                  borderRadius: 8,
                  bgcolor: '#1a1a2e',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.2,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  '&:hover': { bgcolor: '#d4af37', color: '#1a1a2e' }
                }}
              >
                Edit Phone & Info
              </Button>

              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{ mt: 2, borderRadius: 8, textTransform: 'none', borderColor: 'error.main', '&:hover': { bgcolor: 'error.main', color: '#fff' } }}
                onClick={() => {
                  sessionStorage.removeItem('guestAuthenticated');
                  sessionStorage.removeItem('guestSignedIn');
                  sessionStorage.removeItem('guestProfile');
                  sessionStorage.removeItem('guestUser');
                  window.dispatchEvent(new Event('guestAuthChanged'));
<<<<<<< HEAD
                  window.location.href = '/';
=======
                  window.location.href = import.meta.env.BASE_URL || '/';
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
                }}
              >
                Logout Account
              </Button>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', bgcolor: '#fff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1a1a2e' }}>
                Account Information
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ color: '#d4af37', mr: 2, fontSize: 28 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{getFirstName()} {getLastName()}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Email sx={{ color: '#d4af37', mr: 2, fontSize: 28 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary">Email Address</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{user.email}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Phone sx={{ color: '#d4af37', mr: 2, fontSize: 28 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{getPhone()}</Typography>
                </Box>
                <Button size="small" onClick={handleOpenEdit} sx={{ color: '#d4af37', textTransform: 'none', fontWeight: 600 }}>
                  Edit Phone
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Locked Identity Number Field */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BadgeIcon sx={{ color: '#d4af37', mr: 2, fontSize: 28 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">Identity / NIC Number</Typography>
                    <Chip
                      icon={<LockIcon sx={{ fontSize: '14px !important', color: '#666 !important' }} />}
                      label="Locked"
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#eee', color: '#555' }}
                    />
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                    {getIdentityNumber()}
                  </Typography>
                </Box>
              </Box>

            </Paper>

            <Paper elevation={0} sx={{ p: 4, mt: 4, borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', bgcolor: '#fff' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                  My Reservations
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/rooms')}
                  sx={{ borderRadius: 8, borderColor: '#d4af37', color: '#1a1a2e', textTransform: 'none', fontWeight: 600 }}
                >
                  + Book Another Room
                </Button>
              </Box>

              {loadingReservations ? (
                <Box sx={{ textCenter: 'center', py: 4, textAlign: 'center' }}>
                  <CircularProgress size={32} sx={{ color: '#d4af37' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Loading your reservations...</Typography>
                </Box>
              ) : reservations.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {reservations.map((res) => {
                    const checkInDate = new Date(res.check_in_date);
                    const checkOutDate = new Date(res.check_out_date);
                    const diffDays = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)));
                    const rate = Number(res.price_per_night || 150);
                    const totalCost = diffDays * rate;

                    let statusColor = '#10b981';
                    if (res.booking_status === 'Checked-Out') statusColor = '#64748b';
                    if (res.booking_status === 'Cancelled') statusColor = '#ef4444';

                    return (
                      <Paper
                        key={res.booking_id}
                        variant="outlined"
                        sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', transition: '0.2s', '&:hover': { boxShadow: '0 4px 15px rgba(0,0,0,0.05)' } }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 12, sm: 8 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                              <Chip
                                label={`#RES-${res.booking_id}`}
                                size="small"
                                sx={{ bgcolor: '#1a1a2e', color: '#fff', fontWeight: 'bold', fontSize: '0.75rem' }}
                              />
                              <Chip
                                label={res.booking_status || 'Booked'}
                                size="small"
                                sx={{ bgcolor: statusColor, color: '#fff', fontWeight: 'bold', fontSize: '0.75rem' }}
                              />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a2e' }}>
                              {res.room_type || 'Deluxe Room'} {res.room_number ? `(${res.room_number})` : ''}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              📅 {checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &rarr; {checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ({diffDays} Night{diffDays > 1 ? 's' : ''})
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Total Reservation Amount</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#d4af37' }}>
                              ${totalCost.toLocaleString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ bgcolor: '#f8fafc', p: 4, borderRadius: 3, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                    No Reservations Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    You have no active or previous room bookings linked to this account. Ready for your luxury escape?
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/rooms')}
                    sx={{ borderRadius: 8, bgcolor: '#d4af37', color: '#fff', textTransform: 'none', fontWeight: 700, px: 4, '&:hover': { bgcolor: '#b89628' } }}
                  >
                    Book a Room Now
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Profile Dialog Modal */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a1a2e', color: '#fff', fontWeight: 'bold' }}>
          Edit Profile Information
        </DialogTitle>
        <form onSubmit={handleSaveProfile}>
          <DialogContent dividers sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={firstNameInput}
                  onChange={(e) => setFirstNameInput(e.target.value)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Last Name"
                  fullWidth
                  value={lastNameInput}
                  onChange={(e) => setLastNameInput(e.target.value)}
                  required
                />
              </Grid>

              {/* Editable Phone Number Field */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Phone Number (Editable)"
                  placeholder="e.g. +94 77 123 4567"
                  fullWidth
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  required
                  helperText="You can update your contact phone number anytime."
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: '#d4af37' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              {/* Locked Read-Only Identity Number Field */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Identity Number (Locked - Non Editable)"
                  fullWidth
                  disabled
                  value={getIdentityNumber()}
                  helperText="Identity / NIC number is verified and locked to your account."
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#888' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, bgcolor: '#f9f9f9' }}>
            <Button onClick={() => setOpenEdit(false)} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ bgcolor: '#1a1a2e', color: '#fff', '&:hover': { bgcolor: '#d4af37', color: '#1a1a2e' } }}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Profile;
