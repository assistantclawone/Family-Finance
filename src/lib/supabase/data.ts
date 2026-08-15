'use client';

/**
 * Supabase-Daten-Helfer (saubere Abstraktion über supabase-js).
 *
 * Bietet typisierte Lese-/Schreib-Funktionen für die Tabellen des
 * Supabase-Schemas (supabase/schema.sql) mit Row Level Security.
 * Alle Funktionen erwarten den angemeldeten Nutzer über user_id = auth.uid().
 *
 * Statischer Export: rein client-seitig; RLS schützt die Daten serverseitig.
 * Fehlende Keys -> supabase ist null -> Funktionen werfen/leeren Zustand.
 */
import { supabase } from '@/lib/supabase/client';
import type {
  Asset,
  Transaction,
  Appointment,
  HealthInsurance,
  EmergencyContact,
  FamilyGroup,
  Portfolio,
  StockPosition,
  BudgetLimit,
  SavingsGoal,
  AssetType,
  CurrencyCode,
  TaxCategory,
  BindingCategory,
} from '@/lib/types';

type Mapper<T> = (row: any) => T;

function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    currency: row.currency,
    date: row.date,
    type: row.type,
    isRecurring: row.is_recurring,
    isEstimate: row.is_estimate,
    category: row.category ?? undefined,
    status: row.status,
  };
}
function mapAsset(row: any): Asset {
  return {
    id: row.id,
    name: row.name,
    type: row.type as AssetType,
    balance: Number(row.balance),
    currency: (row.currency ?? 'CHF') as CurrencyCode,
    taxCategory: row.tax_category ? (row.tax_category as TaxCategory) : undefined,
    binding: row.binding ? (row.binding as BindingCategory) : undefined,
  };
}
function mapAppointment(row: any): Appointment {
  return { id: row.id, date: row.date, patient: row.patient ?? '', doctor: row.doctor, purpose: row.purpose };
}
function mapInsurance(row: any): HealthInsurance {
  return {
    id: row.id,
    memberName: row.member_name ?? '',
    provider: row.provider,
    policyNumber: row.policy_number ?? '',
    type: row.type,
  };
}
function mapContact(row: any): EmergencyContact {
  return { id: row.id, name: row.name, specialty: row.specialty ?? '', phone: row.phone ?? '', type: row.type };
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------
export async function fetchAssets(): Promise<Asset[]> {
  const { data, error } = await supabase!.from('assets').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map(mapAsset);
}
export async function addAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
  const { data, error } = await supabase!
    .from('assets')
    .insert({
      name: asset.name,
      type: asset.type,
      balance: asset.balance,
      currency: asset.currency,
      tax_category: asset.taxCategory ?? null,
      binding: asset.binding ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapAsset(data);
}
export async function updateAsset(id: string, patch: Partial<Asset>) {
  const row: any = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.type !== undefined) row.type = patch.type;
  if (patch.balance !== undefined) row.balance = patch.balance;
  if (patch.currency !== undefined) row.currency = patch.currency;
  if (patch.taxCategory !== undefined) row.tax_category = patch.taxCategory ?? null;
  if (patch.binding !== undefined) row.binding = patch.binding ?? null;
  const { error } = await supabase!.from('assets').update(row).eq('id', id);
  if (error) throw error;
}
export async function deleteAsset(id: string) {
  const { error } = await supabase!.from('assets').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------
export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase!.from('transactions').select('*').order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTransaction);
}
export async function addTransaction(t: Omit<Transaction, 'id'>): Promise<Transaction> {
  const { data, error } = await supabase!
    .from('transactions')
    .insert({
      description: t.description,
      amount: t.amount,
      currency: t.currency,
      date: t.date,
      type: t.type,
      is_recurring: t.isRecurring,
      is_estimate: t.isEstimate,
      category: t.category ?? null,
      status: t.status ?? 'confirmed',
    })
    .select()
    .single();
  if (error) throw error;
  return mapTransaction(data);
}
export async function updateTransaction(id: string, patch: Partial<Transaction>) {
  const row: any = {};
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.amount !== undefined) row.amount = patch.amount;
  if (patch.currency !== undefined) row.currency = patch.currency;
  if (patch.date !== undefined) row.date = patch.date;
  if (patch.type !== undefined) row.type = patch.type;
  if (patch.isRecurring !== undefined) row.is_recurring = patch.isRecurring;
  if (patch.isEstimate !== undefined) row.is_estimate = patch.isEstimate;
  if (patch.category !== undefined) row.category = patch.category ?? null;
  if (patch.status !== undefined) row.status = patch.status;
  const { error } = await supabase!.from('transactions').update(row).eq('id', id);
  if (error) throw error;
}
export async function deleteTransaction(id: string) {
  const { error } = await supabase!.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Appointments (Gesundheit)
// ---------------------------------------------------------------------------
export async function fetchAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase!.from('appointments').select('*').order('date');
  if (error) throw error;
  return (data ?? []).map(mapAppointment);
}
export async function addAppointment(a: Omit<Appointment, 'id'>): Promise<Appointment> {
  const { data, error } = await supabase!
    .from('appointments')
    .insert({ date: a.date, patient: a.patient, doctor: a.doctor, purpose: a.purpose })
    .select()
    .single();
  if (error) throw error;
  return mapAppointment(data);
}
export async function deleteAppointment(id: string) {
  const { error } = await supabase!.from('appointments').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Health Insurances
// ---------------------------------------------------------------------------
export async function fetchHealthInsurances(): Promise<HealthInsurance[]> {
  const { data, error } = await supabase!.from('health_insurances').select('*').order('provider');
  if (error) throw error;
  return (data ?? []).map(mapInsurance);
}
export async function addHealthInsurance(i: Omit<HealthInsurance, 'id'>): Promise<HealthInsurance> {
  const { data, error } = await supabase!
    .from('health_insurances')
    .insert({
      member_name: i.memberName,
      provider: i.provider,
      policy_number: i.policyNumber,
      type: i.type,
    })
    .select()
    .single();
  if (error) throw error;
  return mapInsurance(data);
}

// ---------------------------------------------------------------------------
// Emergency Contacts
// ---------------------------------------------------------------------------
export async function fetchEmergencyContacts(): Promise<EmergencyContact[]> {
  const { data, error } = await supabase!.from('emergency_contacts').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map(mapContact);
}
export async function addEmergencyContact(c: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
  const { data, error } = await supabase!
    .from('emergency_contacts')
    .insert({ name: c.name, specialty: c.specialty ?? '', phone: c.phone ?? '', type: c.type })
    .select()
    .single();
  if (error) throw error;
  return mapContact(data);
}

// ---------------------------------------------------------------------------
// Family Groups
// ---------------------------------------------------------------------------
function mapFamilyGroup(row: any): FamilyGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    ownerId: row.owner_id,
    memberIds: row.member_ids ?? [],
  };
}

