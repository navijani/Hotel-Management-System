import { useEffect, useState } from 'react';
import axios from 'axios';

export interface BookingQuote {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  nightlyUsd: number;
  subtotalUsd: number;
  amountLkr: number;
  fxRate: number;
  rateDate: string;
  source: string;
  quoteToken: string;
}

export const formatLkr = (amount: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
export const formatUsd = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

export function useBookingQuote(roomId: number | null, checkInDate: string, checkOutDate: string) {
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!roomId || !checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
      setQuote(null);
      setQuoteLoading(false);
      setQuoteError('');
      return;
    }

    const controller = new AbortController();
    setQuote(null);
    setQuoteLoading(true);
    setQuoteError('');
    axios.get<BookingQuote>('/api/bookings/quote', {
      params: { roomId, checkInDate, checkOutDate },
      signal: controller.signal,
    }).then((response) => {
      setQuote(response.data);
    }).catch((error) => {
      if (!axios.isCancel(error)) setQuoteError(axios.isAxiosError(error) ? error.response?.data?.error || 'Unable to load the live exchange rate.' : 'Unable to load the live exchange rate.');
    }).finally(() => {
      if (!controller.signal.aborted) setQuoteLoading(false);
    });

    return () => controller.abort();
  }, [roomId, checkInDate, checkOutDate, refreshKey]);

  return { quote, quoteLoading, quoteError, refreshQuote: () => setRefreshKey((key) => key + 1) };
}
