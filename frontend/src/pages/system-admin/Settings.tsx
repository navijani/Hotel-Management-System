import React, { useEffect, useState } from 'react';
import { Alert, Box, Typography, Paper, Grid, TextField, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

interface SystemSettings {
  hotel_name: string;
  contact_email: string;
  phone_number: string;
  address: string;
  online_bookings_enabled: boolean;
  email_notifications_enabled: boolean;
  maintenance_mode: boolean;
}

const defaults: SystemSettings = {
  hotel_name: 'HRGSMS Grand Hotel',
  contact_email: 'admin@hrgsms.com',
  phone_number: '+94 11 234 5678',
  address: '123 Ocean Drive, Colombo',
  online_bookings_enabled: true,
  email_notifications_enabled: true,
  maintenance_mode: false,
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    axios.get('/api/system-settings')
      .then(({ data }) => setSettings({
        ...defaults,
        ...data,
        online_bookings_enabled: Boolean(data.online_bookings_enabled),
        email_notifications_enabled: Boolean(data.email_notifications_enabled),
        maintenance_mode: Boolean(data.maintenance_mode),
      }))
      .catch(() => setMessage({ type: 'error', text: 'Unable to load saved settings.' }))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof SystemSettings, value: string | boolean) => {
    setSettings((current) => ({ ...current, [field]: value }));
    setMessage(null);
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await axios.put('/api/system-settings', settings);
      setSettings({ ...data.settings, online_bookings_enabled: Boolean(data.settings.online_bookings_enabled), email_notifications_enabled: Boolean(data.settings.email_notifications_enabled), maintenance_mode: Boolean(data.settings.maintenance_mode) });
      setMessage({ type: 'success', text: 'System settings saved successfully.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Unable to save settings.' });
    } finally {
      setSaving(false);
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
        </Grid>

      </Grid>
    </Box>
  );
};

export default Settings;
