export type StaffRole =
  | 'Admin'
  | 'Receptionist'
  | 'Housekeeping'
  | 'cleaning'
  | 'bar'
  | 'therapist'
  | 'waiter'
  | 'admin';

export interface StaffSession {
  id: number;
  staff_id?: number;
  username: string;
  role: StaffRole;
  token?: string;
}

export const getStaffToken = (): string => {
  for (const key of ['hmsStaffSession', 'staffProfile']) {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (parsed?.token) return String(parsed.token);
    } catch {
      /* ignore */
    }
  }
  return sessionStorage.getItem('staffToken') || '';
};

export const getStoredStaffSession = (): StaffSession | null => {
  for (const key of ['hmsStaffSession', 'staffProfile']) {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) return JSON.parse(raw) as StaffSession;
    } catch {
      /* ignore */
    }
  }
  return null;
};