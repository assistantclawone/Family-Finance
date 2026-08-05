export type Region = 'DE' | 'AT' | 'CH';

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface Transaction {
  id: string;
  userId?: string;
  description: string;
  amount: number;
  currency: 'EUR' | 'CHF';
  date: string;
  type: 'income' | 'expense';
  isRecurring: boolean;
  isEstimate: boolean;
  category?: string;
  status?: 'confirmed' | 'pending';
}

export interface Asset {
  id: string;
  name: string;
  type: 'Bank Account' | 'Portfolio' | 'Other';
  balance: number;
  currency: 'EUR' | 'CHF';
}

export interface ForecastDataPoint {
  date: string;
  value: number;
  [key: string]: number | string;
}

export interface Appointment {
    id: string;
    date: string;
    patient: string;
    doctor: string;
    purpose: string;
}

export interface HealthInsurance {
    id: string;
    memberName: string;
    provider: string;
    policyNumber: string;
    type: 'gesetzlich' | 'privat' | 'Grundversicherung';
}

export interface EmergencyContact {
    id: string;
    name: string;
    specialty: string;
    phone: string;
    type: 'doctor' | 'hospital' | 'emergency';
}
