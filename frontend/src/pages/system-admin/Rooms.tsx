import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Grid, CircularProgress, Alert, Tooltip, Avatar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, KingBed as KingBedIcon } from '@mui/icons-material';
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
  image_url: '',
  description: '',
  bed_type: 'King Bed',
  room_size: '400 sqft',
  amenities: 'Free WiFi'
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

  const [editingId, setEditingId] = useState<number | null>(null);
  const isSuperAdmin = sessionStorage.getItem('adminAuthenticated') === 'true';

  const handleOpen = () => {
    setEditingId(null);
    setFormData(initialForm);
    setImageFile(null);
    setError('');
    setOpen(true);
  };
  
  const handleEdit = (room: Room) => {
    if (!isSuperAdmin) return;
    setEditingId(room.room_id);
    setFormData({
      room_number: room.room_number || '',
      type: room.type || 'Standard',
      capacity: room.capacity || 2,
      price_per_night: room.price_per_night || 150,
      status: room.status || 'Available',
      image_url: '',
      description: (room as any).description || '',
      bed_type: (room as any).bed_type || 'King Bed',
      room_size: (room as any).room_size || '400 sqft',
      amenities: (room as any).amenities || 'Free WiFi'
    });
    setImageFile(null);
    setError('');
    setOpen(true);
  };

  const handleDelete = async (roomId: number) => {
    if (!isSuperAdmin) return;
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await axios.delete(`http://localhost:5000/api/rooms/${roomId}`);
        fetchRooms();
      } catch (err: any) {
        alert('Failed to delete room');
      }
    }
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
      data.append('description', formData.description);
      data.append('bed_type', formData.bed_type);
      data.append('room_size', formData.room_size);
      data.append('amenities', formData.amenities);
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingId) {
        await axios.put(`http://localhost:5000/api/rooms/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('http://localhost:5000/api/rooms', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setOpen(false);
      fetchRooms();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save room.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, bgcolor: '#fff', p: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a2e', mb: 0.5, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Rooms Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your hotel rooms, pricing, and availability status.
          </Typography>
        </Box>
        {isSuperAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpen} 
            sx={{ 
              bgcolor: '#4facfe', 
              backgroundImage: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
              borderRadius: 8,
              px: 3,
              py: 1,
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
            }}
          >
            Add New Room
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ bgcolor: 'rgba(248, 249, 250, 0.8)', backdropFilter: 'blur(8px)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, py: 3 }}>Room Details</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>Capacity</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>Price / Night</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, align: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={30} sx={{ my: 4, color: '#4facfe' }} /></TableCell></TableRow>
            ) : rooms.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No rooms found.</Typography></TableCell></TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.room_id} hover sx={{ transition: 'background-color 0.2s' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(79, 172, 254, 0.1)', color: '#4facfe', borderRadius: 2 }}>
                        <KingBedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          Room {room.room_number}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                          {room.type || 'Standard'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                      {room.capacity || 2} Persons
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                      ${room.price_per_night || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={room.status || 'Available'} 
                      sx={{ 
                        fontWeight: 600,
                        bgcolor: room.status === 'Available' ? 'rgba(16, 185, 129, 0.1)' : room.status === 'Occupied' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: room.status === 'Available' ? '#10b981' : room.status === 'Occupied' ? '#ef4444' : '#f59e0b',
                        border: 'none',
                        px: 1
                      }} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    {isSuperAdmin ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Edit Room">
                          <IconButton size="small" onClick={() => handleEdit(room)} sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.1)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Room">
                          <IconButton size="small" onClick={() => handleDelete(room.room_id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Chip label="Read Only" size="small" variant="outlined" sx={{ color: '#94a3b8', borderColor: '#e2e8f0', fontSize: '0.7rem' }} />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Room Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{editingId ? 'Edit Room' : 'Add New Room'}</DialogTitle>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Bed Type" name="bed_type" value={formData.bed_type} onChange={handleChange} placeholder="e.g. King Bed" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Room Size" name="room_size" value={formData.room_size} onChange={handleChange} placeholder="e.g. 400 sqft" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Amenities" name="amenities" value={formData.amenities} onChange={handleChange} placeholder="e.g. Free WiFi, Mini Bar" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth multiline rows={2} label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Elegantly appointed space featuring premium amenities..." />
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
