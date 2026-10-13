import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type StaffRole = 'cleaning' | 'bar' | 'therapist' | 'waiter' | 'receptionist';

const staffRoles = [
  { value: 'receptionist', label: 'Front Desk / Reception' },
  { value: 'cleaning', label: 'Cleaning Staff' },
  { value: 'bar', label: 'Bar Keeping Staff' },
  { value: 'therapist', label: 'Therapist Staff' },
  { value: 'waiter', label: 'Waiter Staff' },
];

const AccessPortal: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<StaffRole>('receptionist');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Privacy Policy Dialog State
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [pendingStaffData, setPendingStaffData] = useState<any>(null);
  const [pendingRole, setPendingRole] = useState<StaffRole>('receptionist');

  const handleStaffSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password to sign in.');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with backend
      const response = await axios.post('/api/staff/signin', {
        username: email.trim(),
        password,
        role,
      });

      // 2. Prompt staff member to review and acknowledge the Employee Location Data Privacy Policy
      setPendingStaffData(response.data);
      setPendingRole(role);
      setPolicyAccepted(false);
      setPolicyOpen(true);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.error || 'Unable to connect to the staff authentication service.');
      } else {
        setError('Unable to connect to the staff authentication service.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPolicyAndProceed = () => {
    if (!pendingStaffData) {
      setPolicyOpen(false);
      return;
    }

    // 1. Save session data
    sessionStorage.setItem('staffRole', pendingRole);
    sessionStorage.setItem('staffId', String(pendingStaffData.staff_id || pendingStaffData.id));
    sessionStorage.setItem('hmsStaffSession', JSON.stringify(pendingStaffData));
    sessionStorage.setItem('staffProfile', JSON.stringify(pendingStaffData));
    if (pendingStaffData.token) {
      sessionStorage.setItem('staffToken', pendingStaffData.token);
    }

    // Record consent
    const staffId = pendingStaffData.staff_id || pendingStaffData.id;
    sessionStorage.setItem('staffLocationPolicyAccepted', 'true');
    localStorage.setItem(`staffLocationPolicyConsent_${staffId}`, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      staffId,
      username: pendingStaffData.username,
      policy: 'Employee Location Data Privacy Policy v2026-10-13'
    }));

    setPolicyOpen(false);

    // 2. Navigate to appropriate workspace
    if (pendingRole === 'receptionist') {
      navigate('/reception');
    } else {
      navigate(`/staff/${pendingRole}`);
    }
  };

  const handleDeclinePolicy = () => {
    setPolicyOpen(false);
    setPendingStaffData(null);
    setPolicyAccepted(false);
    setError('You must accept the Employee Location Data Privacy Policy to access the staff workspace.');
  };

  const staffName = pendingStaffData?.username || email.trim() || 'Staff Member';
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: { xs: 14, md: 18 },
        pb: { xs: 8, md: 12 },
        bgcolor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f1e8 0%, #e8e2d5 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 4,
            border: '1px solid #e0d6bd',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ bgcolor: '#1a1a1a', py: 3, px: 4, color: 'white', textAlign: 'center' }}>
            <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', bgcolor: 'rgba(212, 175, 55, 0.15)', mb: 1 }}>
              <BadgeIcon sx={{ color: '#d4af37', fontSize: 32 }} />
            </Box>
            <Typography variant="overline" sx={{ display: 'block', color: '#d4af37', fontWeight: 700, letterSpacing: 2 }}>
              Paradise Resorts Team
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Playfair Display", Georgia, serif' }}>
              Staff Portal Login
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 4, md: 5 } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              Access your department workspace. Accounts are assigned and managed directly by hotel administration.
            </Typography>

            <Stack component="form" spacing={3} onSubmit={handleStaffSubmit}>
              <TextField
                select
                label="Staff Role / Department"
                value={role}
                onChange={(event) => setRole(event.target.value as StaffRole)}
                fullWidth
              >
                {staffRoles.map((staffRole) => (
                  <MenuItem key={staffRole.value} value={staffRole.value}>
                    {staffRole.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Username or Email"
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                fullWidth
                required
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                required
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LockOutlinedIcon />}
                sx={{
                  py: 1.5,
                  bgcolor: '#d4af37',
                  color: '#1a1a1a',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: '50px',
                  '&:hover': { bgcolor: '#b89528' },
                  boxShadow: '0 6px 20px rgba(212, 175, 55, 0.3)',
                }}
              >
                {loading ? 'Authenticating...' : 'Sign in to Staff Workspace'}
              </Button>

              <Box sx={{ textAlign: 'center', pt: 1 }}>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<PolicyOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => {
                    setPendingStaffData(null);
                    setPolicyOpen(true);
                  }}
                  sx={{
                    color: '#666',
                    textTransform: 'none',
                    fontSize: '0.82rem',
                    '&:hover': { color: '#d4af37', bgcolor: 'transparent' },
                  }}
                >
                  View Employee Location Data Privacy Policy
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>

      {/* Employee Location Data Privacy Policy Dialog */}
      <Dialog
        open={policyOpen}
        onClose={(_event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setPolicyOpen(false);
          }
        }}
        maxWidth="md"
        fullWidth
        scroll="paper"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              border: '1px solid #e0d6bd',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            },
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', py: 2.5, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PolicyOutlinedIcon sx={{ color: '#d4af37', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: '"Playfair Display", Georgia, serif' }}>
                Employee Location Data Privacy Policy
              </Typography>
              <Typography variant="caption" sx={{ color: '#d4af37', display: 'block', letterSpacing: 0.5 }}>
                Company Name: Hotel Management System &bull; Effective Date: October 13, 2026 &bull; Classification: Internal / HR Policy
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: '#faf9f6' }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e8e2d5', bgcolor: '#ffffff', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
              1. Purpose
            </Typography>
            <Typography variant="body2" sx={{ color: '#444', mb: 2.5, lineHeight: 1.7 }}>
              This policy outlines how Hotel Management System (&ldquo;the Company&rdquo;) collects, uses, stores, and protects location data gathered from staff members. The Company is committed to balancing its operational requirements with the privacy rights of its employees.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
              2. Scope of Tracking
            </Typography>
            <Typography variant="body2" sx={{ color: '#444', mb: 2.5, lineHeight: 1.7 }}>
              Location tracking is strictly limited to the official staff mobile application and is only active during the employee&rsquo;s official working hours or while performing assigned field duties.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
              3. Data Collected
            </Typography>
            <Typography variant="body2" sx={{ color: '#444', mb: 1, lineHeight: 1.7 }}>
              When location services are active, the Company may collect the following:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2.5, color: '#444', fontSize: '0.875rem', lineHeight: 1.7 }}>
              <li><strong>Geolocation Data:</strong> Real-time GPS coordinates (latitude and longitude).</li>
              <li><strong>Timestamps:</strong> The exact time the location ping was recorded.</li>
              <li><strong>Device Identifiers:</strong> To associate the location data with the specific assigned hardware.</li>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
              4. Purpose of Data Collection
            </Typography>
            <Typography variant="body2" sx={{ color: '#444', mb: 1, lineHeight: 1.7 }}>
              The Company collects employee location data solely for the following legitimate business purposes:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2.5, color: '#444', fontSize: '0.875rem', lineHeight: 1.7 }}>
              <li><strong>Operational Efficiency:</strong> To dispatch the nearest available staff member to a client site or task.</li>
              <li><strong>Employee Safety:</strong> To monitor the whereabouts of staff working in remote or hazardous environments.</li>
              <li><strong>Time and Attendance:</strong> To verify presence at assigned job sites for payroll and compliance purposes.</li>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
              5. Data Minimization and Privacy
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2.5, color: '#444', fontSize: '0.875rem', lineHeight: 1.7 }}>
              <li><strong>Off-Duty Hours:</strong> The Company will not track, record, or request location data outside of the employee&rsquo;s scheduled working hours.</li>
              <li><strong>Background Tracking:</strong> If the application requires background location tracking to function, a persistent notification will be displayed on the device so the employee is always aware when tracking is active.</li>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
              6. Data Storage and Retention
            </Typography>
            <Typography variant="body2" sx={{ color: '#444', mb: 2.5, lineHeight: 1.7 }}>
              Location data will be stored securely on encrypted servers. Routine location logs will be retained for a period of 30 days, after which they will be automatically permanently deleted, unless required for an ongoing HR investigation or legal compliance.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
              7. Legal Framework and Compliance
            </Typography>
            <Typography variant="body2" sx={{ color: '#444', mb: 2.5, lineHeight: 1.7 }}>
              The data processing activities outlined in this document are conducted in compliance with relevant labor laws and data protection regulations, including the principles established by the Personal Data Protection Act, No. 9 of 2022. Data will not be sold, monetized, or shared with third-party advertisers under any circumstances.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
              8. Employee Rights
            </Typography>
            <Typography variant="body2" sx={{ color: '#444', mb: 1, lineHeight: 1.7 }}>
              Staff members have the right to:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2.5, color: '#444', fontSize: '0.875rem', lineHeight: 1.7 }}>
              <li>Request access to the location data the Company has collected about them.</li>
              <li>Report any unauthorized tracking outside of working hours.</li>
              <li>Temporarily disable location services during designated rest breaks, provided they notify their immediate supervisor.</li>
            </Box>

            <Divider sx={{ my: 2.5 }} />

            {/* Acknowledgment Box */}
            <Box sx={{ p: 2.5, bgcolor: '#fbf8ee', borderRadius: 2, border: '1px solid #d4af37' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1 }}>
                Employee Acknowledgment
              </Typography>
              <Typography variant="body2" sx={{ color: '#333', mb: 2, fontStyle: 'italic', lineHeight: 1.7 }}>
                &ldquo;I, <strong>{staffName}</strong>, acknowledge that I have read and understood the Employee Location Data Privacy Policy. I consent to the collection and use of my location data during working hours as described in this document.&rdquo;
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#555' }}>
                  <strong>Signature:</strong> <span style={{ textDecoration: 'underline', color: '#1a1a1a' }}>{staffName}</span>
                </Typography>
                <Typography variant="body2" sx={{ color: '#555' }}>
                  <strong>Date:</strong> {currentDateFormatted}
                </Typography>
              </Stack>

              {pendingStaffData && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={policyAccepted}
                      onChange={(e) => setPolicyAccepted(e.target.checked)}
                      sx={{ color: '#d4af37', '&.Mui-checked': { color: '#d4af37' } }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      I have read, understood, and accept the Employee Location Data Privacy Policy.
                    </Typography>
                  }
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f5f1e8', justifyContent: 'space-between' }}>
          {pendingStaffData ? (
            <>
              <Button onClick={handleDeclinePolicy} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Decline &amp; Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAcceptPolicyAndProceed}
                disabled={!policyAccepted}
                startIcon={<CheckCircleIcon />}
                sx={{
                  bgcolor: '#d4af37',
                  color: '#1a1a1a',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: '25px',
                  '&:hover': { bgcolor: '#b89528' },
                  '&.Mui-disabled': { bgcolor: '#e0d6bd', color: '#888' },
                }}
              >
                Accept &amp; Proceed to Workspace
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => setPolicyOpen(false)}
              sx={{
                bgcolor: '#1a1a1a',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                ml: 'auto',
                '&:hover': { bgcolor: '#333' },
              }}
            >
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccessPortal;