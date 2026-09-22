import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
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

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Box>
          <Typography variant="overline" color="primary">Bar inventory</Typography>
          <Typography variant="h4">Add bar items</Typography>
          <Typography color="text.secondary">Manage products, pricing, images, and stock.</Typography>
        </Box>
        <Inventory2Icon sx={{ fontSize: 42, color: 'primary.main' }} />
      </Stack>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 2 }}>New bar item</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}><TextField label="Item name" value={itemName} onChange={(event) => setItemName(event.target.value)} required fullWidth /></Grid>
            <Grid size={{ xs: 12, md: 2 }}><TextField label="Category" value={category} onChange={(event) => setCategory(event.target.value)} fullWidth /></Grid>
            <Grid size={{ xs: 6, md: 2 }}><TextField label="Size (ml)" type="number" value={size} onChange={(event) => setSize(event.target.value)} required fullWidth /></Grid>
            <Grid size={{ xs: 6, md: 2 }}><TextField label="Unit price" type="number" slotProps={{ htmlInput: { min: 0, step: '0.01' } }} value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} required fullWidth /></Grid>
            <Grid size={{ xs: 6, md: 2 }}><TextField label="Opening stock" type="number" slotProps={{ htmlInput: { min: 0, step: 1 } }} value={stock} onChange={(event) => setStock(event.target.value)} required fullWidth /></Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateIcon />} fullWidth sx={{ height: '100%', justifyContent: 'flex-start' }}>
                {image ? image.name : 'Choose item image'}
                <input id="bar-item-image" hidden type="file" accept="image/*" onChange={handleImageChange} />
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}><Button type="submit" variant="contained" fullWidth disabled={saving} sx={{ height: '100%' }}>{saving ? <CircularProgress size={24} color="inherit" /> : 'Add item'}</Button></Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead><TableRow><TableCell>Image</TableCell><TableCell>Name</TableCell><TableCell>Category</TableCell><TableCell>Size</TableCell><TableCell>Price</TableCell><TableCell>Stock</TableCell></TableRow></TableHead>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow> : items.map((item) => (
              <TableRow key={item.item_id} hover>
                <TableCell><Box component="img" src={`${API_BASE}/bar/items/${item.item_id}/image`} alt="" sx={{ width: 64, aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 1, bgcolor: 'grey.100' }} /></TableCell>
                <TableCell>{item.item_name}</TableCell><TableCell>{item.category}</TableCell><TableCell>{item.size} ml</TableCell><TableCell>{Number(item.unit_price).toFixed(2)}</TableCell><TableCell>{item.in_stock}</TableCell>
              </TableRow>
            ))}
            {!loading && items.length === 0 && <TableRow><TableCell colSpan={6} align="center">No bar items yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BarItemsAdmin;
