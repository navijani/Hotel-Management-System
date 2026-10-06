import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  HelpOutlined as HelpIcon,
  CloudUpload as UploadIcon,
  Visibility as PreviewIcon,
  LocalOffer as OfferIcon,
} from '@mui/icons-material';

interface ExclusiveOffer {
  id: number;
  popup: string;
  topic: string;
  details: string;
  more_details: string;
  image: string | null;
  active: boolean;
  room_id?: number | null;
  branch_id?: number | null;
  discount?: number;
}

interface RoomOption {
  room_id: number;
  room_number: string;
  type: string;
  price_per_night: number;
  branch_id: number;
  status: string;
  image?: string;
  description?: string;
}

const BRANCHES = [
  { id: 1, name: 'Colombo Branch' },
  { id: 2, name: 'Kandy Branch' },
  { id: 3, name: 'Galle Branch' }
];

const ExclusiveOffers: React.FC = () => {
  const [offers, setOffers] = useState<ExclusiveOffer[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reference guide expand state
  const [showGuide, setShowGuide] = useState<boolean>(true);

  // Dialog State
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [popup, setPopup] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [moreDetails, setMoreDetails] = useState<string>('');
  const [active, setActive] = useState<boolean>(true);
  const [selectedBranchId, setSelectedBranchId] = useState<number | ''>(1);
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>(15);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const API_BASE = import.meta.env.VITE_API_URL || '';

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/offers`);
      if (!res.ok) {
        throw new Error(`Failed to load exclusive offers (Status: ${res.status}).`);
      }
      const data = await res.json();
      setOffers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Fetch offers error:', err);
      setError(err.message || 'Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rooms`);
      if (res.ok) {
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch rooms for offers management:', err);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchRooms();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setPopup('15% Off');
    setTopic('');
    setDetails('');
    setMoreDetails('');
    setActive(true);
    setSelectedBranchId(1);
    setSelectedRoomId('');
    setDiscount(15);
    setSelectedFile(null);
    setImagePreview(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (offer: ExclusiveOffer) => {
    setEditingId(offer.id);
    setPopup(offer.popup || '');
    setTopic(offer.topic || '');
    setDetails(offer.details || '');
    setMoreDetails(offer.more_details || '');
    setActive(offer.active);
    setSelectedBranchId(offer.branch_id || 1);
    setSelectedRoomId(offer.room_id || '');
    setDiscount(offer.discount !== undefined ? offer.discount : 0);
    setSelectedFile(null);
    setImagePreview(offer.image);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleRoomSelect = (roomId: number) => {
    setSelectedRoomId(roomId);
    const room = rooms.find(r => r.room_id === roomId);
    if (room) {
      if (!topic) setTopic(`${room.type} Special Deal`);
      if (!details) setDetails(`Special ${discount || 15}% discount on Room ${room.room_number} (${room.type}).`);
      if (room.branch_id) setSelectedBranchId(room.branch_id);
      if (!imagePreview && room.image) setImagePreview(room.image);
    }
  };

  const handleDiscountChange = (val: number) => {
    setDiscount(val);
    if (val > 0) {
      setPopup(`${val}% Off`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Topic / Title is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const formData = new FormData();
      formData.append('popup', popup);
      formData.append('topic', topic);
      formData.append('details', details);
      formData.append('more_details', moreDetails);
      formData.append('active', String(active));
      formData.append('branch_id', String(selectedBranchId || 1));
      formData.append('room_id', selectedRoomId ? String(selectedRoomId) : '');
      formData.append('discount', String(discount || 0));

      if (selectedFile) {
        formData.append('image', selectedFile);
      } else if (imagePreview && imagePreview.startsWith('data:')) {
        formData.append('image_base64', imagePreview);
      }

      const url = editingId ? `${API_BASE}/api/offers/${editingId}` : `${API_BASE}/api/offers`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        let errMessage = 'Failed to save offer.';
        try {
          const resClone = res.clone();
          try {
            const errData = await res.json();
            errMessage = errData.error || errMessage;
          } catch (e) {
            const rawText = await resClone.text();
            errMessage = rawText || errMessage;
          }
        } catch (e) {
          console.error('Error reading response:', e);
        }
        throw new Error(errMessage);
      }

      setSuccessMsg(editingId ? 'Exclusive Offer updated successfully!' : 'Exclusive Offer created successfully!');
      handleCloseDialog();
      fetchOffers();
      fetchRooms(); // Refresh rooms to see discount updates
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/api/offers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status.');
      setOffers(prev => prev.map(o => o.id === id ? { ...o, active: !currentStatus } : o));
      fetchRooms();
    } catch (err: any) {
      setError(err.message || 'Error updating offer status.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this exclusive offer?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/offers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete offer.');
      setSuccessMsg('Offer deleted successfully.');
      setOffers(prev => prev.filter(o => o.id !== id));
      fetchRooms();
    } catch (err: any) {
      setError(err.message || 'Error deleting offer.');
    }
  };

  const currentSelectedRoom = rooms.find(r => r.room_id === selectedRoomId);
  const filteredRooms = rooms.filter(r => !selectedBranchId || r.branch_id === selectedBranchId || rooms.every(room => !room.branch_id));

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <OfferIcon sx={{ color: '#d4af37', fontSize: 36 }} />
            Exclusive Offers Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage room discounts, promotions, and special packages featured on the website.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<HelpIcon />}
            onClick={() => setShowGuide(!showGuide)}
            sx={{ borderColor: '#d4af37', color: '#1a1a1a', '&:hover': { borderColor: '#b89628', bgcolor: 'rgba(212,175,55,0.08)' } }}
          >
            {showGuide ? 'Hide Layout Guide' : 'Show Layout Guide'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ bgcolor: '#1a1a1a', color: '#fff', '&:hover': { bgcolor: '#d4af37' } }}
          >
            Add New Offer
          </Button>
        </Box>
      </Box>

      {/* Notifications */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      {/* Reference Image Guide Section */}
      <Collapse in={showGuide}>
        <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#fbf8f2', border: '1px solid #e0d5c1', borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <HelpIcon sx={{ color: '#d4af37' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
              Reference Guide: How Offers & Room Discounts Work
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Adding an offer with a Room and Discount percentage automatically updates the Room table discount attribute! Discounted rooms will be listed at the top of guest search results with original price strikethrough.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Box
              component="img"
              src="/images/guide_offer.png"
              alt="Exclusive Offer Layout Guide"
              sx={{
                width: '100%',
                maxWidth: 750,
                maxHeight: 320,
                objectFit: 'contain',
                borderRadius: 3,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                bgcolor: '#ffffff',
                p: 1.5
              }}
              onError={(e: any) => {
                e.target.src = '/images/romantic.jpg';
              }}
            />
          </Box>
        </Paper>
      </Collapse>

      {/* Offers List Table */}
      <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, bgcolor: '#1a1a1a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Current Exclusive Offers ({offers.length})
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#d4af37' }} />
          </Box>
        ) : offers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              No exclusive offers created yet. Click "Add New Offer" to create one!
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Badge (Popup)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Topic / Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Linked Room</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Discount</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((offer) => {
                  const linkedRoom = rooms.find(r => r.room_id === offer.room_id);
                  return (
                    <TableRow key={offer.id} hover>
                      <TableCell>#{offer.id}</TableCell>
                      <TableCell>
                        <Box
                          component="img"
                          src={offer.image || '/images/romantic.jpg'}
                          alt={offer.topic}
                          sx={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 1.5, border: '1px solid #eee' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={offer.popup || 'N/A'}
                          size="small"
                          sx={{ bgcolor: '#d4af37', color: 'white', fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{offer.topic}</TableCell>
                      <TableCell>
                        {linkedRoom ? (
                          <Chip
                            label={`Room ${linkedRoom.room_number} (${linkedRoom.type})`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">General Offer</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#e65100' }}>
                        {offer.discount ? `${offer.discount}% OFF` : '0%'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            checked={offer.active}
                            onChange={() => handleToggleActive(offer.id, offer.active)}
                            color="warning"
                            size="small"
                          />
                          <Typography variant="caption" sx={{ color: offer.active ? 'success.main' : 'text.disabled', fontWeight: 600 }}>
                            {offer.active ? 'Active' : 'Disabled'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(offer)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(offer.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add / Edit Offer Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', fontWeight: 'bold' }}>
          {editingId ? `Edit Offer #${editingId}` : 'Create New Exclusive Offer'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Form Input Column */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Grid container spacing={2}>

                  {/* Branch & Room Selection */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      label="Select Branch"
                      fullWidth
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                      helperText="Target hotel location"
                    >
                      {BRANCHES.map((b) => (
                        <MenuItem key={b.id} value={b.id}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      label="Select Room"
                      fullWidth
                      value={selectedRoomId}
                      onChange={(e) => handleRoomSelect(Number(e.target.value))}
                      helperText="Room to apply discount to"
                    >
                      <MenuItem value="">
                        <em>None (General Offer)</em>
                      </MenuItem>
                      {(filteredRooms.length > 0 ? filteredRooms : rooms).map((r) => (
                        <MenuItem key={r.room_id} value={r.room_id}>
                          Room {r.room_number} - {r.type} (${r.price_per_night}/night)
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Discount (%)"
                      type="number"
                      placeholder="e.g. 15"
                      fullWidth
                      value={discount}
                      onChange={(e) => handleDiscountChange(Number(e.target.value))}
                      slotProps={{ htmlInput: { min: 0, max: 100 } }}
                      helperText="Updates Room table discount attribute"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Popup (Badge Tag)"
                      placeholder="e.g. 15% Off"
                      fullWidth
                      value={popup}
                      onChange={(e) => setPopup(e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 50 } }}
                      helperText="Badge shown over offer card"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Topic (Offer Title)"
                      placeholder="e.g. Summer Special 15% Discount"
                      fullWidth
                      required
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 100 } }}
                      helperText="Main title of the offer"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Details (Short Summary)"
                      placeholder="e.g. Book now and enjoy 15% off on our Deluxe Ocean View suite..."
                      fullWidth
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 180 } }}
                      helperText="Displayed on offer card summary"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="More Details (Full Description & Terms)"
                      placeholder="Provide full breakdown of inclusions, terms, and booking instructions..."
                      fullWidth
                      multiline
                      rows={3}
                      value={moreDetails}
                      onChange={(e) => setMoreDetails(e.target.value)}
                      helperText="Shown when guest clicks View Details button"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                      fullWidth
                      sx={{ py: 1.2, borderColor: '#1a1a1a', color: '#1a1a1a', '&:hover': { borderColor: '#d4af37' } }}
                    >
                      {selectedFile ? `Selected: ${selectedFile.name}` : 'Upload Custom Offer Image'}
                      <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                    </Button>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch checked={active} onChange={(e) => setActive(e.target.checked)} color="warning" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Active & Published ({active ? 'Yes' : 'No'})
                      </Typography>
                    </Box>
                  </Grid>

                </Grid>
              </Grid>

              {/* Live Preview Column */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PreviewIcon fontSize="small" sx={{ color: '#d4af37' }} />
                  Live Guest Card Preview:
                </Typography>
                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 250, border: '1px solid #e0e0e0', boxShadow: 3 }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 140,
                      backgroundImage: `url("${imagePreview || currentSelectedRoom?.image || '/images/romantic.jpg'}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      bgcolor: '#eee'
                    }}
                  >
                    {popup && (
                      <Chip
                        label={popup}
                        sx={{ position: 'absolute', top: 12, left: 12, bgcolor: '#d4af37', color: 'white', fontWeight: 'bold' }}
                      />
                    )}
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {topic || 'Offer Topic Title'}
                    </Typography>
                    {currentSelectedRoom && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Linked Room: Room {currentSelectedRoom.room_number} ({currentSelectedRoom.type})
                        </Typography>
                        {discount ? (
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#d4af37' }}>
                            <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '6px' }}>
                              ${currentSelectedRoom.price_per_night}
                            </span>
                            ${Math.round(currentSelectedRoom.price_per_night * (1 - Number(discount) / 100))} / night ({discount}% off)
                          </Typography>
                        ) : null}
                      </Box>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 36 }}>
                      {details || 'Short details description will appear here...'}
                    </Typography>
                    <Button variant="outlined" size="small" sx={{ color: '#1a1a1a', borderColor: '#d4af37' }}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f9f9f9' }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ bgcolor: '#1a1a1a', color: '#fff', '&:hover': { bgcolor: '#d4af37' } }}
            >
              {submitting ? 'Saving...' : editingId ? 'Update Offer' : 'Save Offer & Update Room Discount'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ExclusiveOffers;