/** Liest alle Gruppen, bei denen der Nutzer Eigentümer ODER Mitglied ist. */
export async function fetchFamilyGroups(userId: string): Promise<FamilyGroup[]> {
  const { data, error } = await supabase!
    .from('family_groups')
    .select('*')
    .or(`owner_id.eq.${userId},member_ids.cs.{${userId}}`)
    .order('created_at');
  if (error) throw error;
  return (data ?? []).map(mapFamilyGroup);
}

export async function createFamilyGroup(userId: string, name: string, description?: string): Promise<FamilyGroup> {
  const { data, error } = await supabase!
    .from('family_groups')
    .insert({ name, description: description || null, owner_id: userId, member_ids: [userId] })
    .select()
    .single();
  if (error) throw error;
  return mapFamilyGroup(data);
}

/** Beitritt: Nur der Eigentümer kann per RLS die Mitgliederliste ändern. */
export async function joinFamilyGroup(group: FamilyGroup, userId: string): Promise<FamilyGroup | null> {
  if (group.ownerId !== userId) return null; // RLS erlaubt nur dem Eigentümer das Update
  if (group.memberIds.includes(userId)) return group;
  const { data, error } = await supabase!
    .from('family_groups')
    .update({ member_ids: [...group.memberIds, userId] })
    .eq('id', group.id)
    .select()
    .single();
  if (error) throw error;
  return mapFamilyGroup(data);
}

