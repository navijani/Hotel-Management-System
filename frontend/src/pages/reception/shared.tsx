import React from 'react';
import { Chip } from '@mui/material';
import type { BookingStatus } from '../../api/reception';

export const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium' });
const dateTimeFormatter = new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium', timeStyle: 'short' });

export const formatDate = (value: string) => dateFormatter.format(new Date(value));
export const formatDateTime = (value: string) => dateTimeFormatter.format(new Date(value));

export const surfaceSx = {
  borderRadius: 3,
  border: '1px solid rgba(0,0,0,0.05)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
} as const;

export const featureCardSx = {
  ...surfaceSx,
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' },
} as const;

export const darkButtonSx = {
  bgcolor: '#1a1a1a',
  color: '#fff',
  textTransform: 'none',
  fontWeight: 700,
  '&:hover': { bgcolor: '#d4af37' },
} as const;

export const outlineButtonSx = {
  borderColor: '#1a1a1a',
  color: '#1a1a1a',
  textTransform: 'none',
  fontWeight: 700,
  '&:hover': { borderColor: '#d4af37', color: '#d4af37', bgcolor: 'rgba(212,175,55,0.08)' },
} as const;

export const headCellSx = { fontWeight: 700 } as const;

const statusColors: Record<BookingStatus, 'primary' | 'success' | 'default' | 'error'> = {
  Booked: 'primary',
  'Checked-In': 'success',
  'Checked-Out': 'default',
  Cancelled: 'error',
};

export const StatusChip: React.FC<{ status: BookingStatus }> = ({ status }) => (
  <Chip size="small" label={status} color={statusColors[status] ?? 'default'} sx={{ fontWeight: 600 }} />
);
