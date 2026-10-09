const API_BASE = import.meta.env.VITE_API_URL || '/api';

// The staff login stores its session in sessionStorage. If your loginStaff() keeps the
// token somewhere else, this is the only function that needs to change.
export const getStaffToken = (): string => {
  for (const key of ['hmsStaffSession', 'staffProfile']) {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (parsed?.token) return String(parsed.token);
    } catch {
      /* ignore malformed session data */
    }
  }
  return sessionStorage.getItem('staffToken') || '';
};

export const paymentMethods = ['Cash', 'Card', 'Online'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export type BookingStatus = 'Booked' | 'Checked-In' | 'Checked-Out' | 'Cancelled';

export interface DeskBooking {
  booking_id: number;
  booking_status: BookingStatus;
  guest_name: string;
  identification_no: string;
  room_number: string;
  room_type: string;
  branch: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  room_daily_rate: number;
  room_total: number;
  service_total: number;
  tax_amount: number;
  net_total: number;
  total_paid: number;
  outstanding_balance: number;
}

export interface DeskService {
  service_id: number;
  service_name: string;
  category: string;
  unit_price: number;
}

export interface DeskServiceUsage {
  usage_id: number;
  service_id: number;
  service_name: string;
  category: string;
  usage_date: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface DeskPayment {
  payment_id: number;
  booking_id: number;
  payment_date: string;
  amount_paid: number;
  payment_method: string;
}

export interface DeskBookingDetail {
  booking: DeskBooking;
  services: DeskServiceUsage[];
  payments: DeskPayment[];
}

export interface DeskOverview {
  counts: { arrivals_due: number; in_house: number; departures_due: number; outstanding: number };
  arrivals: DeskBooking[];
  departures: DeskBooking[];
  room_status: { status: string; count: number }[];
}

export interface ReportSummary {
  range: { from: string; to: string };
  kpis: {
    collected: number;
    billed: number;
    room_revenue: number;
    service_revenue: number;
    outstanding: number;
    bookings: number;
    avg_nights: number;
    occupancy_percent: number;
    total_rooms: number;
  };
  by_branch: { branch: string; bookings: number; room_charges: number; service_charges: number; collected: number; outstanding: number }[];
  daily_collections: { day: string; total: number }[];
  payment_methods: { method: string; payments: number; total: number }[];
  booking_statuses: { status: string; count: number }[];
  top_services: { service_name: string; category: string; quantity: number; revenue: number }[];
  room_status: { status: string; count: number }[];
  outstanding_bookings: { booking_id: number; guest_name: string; room_number: string; branch: string; net_total: number; total_paid: number; outstanding_balance: number }[];
}

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getStaffToken()}`,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || (response.status === 401 ? 'Your session has expired. Please sign in again.' : 'Request failed.'));
  }
  return body as T;
}

export const fetchOverview = () => request<DeskOverview>('/reception/overview');

export const fetchDeskBookings = (params: { status?: string; q?: string } = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.q) query.set('q', params.q);
  const suffix = query.toString();
  return request<DeskBooking[]>(`/reception/bookings${suffix ? `?${suffix}` : ''}`);
};

export const fetchDeskBooking = (bookingId: number) => request<DeskBookingDetail>(`/reception/bookings/${bookingId}`);

export const fetchDeskServices = (bookingId: number) => request<DeskService[]>(`/reception/services?booking_id=${bookingId}`);

export const checkInBooking = (bookingId: number) =>
  request<{ message: string; booking: DeskBooking }>(`/reception/bookings/${bookingId}/check-in`, { method: 'POST' });

export const addServiceCharge = (bookingId: number, payload: { service_id: number; quantity: number; usage_date: string }) =>
  request<{ message: string; booking: DeskBooking }>(`/reception/bookings/${bookingId}/services`, { method: 'POST', body: payload });

export const recordPayment = (bookingId: number, payload: { amount_paid: number; payment_method: PaymentMethod }) =>
  request<{ message: string; booking: DeskBooking }>(`/reception/bookings/${bookingId}/payments`, { method: 'POST', body: payload });

export const checkOutBooking = (bookingId: number) =>
  request<{ message: string; booking: DeskBooking }>(`/reception/bookings/${bookingId}/checkout`, { method: 'POST' });

export const fetchReportSummary = (from: string, to: string) =>
  request<ReportSummary>(`/reports/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
