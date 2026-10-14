import React, { useEffect, useState } from 'react';
import { Alert, Box, Typography, Paper, Grid, TextField, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

interface SystemSettings {
  hotel_name: string;
  contact_email: string;
  phone_number: string;
  address: string;
}

const defaults: SystemSettings = {
  hotel_name: 'HRGSMS Grand Hotel',
  contact_email: 'admin@hrgsms.com',
  phone_number: '+94 11 234 5678',
  address: '123 Ocean Drive, Colombo',
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    axios.get('/api/system-settings')
      .then(({ data }) => setSettings({
        ...defaults,
        ...data,
      }))
      .catch(() => setMessage({ type: 'error', text: 'Unable to load saved settings.' }))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof SystemSettings, value: string) => {
    setSettings((current) => ({ ...current, [field]: value }));
    setMessage(null);
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await axios.put('/api/system-settings', settings);
      setSettings(data.settings);
      setMessage({ type: 'success', text: 'System settings saved successfully.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Unable to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8 || new TextEncoder().encode(newPassword).length > 72) {
      setPasswordMessage({ type: 'error', text: 'Use at least 8 characters and no more than 72 UTF-8 bytes.' });
      return;
    }
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      setPasswordMessage({ type: 'error', text: 'Please sign in as administrator again before changing your password.' });
      return;
    }
    setChangingPassword(true);
    try {
      const { data } = await axios.post('/api/admin/change-password', { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      sessionStorage.setItem('adminToken', data.token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({ type: 'success', text: 'Password changed successfully. Use your new password next time you sign in.' });
    } catch (error) {
      setPasswordMessage({ type: 'error', text: axios.isAxiosError(error)
        ? error.response?.data?.error || 'Unable to change password. Please try again.'
        : 'Unable to change password. Please try again.' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 280 }}><CircularProgress sx={{ color: '#4facfe' }} /></Box>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e', mb: 4 }}>
        System Settings
      </Typography>

      {message && <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>General Info</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField label="Hotel Name" value={settings.hotel_name} onChange={(e) => update('hotel_name', e.target.value)} fullWidth />
              <TextField label="Contact Email" value={settings.contact_email} onChange={(e) => update('contact_email', e.target.value)} type="email" fullWidth />
              <TextField label="Phone Number" value={settings.phone_number} onChange={(e) => update('phone_number', e.target.value)} fullWidth />
              <TextField label="Address" value={settings.address} onChange={(e) => update('address', e.target.value)} fullWidth multiline rows={3} />
              <Button variant="contained" onClick={saveSettings} disabled={saving} sx={{ alignSelf: 'flex-start', bgcolor: '#4facfe' }}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </Box>
          </Paper>
          <Paper sx={{ p: 4, mt: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Change Admin Password</Typography>
            <Box component="form" onSubmit={changePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {passwordMessage && <Alert severity={passwordMessage.type}>{passwordMessage.text}</Alert>}
              <TextField label="Current Password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={changingPassword} fullWidth />
              <TextField label="New Password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} helperText="Use at least 8 characters." required disabled={changingPassword} fullWidth />
              <TextField label="Confirm New Password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={changingPassword} fullWidth />
              <Button type="submit" variant="contained" disabled={changingPassword} sx={{ alignSelf: 'flex-start', bgcolor: '#4facfe' }}>
                {changingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Settings;
