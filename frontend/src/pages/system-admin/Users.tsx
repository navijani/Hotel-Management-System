import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Alert, CircularProgress, Stack
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import axios from 'axios';

type StaffUser = {
  id: number;
  username: string;
  role: string;
  active: boolean;
  created_at: string;
};

const roleOptions = [
<<<<<<< HEAD
=======
  { value: 'receptionist', label: 'Front Desk / Reception' },
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
  { value: 'cleaning', label: 'Cleaning Staff' },
  { value: 'bar', label: 'Bar Keeping Staff' },
  { value: 'therapist', label: 'Therapist Staff' },
  { value: 'waiter', label: 'Waiter Staff' },
  { value: 'admin', label: 'Administrator' },
];
<<<<<<< HEAD
=======

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('staffToken') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028

const Users: React.FC = () => {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add User Dialog State
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('cleaning');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
<<<<<<< HEAD
    try {
      const response = await axios.get<StaffUser[]>('/api/staff');
      setUsers(response.data);
    } catch {
      setError('Unable to load users from database.');
=======
    setError('');
    try {
      // Calls standard /api/staff with optional auth headers to prevent 401
      const response = await axios.get<StaffUser[]>('/api/staff', {
        headers: getAuthHeaders(),
      });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.error || 'Unable to load users from database.');
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setNewUsername('');
    setNewPassword('');
    setNewRole('cleaning');
    setAddError('');
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) {
      setAddError('Username/email and password are required.');
      return;
    }

    setIsSubmitting(true);
    setAddError('');

    try {
<<<<<<< HEAD
      await axios.post('/api/staff', {
        username: newUsername.trim(),
        password: newPassword,
        role: newRole,
      });
=======
      await axios.post(
        '/api/staff',
        {
          username: newUsername.trim(),
          password: newPassword,
          role: newRole,
        },
        { headers: getAuthHeaders() }
      );
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028

      setSuccess(`User "${newUsername.trim()}" added successfully.`);
      handleCloseAddModal();
      await fetchUsers();
<<<<<<< HEAD
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setAddError(err.response?.data?.error || 'Failed to create user.');
      } else {
        setAddError('Failed to create user.');
      }
=======
    } catch (err: any) {
      setAddError(err.response?.data?.error || 'Failed to create user.');
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    try {
<<<<<<< HEAD
      await axios.delete(`/api/staff/${deleteTarget.id}`);
      setSuccess(`User "${deleteTarget.username}" removed successfully.`);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to remove user.');
      } else {
        setError('Failed to remove user.');
      }
=======
      await axios.delete(`/api/staff/${deleteTarget.id}`, {
        headers: getAuthHeaders(),
      });
      setSuccess(`User "${deleteTarget.username}" removed successfully.`);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove user.');
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e' }}>
            Users & Staff Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Directly add or remove user accounts across all resort departments.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpenAddModal}
          sx={{ bgcolor: '#4facfe', borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600 }}
        >
          Add New User
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Username / Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', align: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No users found. Click "Add New User" to create one.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>#{user.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{user.username}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      variant="outlined" 
                      color={user.role === 'admin' ? 'primary' : 'default'} 
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.active ? 'Active' : 'Inactive'} 
                      color={user.active ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<DeleteIcon fontSize="small" />}
                      onClick={() => setDeleteTarget(user)}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Dialog */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="primary" /> Add New User / Staff
        </DialogTitle>
        <Box component="form" onSubmit={handleAddUserSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <Typography variant="body2" color="text.secondary">
<<<<<<< HEAD
                Directly create a staff or user account. No approval required; the user can log in immediately.
=======
                Directly create a staff or user account. The user will be able to log in immediately.
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
              </Typography>
              {addError && <Alert severity="error">{addError}</Alert>}
              <TextField
                select
                label="Role / Department"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                fullWidth
                required
              >
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Username or Email"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseAddModal} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ bgcolor: '#4facfe' }}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

<<<<<<< HEAD
      {/* Delete User Confirmation Dialog */}
=======
      {/* Delete Confirmation Dialog */}
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Confirm Remove User</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to remove user <strong>{deleteTarget?.username}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action will permanently delete their account and access rights.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Remove User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;