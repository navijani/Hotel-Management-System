import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const adminHeaders = { 'x-user-role': 'admin' };

type BarItem = {
  item_id: number;
  item_name: string;
  category: string;
  size: number;
  in_stock: number;
  unit_price: number;
  last_updated_by: number | null;
};

const getErrorMessage = async (response: Response) => {
  const body = await response.json().catch(() => ({}));
  return body.error || 'Unable to complete the bar inventory request.';
};

const BarItemsAdmin = () => {
  const [items, setItems] = useState<BarItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Soft Drink');
  const [size, setSize] = useState('330');
  const [stock, setStock] = useState('0');
  const [unitPrice, setUnitPrice] = useState('0');
  const [image, setImage] = useState<File | null>(null);

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BarItem | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSize, setEditSize] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/bar/items`);
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setItems(await response.json());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load bar items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImage(event.target.files?.[0] || null);
  };

  const handleEditImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditImage(event.target.files?.[0] || null);
  };

  const handleOpenEdit = (item: BarItem) => {
    setEditingItem(item);
    setEditItemName(item.item_name);
    setEditCategory(item.category);
    setEditSize(String(item.size));
    setEditStock(String(item.in_stock));
    setEditUnitPrice(String(item.unit_price));
    setEditImage(null);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditingItem(null);
    setEditImage(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    const formData = new FormData();
    formData.append('item_name', itemName);
    formData.append('category', category);
    formData.append('size', size);
    formData.append('in_stock', stock);
    formData.append('unit_price', unitPrice);
    if (image) formData.append('image', image);

    try {
      const response = await fetch(`${API_BASE}/admin/bar/items`, {
        method: 'POST',
        headers: adminHeaders,
        body: formData,
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setMessage('Bar item added successfully.');
      setItemName('');
      setCategory('Soft Drink');
      setSize('330');
      setStock('0');
      setUnitPrice('0');
      setImage(null);
      const fileInput = document.getElementById('bar-item-image') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      await loadItems();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to add bar item.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingItem) return;
    setUpdating(true);
    setError('');
    setMessage('');
    const formData = new FormData();
    formData.append('item_name', editItemName);
    formData.append('category', editCategory);
    formData.append('size', editSize);
    formData.append('in_stock', editStock);
    formData.append('unit_price', editUnitPrice);
    if (editImage) formData.append('image', editImage);

    try {
      const response = await fetch(`${API_BASE}/admin/bar/items/${editingItem.item_id}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: formData,
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setMessage('Bar item updated successfully.');
      handleCloseEdit();
      await loadItems();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update bar item.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to delete this beverage item?')) return;
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${API_BASE}/admin/bar/items/${itemId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setMessage('Bar item deleted successfully.');
      await loadItems();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete bar item.');
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Box>
          <Typography variant="overline" color="primary">Bar inventory</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Beverage Management</Typography>
          <Typography color="text.secondary">Add, edit, manage products, pricing, images, and stock.</Typography>
        </Box>
        <Inventory2Icon sx={{ fontSize: 42, color: 'primary.main' }} />
      </Stack>
      {message && <Alert severity="success" onClose={() => setMessage('')} sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

      {/* Add New Beverage Form */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <CardContent component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>New Beverage Item</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}><TextField label="Item name" value={itemName} onChange={(event) => setItemName(event.target.value)} required fullWidth /></Grid>
            <Grid size={{ xs: 12, md: 2 }}><TextField label="Category" value={category} onChange={(event) => setCategory(event.target.value)} fullWidth /></Grid>
            <Grid size={{ xs: 6, md: 2 }}><TextField label="Size (ml)" type="number" value={size} onChange={(event) => setSize(event.target.value)} required fullWidth /></Grid>
            <Grid size={{ xs: 6, md: 2 }}><TextField label="Unit price ($)" type="number" slotProps={{ htmlInput: { min: 0, step: '0.01' } }} value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} required fullWidth /></Grid>
            <Grid size={{ xs: 6, md: 2 }}><TextField label="Opening stock" type="number" slotProps={{ htmlInput: { min: 0, step: 1 } }} value={stock} onChange={(event) => setStock(event.target.value)} required fullWidth /></Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateIcon />} fullWidth sx={{ height: '100%', justifyContent: 'flex-start' }}>
                {image ? image.name : 'Choose item image'}
                <input id="bar-item-image" hidden type="file" accept="image/*" onChange={handleImageChange} />
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}><Button type="submit" variant="contained" fullWidth disabled={saving} sx={{ height: '100%', py: 1.5, fontWeight: 'bold' }}>{saving ? <CircularProgress size={24} color="inherit" /> : 'Add Beverage Item'}</Button></Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Beverage Items Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#1a1a1a' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Image</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Size</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Price ($)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Stock</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
            ) : items.map((item) => (
              <TableRow key={item.item_id} hover>
                <TableCell>
                  <Box component="img" src={`${API_BASE}/bar/items/${item.item_id}/image`} alt={item.item_name} sx={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 2, border: '1px solid #eee', bgcolor: 'grey.100' }} />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{item.item_name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.size} ml</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>${Number(item.unit_price).toFixed(2)}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{item.in_stock}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpenEdit(item)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item.item_id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && items.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No beverage items added yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Beverage Dialog Modal */}
      {editingItem && (
        <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', fontWeight: 'bold' }}>
            Edit Beverage: {editingItem.item_name}
          </DialogTitle>
          <form onSubmit={handleUpdateSubmit}>
            <DialogContent dividers sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Item Name" value={editItemName} onChange={(e) => setEditItemName(e.target.value)} required fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Category" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} required fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Size (ml)" type="number" value={editSize} onChange={(e) => setEditSize(e.target.value)} required fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Unit Price ($)" type="number" slotProps={{ htmlInput: { min: 0, step: '0.01' } }} value={editUnitPrice} onChange={(e) => setEditUnitPrice(e.target.value)} required fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Stock Quantity" type="number" slotProps={{ htmlInput: { min: 0, step: 1 } }} value={editStock} onChange={(e) => setEditStock(e.target.value)} required fullWidth />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateIcon />} fullWidth sx={{ py: 1.5, justifyContent: 'flex-start' }}>
                    {editImage ? editImage.name : 'Update Beverage Image (Optional)'}
                    <input hidden type="file" accept="image/*" onChange={handleEditImageChange} />
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f9f9f9' }}>
              <Button onClick={handleCloseEdit} color="inherit">Cancel</Button>
              <Button type="submit" variant="contained" disabled={updating} sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#d4af37', color: '#1a1a1a' } }}>
                {updating ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
};

export default BarItemsAdmin;