export async function deleteFamilyGroup(id: string) {
  const { error } = await supabase!.from('family_groups').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Portfolios (Depots)
// ---------------------------------------------------------------------------
function mapPortfolio(row: any): Portfolio {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    currency: (row.currency ?? 'CHF') as CurrencyCode,
    type: row.type ?? undefined,
  };
}
export async function fetchPortfolios(): Promise<Portfolio[]> {
  const { data, error } = await supabase!.from('portfolios').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map(mapPortfolio);
}
export async function addPortfolio(p: Omit<Portfolio, 'id'>): Promise<Portfolio> {
  const { data, error } = await supabase!
    .from('portfolios')
    .insert({ name: p.name, description: p.description ?? null, currency: p.currency, type: p.type ?? null })
    .select()
    .single();
  if (error) throw error;
  return mapPortfolio(data);
}
export async function deletePortfolio(id: string) {
  const { error } = await supabase!.from('portfolios').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Stock Positions (Aktien / ETF)
// ---------------------------------------------------------------------------
function mapStockPosition(row: any): StockPosition {
  return {
    id: row.id,
    portfolioId: row.portfolio_id,
    name: row.name,
    isin: row.isin ?? undefined,
    ticker: row.ticker ?? undefined,
    quantity: Number(row.quantity),
    purchasePrice: Number(row.purchase_price),
    currentPrice: Number(row.current_price),
    currency: (row.currency ?? 'CHF') as CurrencyCode,
  };
}
export async function fetchStockPositions(portfolioId: string): Promise<StockPosition[]> {
  const { data, error } = await supabase!.from('stock_positions').select('*').eq('portfolio_id', portfolioId).order('name');
  if (error) throw error;
  return (data ?? []).map(mapStockPosition);
}
export async function addStockPosition(p: Omit<StockPosition, 'id'>): Promise<StockPosition> {
  const { data, error } = await supabase!
    .from('stock_positions')
    .insert({
      portfolio_id: p.portfolioId,
      name: p.name,
      isin: p.isin ?? null,
      ticker: p.ticker ?? null,
      quantity: p.quantity,
      purchase_price: p.purchasePrice,
      current_price: p.currentPrice,
      currency: p.currency,
    })
    .select()
    .single();
  if (error) throw error;
  return mapStockPosition(data);
}
export async function deleteStockPosition(id: string) {
  const { error } = await supabase!.from('stock_positions').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Budget Limits (Budgetgrenzen)
// ---------------------------------------------------------------------------
function mapBudgetLimit(row: any): BudgetLimit {
  return {
    id: row.id,
    category: row.category,
    monthlyLimit: Number(row.monthly_limit),
    currency: (row.currency ?? 'CHF') as CurrencyCode,
  };
}
export async function fetchBudgetLimits(): Promise<BudgetLimit[]> {
  const { data, error } = await supabase!.from('budget_limits').select('*').order('category');
  if (error) throw error;
  return (data ?? []).map(mapBudgetLimit);
}
export async function addBudgetLimit(b: Omit<BudgetLimit, 'id'>): Promise<BudgetLimit> {
  const { data, error } = await supabase!
    .from('budget_limits')
    .insert({ category: b.category, monthly_limit: b.monthlyLimit, currency: b.currency })
    .select()
    .single();
  if (error) throw error;
  return mapBudgetLimit(data);
}
export async function deleteBudgetLimit(id: string) {
  const { error } = await supabase!.from('budget_limits').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Savings Goals (Sparziele)
// ---------------------------------------------------------------------------
function mapSavingsGoal(row: any): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    savedAmount: Number(row.saved_amount),
    currency: (row.currency ?? 'CHF') as CurrencyCode,
    deadline: row.deadline ?? null,
  };
}
export async function fetchSavingsGoals(): Promise<SavingsGoal[]> {
  const { data, error } = await supabase!.from('savings_goals').select('*').order('created_at');
  if (error) throw error;
  return (data ?? []).map(mapSavingsGoal);
}
export async function addSavingsGoal(g: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal> {
  const { data, error } = await supabase!
    .from('savings_goals')
    .insert({
      name: g.name,
      target_amount: g.targetAmount,
      saved_amount: g.savedAmount,
      currency: g.currency,
      deadline: g.deadline ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapSavingsGoal(data);
}
export async function updateSavingsGoal(id: string, patch: Partial<SavingsGoal>) {
  const row: any = {};
  if (patch.savedAmount !== undefined) row.saved_amount = patch.savedAmount;
  if (patch.targetAmount !== undefined) row.target_amount = patch.targetAmount;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.currency !== undefined) row.currency = patch.currency;
  if (patch.deadline !== undefined) row.deadline = patch.deadline ?? null;
  const { error } = await supabase!.from('savings_goals').update(row).eq('id', id);
  if (error) throw error;
}
export async function deleteSavingsGoal(id: string) {
  const { error } = await supabase!.from('savings_goals').delete().eq('id', id);
  if (error) throw error;
}
