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
import type { Asset, Transaction, Appointment, HealthInsurance, EmergencyContact } from '@/lib/types';

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
    type: row.type,
    balance: Number(row.balance),
    currency: row.currency,
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
    .insert({ name: asset.name, type: asset.type, balance: asset.balance, currency: asset.currency })
    .select()
    .single();
  if (error) throw error;
  return mapAsset(data);
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
