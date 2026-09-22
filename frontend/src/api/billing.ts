import axios from 'axios';
import type {
  BillingPaymentRequest,
  BillingWorkspace,
  BookingBillingSummary,
  DetailedServiceUsage,
  Payment,
  PaymentMethod,
} from '../types';

const billingApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 6000,
});

const paymentMethods: PaymentMethod[] = ['Cash', 'Card', 'Bank Transfer', 'Online Transfer'];

const mockWorkspace: BillingWorkspace = {
  bookings: [
    {
      booking_id: 2001,
      booking_status: 'Checked-In',
      guest_name: 'Aarav Perera',
      identification_no: 'NIC-9384712',
      room_number: 'C-204',
      room_type: 'Deluxe Ocean View',
      branch: 'Colombo',
      check_in_at: '2026-09-15T14:00:00',
      check_out_at: '2026-09-19T11:00:00',
      nights: 4,
      room_daily_rate: 28000,
      room_total: 112000,
      service_total: 18600,
      tax_amount: 13060,
      discount_amount: 5000,
      net_total: 138660,
      total_paid: 100000,
      outstanding_balance: 38660,
      invoice_status: 'Partial',
    },
    {
      booking_id: 2002,
      booking_status: 'Checked-In',
      guest_name: 'Nimal Fernando',
      identification_no: 'NIC-4478129',
      room_number: 'K-112',
      room_type: 'Premium Suite',
      branch: 'Kandy',
      check_in_at: '2026-09-12T13:00:00',
      check_out_at: '2026-09-16T10:00:00',
      nights: 4,
      room_daily_rate: 34000,
      room_total: 136000,
      service_total: 0,
      tax_amount: 10880,
      discount_amount: 0,
      net_total: 146880,
      total_paid: 146880,
      outstanding_balance: 0,
      invoice_status: 'Paid',
    },
    {
      booking_id: 2003,
      booking_status: 'Checked-In',
      guest_name: 'Sachini De Silva',
      identification_no: 'NIC-7745612',
      room_number: 'G-305',
      room_type: 'Family Villa',
      branch: 'Galle',
      check_in_at: '2026-09-18T15:00:00',
      check_out_at: '2026-09-21T12:00:00',
      nights: 3,
      room_daily_rate: 42000,
      room_total: 126000,
      service_total: 24750,
      tax_amount: 12075,
      discount_amount: 8000,
      net_total: 154825,
      total_paid: 120000,
      outstanding_balance: 34825,
      invoice_status: 'Partial',
    },
  ],
  service_usages: [
    {
      usage_id: 1,
      booking_id: 2001,
      service_name: 'Spa Massage',
      branch: 'Colombo',
      service_id: 11,
      usage_date: '2026-09-16T16:30:00',
      quantity: 1,
      unit_price_at_usage: 9000,
      total_price: 9000,
    },
    {
      usage_id: 2,
      booking_id: 2001,
      service_name: 'Mini Bar Refill',
      branch: 'Colombo',
      service_id: 14,
      usage_date: '2026-09-17T21:10:00',
      quantity: 2,
      unit_price_at_usage: 1800,
      total_price: 3600,
    },
    {
      usage_id: 3,
      booking_id: 2001,
      service_name: 'Laundry Service',
      branch: 'Colombo',
      service_id: 18,
      usage_date: '2026-09-18T09:15:00',
      quantity: 2,
      unit_price_at_usage: 3000,
      total_price: 6000,
    },
    {
      usage_id: 4,
      booking_id: 2003,
      service_name: 'Dinner Package',
      branch: 'Galle',
      service_id: 21,
      usage_date: '2026-09-19T20:00:00',
      quantity: 3,
      unit_price_at_usage: 6500,
      total_price: 19500,
    },
    {
      usage_id: 5,
      booking_id: 2003,
      service_name: 'Airport Transfer',
      branch: 'Galle',
      service_id: 23,
      usage_date: '2026-09-18T09:45:00',
      quantity: 1,
      unit_price_at_usage: 5250,
      total_price: 5250,
    },
  ],
  payments: [
    {
      payment_id: 9001,
      booking_id: 2001,
      payment_date: '2026-09-16T12:00:00',
      amount_paid: 60000,
      payment_method: 'Card',
      payment_notes: 'Deposit on arrival',
    },
    {
      payment_id: 9002,
      booking_id: 2001,
      payment_date: '2026-09-18T19:20:00',
      amount_paid: 40000,
      payment_method: 'Cash',
      payment_notes: 'Additional partial settlement',
    },
    {
      payment_id: 9003,
      booking_id: 2002,
      payment_date: '2026-09-16T09:00:00',
      amount_paid: 146880,
      payment_method: 'Online Transfer',
      payment_notes: 'Full payment before departure',
    },
    {
      payment_id: 9004,
      booking_id: 2003,
      payment_date: '2026-09-19T10:00:00',
      amount_paid: 120000,
      payment_method: 'Bank Transfer',
      payment_notes: 'Advance settlement',
    },
  ],
  monthly_revenue: [
    { branch: 'Colombo', room_charges: 1240000, service_charges: 186000, total_revenue: 1426000, booking_count: 36 },
    { branch: 'Kandy', room_charges: 980000, service_charges: 125000, total_revenue: 1105000, booking_count: 29 },
    { branch: 'Galle', room_charges: 1345000, service_charges: 201500, total_revenue: 1546500, booking_count: 33 },
  ],
};

const createFallbackPayment = (bookingId: number, payload: BillingPaymentRequest): Payment => ({
  payment_id: Date.now(),
  booking_id: bookingId,
  payment_date: new Date().toISOString(),
  amount_paid: payload.amount_paid,
  payment_method: payload.payment_method,
  payment_notes: payload.payment_notes,
});

export { paymentMethods };

export const fetchBillingWorkspace = async (): Promise<BillingWorkspace> => {
  try {
    const response = await billingApi.get<BillingWorkspace>('/billing/workspace');
    return response.data;
  } catch {
    return mockWorkspace;
  }
};

export const recordBillingPayment = async (bookingId: number, payload: BillingPaymentRequest): Promise<Payment> => {
  try {
    const response = await billingApi.post<Payment>(`/billing/bookings/${bookingId}/payments`, payload);
    return response.data;
  } catch {
    return createFallbackPayment(bookingId, payload);
  }
};

export const completeBillingCheckout = async (bookingId: number): Promise<{ message: string }> => {
  try {
    const response = await billingApi.post<{ message: string }>(`/billing/bookings/${bookingId}/checkout`);
    return response.data;
  } catch {
    return { message: 'Checkout completed locally.' };
  }
};

export const getMockBillingWorkspace = (): BillingWorkspace => mockWorkspace;

export const getBillingBookingById = (bookingId: number): BookingBillingSummary | undefined =>
  mockWorkspace.bookings.find((booking) => booking.booking_id === bookingId);

export const getBillingPaymentsByBookingId = (bookingId: number): Payment[] =>
  mockWorkspace.payments.filter((payment) => payment.booking_id === bookingId);

export const getBillingServiceUsageByBookingId = (bookingId: number): DetailedServiceUsage[] =>
  mockWorkspace.service_usages.filter((usage) => usage.booking_id === bookingId);