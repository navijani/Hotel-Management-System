export interface Guest {
  guest_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  identification_no: string;
}

export interface Branch {
  branch_id: number;
  branch_name: string;
  city: string;
  address: string;
  contact_number: string;
}

export interface RoomType {
  room_type_id: number;
  type_name: string;
  capacity: number;
  base_daily_rate: number;
  amenities: string;
}

export type RoomStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Maintenance';

export interface Room {
  room_id: number;
  branch_id: number;
  room_type_id: number;
  room_number: string;
  current_status: RoomStatus;
}

export type BookingStatus = 'Booked' | 'Checked-In' | 'Checked-Out' | 'Cancelled';

export interface Booking {
  booking_id: number;
  guest_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  actual_check_in?: string;
  actual_check_out?: string;
  booking_status: BookingStatus;
  preferred_payment_method: string;
  created_at: string;
}

export interface Service {
  service_id: number;
  service_name: string;
  category: string;
  current_unit_price: number;
  description: string;
}

export interface ServiceUsage {
  usage_id: number;
  booking_id: number;
  service_id: number;
  usage_date: string;
  quantity: number;
  unit_price_at_usage: number;
  total_price: number;
}

export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Partial';

export interface Invoice {
  invoice_id: number;
  booking_id: number;
  total_room_charges: number;
  total_service_charges: number;
  tax_amount: number;
  discount_amount: number;
  net_total_amount: number;
  total_paid: number;
  outstanding_balance: number;
  invoice_status: InvoiceStatus;
  created_at: string;
}

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Bank Transfer' | 'Online';

export interface Payment {
  payment_id: number;
  booking_id: number;
  payment_date: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  payment_notes: string;
}
