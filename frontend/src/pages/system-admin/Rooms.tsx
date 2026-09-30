import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Grid, CircularProgress, Alert, Tooltip, Avatar
, InputAdornment} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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

const mockRooms: any[] = [
  { room_id: 1, room_number: '101', type: 'Deluxe Ocean View', capacity: 2, price_per_night: 250, status: 'Available', image_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop', description: 'Elegantly appointed space featuring premium amenities and stunning ocean views.', bed_type: 'King Bed', room_size: '450 sqft', amenities: 'Free WiFi, Balcony' },
  { room_id: 2, room_number: '102', type: 'Premium Suite', capacity: 4, price_per_night: 450, status: 'Available', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop', description: 'Spacious suite with separate living area and exclusive lounge access.', bed_type: '2 Queen Beds', room_size: '600 sqft', amenities: 'Free WiFi, Lounge Access' },
  { room_id: 3, room_number: '103', type: 'Standard Garden', capacity: 2, price_per_night: 150, status: 'Occupied', image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop', description: 'Cozy room with beautiful views of our award-winning gardens.', bed_type: 'Queen Bed', room_size: '350 sqft', amenities: 'Free WiFi' },
  { room_id: 4, room_number: '104', type: 'Executive Suite', capacity: 2, price_per_night: 550, status: 'Available', image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop', description: 'Luxurious suite featuring panoramic city views and private dining area.', bed_type: 'King Bed', room_size: '750 sqft', amenities: 'Free WiFi, Mini Bar, Lounge Access' },
  { room_id: 5, room_number: '105', type: 'Family Room', capacity: 4, price_per_night: 200, status: 'Available', image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop', description: 'Spacious accommodation perfect for family getaways with interconnected rooms.', bed_type: '2 Queen Beds', room_size: '500 sqft', amenities: 'Free WiFi, TV, Kitchenette' },
  { room_id: 6, room_number: '106', type: 'Presidential Suite', capacity: 2, price_per_night: 1200, status: 'Occupied', image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop', description: 'The ultimate luxury experience with a private terrace and personal butler service.', bed_type: 'King Bed', room_size: '1200 sqft', amenities: 'Free WiFi, Private Pool, Butler' },
  { room_id: 7, room_number: '107', type: 'Standard City View', capacity: 2, price_per_night: 130, status: 'Available', image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop', description: 'Comfortable room overlooking the vibrant city skyline.', bed_type: 'Queen Bed', room_size: '300 sqft', amenities: 'Free WiFi' },
  { room_id: 8, room_number: '108', type: 'Deluxe Twin', capacity: 2, price_per_night: 180, status: 'Available', image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000&auto=format&fit=crop', description: 'Elegant twin room ideal for friends or colleagues traveling together.', bed_type: '2 Twin Beds', room_size: '400 sqft', amenities: 'Free WiFi, Balcony' },
  { room_id: 9, room_number: '109', type: 'Penthouse Suite', capacity: 4, price_per_night: 850, status: 'Available', image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop', description: 'Top-floor suite offering spectacular 360-degree views and luxury furnishings.', bed_type: 'King Bed', room_size: '900 sqft', amenities: 'Free WiFi, Jacuzzi, Lounge Access' },
  { room_id: 10, room_number: '110', type: 'Cozy Single', capacity: 1, price_per_night: 90, status: 'Occupied', image_url: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1000&auto=format&fit=crop', description: 'A snug and comfortable space tailored for solo travelers.', bed_type: 'Single Bed', room_size: '200 sqft', amenities: 'Free WiFi' },
  { room_id: 11, room_number: '201', type: 'Oceanfront Villa', capacity: 4, price_per_night: 650, status: 'Available', image_url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1000&auto=format&fit=crop', description: 'Private villa steps away from the beach with your own plunge pool.', bed_type: 'King Bed', room_size: '800 sqft', amenities: 'Free WiFi, Plunge Pool, Beach Access' },
  { room_id: 12, room_number: '202', type: 'Honeymoon Suite', capacity: 2, price_per_night: 500, status: 'Available', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop', description: 'Romantic suite designed for couples, featuring a spa bath and ocean views.', bed_type: 'King Bed', room_size: '550 sqft', amenities: 'Free WiFi, Spa Bath, Balcony' },
  { room_id: 13, room_number: '203', type: 'Business Studio', capacity: 2, price_per_night: 220, status: 'Occupied', image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1000&auto=format&fit=crop', description: 'Modern studio equipped with a spacious work desk and high-speed internet.', bed_type: 'Queen Bed', room_size: '450 sqft', amenities: 'High-speed WiFi, Work Desk' }
];

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchRooms = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/rooms')
      .then(response => {
        setRooms(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching rooms', err);
        setRooms(mockRooms);
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
      image_url: (room as any).image_url || (room as any).image || '',
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


      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField 
          placeholder="Search by room number or type..." 
          variant="outlined" 
          size="small" 
          sx={{ flexGrow: 1, bgcolor: 'white', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }
          }}
        />
        <TextField 
          select 
          size="small" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150, bgcolor: 'white', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value="Available">Available</MenuItem>
          <MenuItem value="Occupied">Occupied</MenuItem>
          <MenuItem value="Maintenance">Maintenance</MenuItem>
        </TextField>
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
            ) : rooms.filter(room => {
                if (searchQuery && !room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) && !(room.type || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
                if (statusFilter !== 'All' && room.status !== statusFilter) return false;
                return true;
            }).length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No rooms found.</Typography></TableCell></TableRow>
            ) : (
              rooms.filter(room => {
                if (searchQuery && !room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) && !(room.type || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
                if (statusFilter !== 'All' && room.status !== statusFilter) return false;
                return true;
              }).map((room) => (
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
              {!imageFile && formData.image_url && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">Current Image:</Typography>
                  <Box 
                    component="img" 
                    src={formData.image_url} 
                    alt="Room preview" 
                    sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 2, mt: 1 }} 
                  />
                </Box>
              )}
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
