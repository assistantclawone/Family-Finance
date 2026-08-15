export type Region = 'DE' | 'AT' | 'CH';

/** Unterstützte Währungen (ISO-4217). CHF ist die Referenzwährung. */
export type CurrencyCode = 'CHF' | 'EUR' | 'USD' | 'GBP';

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
  currency: CurrencyCode;
  date: string;
  type: 'income' | 'expense';
  isRecurring: boolean;
  isEstimate: boolean;
  category?: string;
  status?: 'confirmed' | 'pending';
}

/** Vermögens-/Konto-Typen inkl. gebundenes & ungebundenes Vermögen. */
export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  balance: number;
  currency: CurrencyCode;
  /** Steuerkategorie (Schweizer Veranlagung), z.B. 'beweglich' | 'immobil' */
  taxCategory?: TaxCategory;
  /** Gebundene Personenfreizügigkeit / Vorsorgezuordnung */
  binding?: BindingCategory;
}

export type AssetType =
  | 'Bank Account'
  | 'Portfolio'
  | 'Other'
  | 'Savings 3a'
  | 'Savings 3b'
  | 'Vested Benefits'
  | 'Pension'
  | 'Property'
  | 'Vehicle'
  | 'Art'
  | 'Crypto'
  | 'Cash'
  | 'Receivable';

/** Gebundenes vs. ungebundenes Vermögen (Säule 3a/3b, Freizügigkeit, frei). */
export type BindingCategory = 'free' | 'pillar3a' | 'pillar3b' | 'vested' | 'pillar2';

/** Schweizer Steuerkategorien für die Veranlagungs-Aufstellung. */
export type TaxCategory =
  | 'movable'   // bewegliches Vermögen
  | 'immobile'  // immobiles Vermögen (Grundstücke)
  | 'securities'// Wertschriften
  | 'bankbalances' // Guthaben (Bank-/Post-Konten, Bargeld)
  | 'receivables' // Forderungen
  | 'liabilities'; // Schulden

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  currency: CurrencyCode;
  type?: string;
}

export interface StockPosition {
  id: string;
  portfolioId: string;
  name: string;
  isin?: string;
  ticker?: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currency: CurrencyCode;
}

export interface BudgetLimit {
  id: string;
  category: string;
  monthlyLimit: number;
  currency: CurrencyCode;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  currency: CurrencyCode;
  deadline?: string | null;
}

export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
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
