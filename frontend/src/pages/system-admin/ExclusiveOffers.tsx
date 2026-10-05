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
}

const ExclusiveOffers: React.FC = () => {
  const [offers, setOffers] = useState<ExclusiveOffer[]>([]);
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/offers');
      if (!res.ok) throw new Error('Failed to load exclusive offers.');
      const data = await res.json();
      setOffers(data);
    } catch (err: any) {
      setError(err.message || 'Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setPopup('');
    setTopic('');
    setDetails('');
    setMoreDetails('');
    setActive(true);
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
    setSelectedFile(null);
    setImagePreview(offer.image);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFile(null);
    setImagePreview(null);
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

      if (selectedFile) {
        formData.append('image', selectedFile);
      } else if (imagePreview && imagePreview.startsWith('data:')) {
        formData.append('image_base64', imagePreview);
      }

      const url = editingId ? `/api/offers/${editingId}` : '/api/offers';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save offer.');
      }

      setSuccessMsg(editingId ? 'Exclusive Offer updated successfully!' : 'Exclusive Offer created successfully!');
      handleCloseDialog();
      fetchOffers();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/offers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status.');
      setOffers(prev => prev.map(o => o.id === id ? { ...o, active: !currentStatus } : o));
    } catch (err: any) {
      setError(err.message || 'Error updating offer status.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this exclusive offer?')) return;
    try {
      const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete offer.');
      setSuccessMsg('Offer deleted successfully.');
      setOffers(prev => prev.filter(o => o.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error deleting offer.');
    }
  };

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
            Manage the promotions and special packages featured on the website's homepage.
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
              Reference Guide: How Offers Appear on Main Page
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Below is the visual guide illustrating where each database field (Popup, Topic, Details, Image, More Details) appears on the Exclusive Offer card on the home page:
          </Typography>
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box 
                component="img"
                src="/images/guide_offer.png"
                alt="Exclusive Offer Layout Guide"
                sx={{
                  width: '100%',
                  maxHeight: 320,
                  objectFit: 'contain',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  bgcolor: '#ffffff',
                  p: 1
                }}
                onError={(e: any) => {
                  e.target.src = '/images/romantic.jpg';
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ bgcolor: '#fff', border: '1px dashed #d4af37', p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d4af37', mb: 1 }}>
                  Field Mapping Cheat-Sheet:
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.8 }}>
                  🏷️ <strong>Popup:</strong> Discount tag on top-left of image (e.g. <em>15% Off</em>, <em>Free Upgrades</em>)
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.8 }}>
                  📌 <strong>Topic:</strong> Offer Heading / Title (e.g. <em>Romantic Getaway</em>)
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.8 }}>
                  📝 <strong>Details:</strong> Summary text shown on card (max ~50 chars)
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.8 }}>
                  📖 <strong>More Details:</strong> Full text shown when guest clicks <em>"View Details"</em>
                </Typography>
                <Typography variant="body2">
                  🖼️ <strong>Image:</strong> Uploaded offer banner photo (stored directly in DB as MEDIUMBLOB)
                </Typography>
              </Card>
            </Grid>
          </Grid>
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
                  <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((offer) => (
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
                    <TableCell sx={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {offer.details}
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
                ))}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Popup (Badge Tag)"
                      placeholder="e.g. 15% Off"
                      fullWidth
                      value={popup}
                      onChange={(e) => setPopup(e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 50 } }}
                      helperText="Badge shown over image (max 50 chars)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Topic (Offer Title)"
                      placeholder="e.g. Romantic Getaway"
                      fullWidth
                      required
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 50 } }}
                      helperText="Main heading of the offer"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Details (Short Summary)"
                      placeholder="e.g. Enjoy a romantic weekend with complimentary champagne..."
                      fullWidth
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 150 } }}
                      helperText="Displayed directly on card summary"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="More Details (Full Description)"
                      placeholder="Provide complete breakdown of inclusion, terms, and perks..."
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
                      {selectedFile ? `Selected: ${selectedFile.name}` : 'Upload Offer Image (Saved as MEDIUMBLOB)'}
                      <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch checked={active} onChange={(e) => setActive(e.target.checked)} color="warning" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Active on Homepage ({active ? 'Yes' : 'No'})
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
                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 220, border: '1px solid #e0e0e0', boxShadow: 3 }}>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 140,
                      backgroundImage: `url("${imagePreview || '/images/romantic.jpg'}")`,
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
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {topic || 'Offer Topic Title'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
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
              {submitting ? 'Saving...' : editingId ? 'Update Offer' : 'Save Offer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ExclusiveOffers;
