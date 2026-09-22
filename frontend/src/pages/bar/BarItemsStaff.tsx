import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const staffSessionKey = 'hmsStaffSession';

type BarItem = {
  item_id: number;
  item_name: string;
  category: string;
  size: number;
  in_stock: number;
  unit_price: number;
};

type StaffSession = { id: number; role: string; username: string };

const getErrorMessage = async (response: Response) => {
  const body = await response.json().catch(() => ({}));
  return body.error || 'Unable to update bar stock.';
};

const BarItemsStaff = () => {
  const [items, setItems] = useState<BarItem[]>([]);
  const [session] = useState<StaffSession | null>(() => {
    const saved = window.sessionStorage.getItem(staffSessionKey);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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

  const updateStock = async (item: BarItem, nextValue: string) => {
    if (!session) return;
    const nextStock = Number(nextValue);
    if (!Number.isInteger(nextStock) || nextStock < 0 || nextStock === item.in_stock) return;
    setSavingId(item.item_id);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${API_BASE}/bar/items/${item.item_id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ added_stock: nextStock - item.in_stock, staff_id: session.id }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setItems((current) => current.map((currentItem) => currentItem.item_id === item.item_id ? { ...currentItem, in_stock: nextStock } : currentItem));
      setMessage(`${item.item_name} stock updated.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update stock.');
    } finally {
      setSavingId(null);
    }
  };

  if (!session || !['bar', 'waiter'].includes(session.role)) {
    return <Alert severity="error">Only bar staff and waiters can access bar stock updates.</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <InventoryIcon color="primary" />
        <Typography variant="h4">Update bar items</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Typography color="text.secondary">Update available stock counts. Product details are managed by administrators.</Typography>
        <Button variant="text" onClick={() => navigate('/staff')}>Back to workspace</Button>
      </Box>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead><TableRow><TableCell>Image</TableCell><TableCell>Item</TableCell><TableCell>Category</TableCell><TableCell>Size</TableCell><TableCell>Price</TableCell><TableCell>Available stock</TableCell></TableRow></TableHead>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow> : items.map((item) => (
              <TableRow key={item.item_id} hover>
                <TableCell><Box component="img" src={`${API_BASE}/bar/items/${item.item_id}/image`} alt="" sx={{ width: 64, aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 1, bgcolor: 'grey.100' }} /></TableCell>
                <TableCell>{item.item_name}</TableCell><TableCell>{item.category}</TableCell><TableCell>{item.size} ml</TableCell><TableCell>{Number(item.unit_price).toFixed(2)}</TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  <TextField type="number" size="small" label="Stock" defaultValue={item.in_stock} slotProps={{ htmlInput: { min: 0, step: 1 } }} disabled={savingId === item.item_id} onBlur={(event) => updateStock(item, event.target.value)} />
                </TableCell>
              </TableRow>
            ))}
            {!loading && items.length === 0 && <TableRow><TableCell colSpan={6} align="center">No bar items available.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BarItemsStaff;
