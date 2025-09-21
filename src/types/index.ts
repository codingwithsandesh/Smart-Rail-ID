export interface User {
  username: string;
  role: 'ticket-creator' | 'tte' | 'admin';
  workingStation?: string;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  address: string;
  createdAt: string;
}

export interface Route {
  id: string;
  fromStation: string;
  toStation: string;
  distance: number;
  prices: {
    general: number;
    sleeper: number;
    ac: number;
  };
  createdAt: string;
}

export interface Ticket {
  id: string;
  travelId: string;
  passengerName: string;
  fromStation: string;
  toStation: string;
  kilometres: number;
  date: string;
  price: number;
  ticketClass: 'general' | 'sleeper' | 'ac';
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  createdBy: string;
  expiresAt: string;
}

export interface VerificationLog {
  id: string;
  travelId: string;
  verifiedBy: string;
  verifiedAt: string;
  status: 'valid' | 'invalid' | 'expired' | 'duplicate';
  fraudAttempt?: boolean;
  details?: string;
}

export interface StationStats {
  station: string;
  count: number;
  revenue: number;
}
