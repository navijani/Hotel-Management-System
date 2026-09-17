import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Grid, CircularProgress, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface Room {
  room_id: number;
  room_number: string;
  type: string;
  capacity: number;
  price_per_night: number;
  status: string;
}

const initialForm = {
  room_number: '',
  type: 'Standard',
  capacity: 2,
  price_per_night: 150,
  status: 'Available',
  image_url: ''
};

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchRooms = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/rooms')
      .then(response => {
        setRooms(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching rooms', err);
        setRooms([
          { room_id: 1, room_number: '101', type: 'Standard', capacity: 2, price_per_night: 100, status: 'Available' },
          { room_id: 2, room_number: '102', type: 'Deluxe', capacity: 3, price_per_night: 150, status: 'Occupied' },
          { room_id: 3, room_number: '201', type: 'Suite', capacity: 4, price_per_night: 300, status: 'Maintenance' },
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpen = () => {
    setFormData(initialForm);
    setImageFile(null);
    setError('');
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const data = new FormData();
      data.append('room_number', formData.room_number);
      data.append('type', formData.type);
      data.append('capacity', formData.capacity.toString());
      data.append('price_per_night', formData.price_per_night.toString());
      data.append('status', formData.status);
      if (imageFile) {
        data.append('image', imageFile);
      }

      await axios.post('http://localhost:5000/api/rooms', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setOpen(false);
      fetchRooms();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add room.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e' }}>
          Rooms Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ bgcolor: '#4facfe', borderRadius: 2 }}>
          Add New Room
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Room Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', align: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} sx={{ my: 2 }} /></TableCell></TableRow>
            ) : rooms.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No rooms found.</TableCell></TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.room_id} hover>
                  <TableCell>{room.room_number}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>${room.price_per_night}</TableCell>
                  <TableCell>
                    <Chip 
                      label={room.status} 
                      color={room.status === 'Available' ? 'success' : room.status === 'Occupied' ? 'error' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Room Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Room</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth required label="Room Number" name="room_number" value={formData.room_number} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Room Type" name="type" value={formData.type} onChange={handleChange}>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Deluxe">Deluxe</MenuItem>
                <MenuItem value="Suite">Suite</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth required type="number" label="Capacity" name="capacity" value={formData.capacity} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth required type="number" label="Price Per Night ($)" name="price_per_night" value={formData.price_per_night} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Status" name="status" value={formData.status} onChange={handleChange}>
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Room Photo (Optional)</Typography>
              <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none', justifyContent: 'flex-start' }}>
                {imageFile ? imageFile.name : 'Upload Image File'}
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting || !formData.room_number} sx={{ bgcolor: '#4facfe' }}>
            {submitting ? <CircularProgress size={24} /> : 'Save Room'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rooms;
