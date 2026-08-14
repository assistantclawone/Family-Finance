-- =============================================================================
-- Family Finance Forecaster — Supabase Schema
-- =============================================================================
-- Führt DIESE Datei 1x im Supabase SQL-Editor aus (Dashboard -> SQL Editor -> Run).
-- Legt alle Tabellen + Row-Level-Security (RLS) an. Pro Nutzer getrennte Daten.
--
-- Grundprinzip: Jede Zeile trägt `user_id uuid references auth.users not null`.
-- RLS-Policy `using (auth.uid() = user_id)` sorgt dafür, dass ein Nutzer nur
-- seine eigenen Zeilen lesen/schreiben kann.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Erweiterung für UUID-Erzeugung (falls nicht vorhanden)
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- profiles — öffentliches Nutzerprofil, 1:1 zu auth.users
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default '',
  email       text not null default '',
  region      text not null default 'DE' check (region in ('DE','AT','CH')),
  avatar      text not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- assets — Konten / Vermögenswerte (Ist-Kontostand "Momentaufnahme")
-- -----------------------------------------------------------------------------
create table if not exists public.assets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade not null,
  name        text not null,
  type        text not null default 'Bank Account' check (type in ('Bank Account','Portfolio','Other')),
  balance     numeric not null default 0,
  currency    text not null default 'EUR' check (currency in ('EUR','CHF')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.assets enable row level security;
create policy "assets_select_own" on public.assets
  for select using (auth.uid() = user_id);
create policy "assets_insert_own" on public.assets
  for insert with check (auth.uid() = user_id);
create policy "assets_update_own" on public.assets
  for update using (auth.uid() = user_id);
create policy "assets_delete_own" on public.assets
  for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- transactions — Einnahmen / Ausgaben
-- -----------------------------------------------------------------------------
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade not null,
  description text not null,
  amount      numeric not null default 0,
  currency    text not null default 'EUR' check (currency in ('EUR','CHF')),
  date        date not null default current_date,
  type        text not null default 'expense' check (type in ('income','expense')),
  is_recurring boolean not null default false,
  is_estimate  boolean not null default false,
  category     text,
  status       text not null default 'confirmed' check (status in ('confirmed','pending')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.transactions enable row level security;
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- recurring_expenses — wiederkehrende Fixkosten
-- -----------------------------------------------------------------------------
create table if not exists public.recurring_expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade not null,
  description text not null,
  amount      numeric not null default 0,
  currency    text not null default 'EUR' check (currency in ('EUR','CHF')),
  type        text not null default 'expense' check (type in ('income','expense')),
  is_estimate  boolean not null default false,
  status       text not null default 'pending' check (status in ('confirmed','pending')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.recurring_expenses enable row level security;
create policy "recurring_expenses_select_own" on public.recurring_expenses
  for select using (auth.uid() = user_id);
create policy "recurring_expenses_insert_own" on public.recurring_expenses
  for insert with check (auth.uid() = user_id);
create policy "recurring_expenses_update_own" on public.recurring_expenses
  for update using (auth.uid() = user_id);
create policy "recurring_expenses_delete_own" on public.recurring_expenses
  for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- appointments — Arzttermine
-- -----------------------------------------------------------------------------
create table if not exists public.appointments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade not null,
  date        timestamptz not null,
  patient     text not null,
  doctor      text not null,
  purpose     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.appointments enable row level security;
create policy "appointments_select_own" on public.appointments
  for select using (auth.uid() = user_id);
create policy "appointments_insert_own" on public.appointments
  for insert with check (auth.uid() = user_id);
create policy "appointments_update_own" on public.appointments
  for update using (auth.uid() = user_id);
create policy "appointments_delete_own" on public.appointments
  for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- health_insurances — Krankenversicherungen
-- -----------------------------------------------------------------------------
create table if not exists public.health_insurances (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users (id) on delete cascade not null,
  member_name   text not null,
  provider      text not null,
  policy_number text not null,
  type          text not null default 'gesetzlich' check (type in ('gesetzlich','privat','Grundversicherung')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.health_insurances enable row level security;
create policy "health_insurances_select_own" on public.health_insurances
  for select using (auth.uid() = user_id);
create policy "health_insurances_insert_own" on public.health_insurances
  for insert with check (auth.uid() = user_id);
create policy "health_insurances_update_own" on public.health_insurances
  for update using (auth.uid() = user_id);
create policy "health_insurances_delete_own" on public.health_insurances
  for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- emergency_contacts — Notfallkontakte
-- -----------------------------------------------------------------------------
create table if not exists public.emergency_contacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete cascade not null,
  name       text not null,
  specialty  text,
  phone      text not null,
  type       text not null default 'doctor' check (type in ('doctor','hospital','emergency')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.emergency_contacts enable row level security;
create policy "emergency_contacts_select_own" on public.emergency_contacts
  for select using (auth.uid() = user_id);
create policy "emergency_contacts_insert_own" on public.emergency_contacts
  for insert with check (auth.uid() = user_id);
create policy "emergency_contacts_update_own" on public.emergency_contacts
  for update using (auth.uid() = user_id);
create policy "emergency_contacts_delete_own" on public.emergency_contacts
  for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- family_groups — Familiengruppen (geteilte Nutzung)
-- -----------------------------------------------------------------------------
-- Achtung: Familien-Sync ist bewusst VEREINFACHT. Damit RLS greift, hat die
-- Gruppe einen owner (Eigentümer) und eine Mitgliederliste (Zugriffsregel unten).
-- -----------------------------------------------------------------------------
create table if not exists public.family_groups (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users (id) on delete cascade not null,
  name        text not null,
  description text,
  member_ids  uuid[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.family_groups enable row level security;

-- Mitglied oder Eigentümer kann die Gruppe lesen
create policy "family_groups_select_member" on public.family_groups
  for select using (auth.uid() = owner_id or auth.uid() = any(member_ids));
-- Jeder angemeldete Nutzer kann eine Gruppe anlegen (muss Eigentümer sein)
create policy "family_groups_insert_owner" on public.family_groups
  for insert with check (auth.uid() = owner_id);
-- Nur Eigentümer aktualisiert
create policy "family_groups_update_owner" on public.family_groups
  for update using (auth.uid() = owner_id);
-- Nur Eigentümer löscht
create policy "family_groups_delete_owner" on public.family_groups
  for delete using (auth.uid() = owner_id);

-- -----------------------------------------------------------------------------
-- Trigger: neues auth.users-Profil automatisch anlegen
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Trigger: updated_at aktuell halten
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at_assets before update on public.assets
  for each row execute function public.set_updated_at();
create trigger set_updated_at_transactions before update on public.transactions
  for each row execute function public.set_updated_at();
create trigger set_updated_at_recurring before update on public.recurring_expenses
  for each row execute function public.set_updated_at();
create trigger set_updated_at_appointments before update on public.appointments
  for each row execute function public.set_updated_at();
create trigger set_updated_at_insurances before update on public.health_insurances
  for each row execute function public.set_updated_at();
create trigger set_updated_at_contacts before update on public.emergency_contacts
  for each row execute function public.set_updated_at();
create trigger set_updated_at_groups before update on public.family_groups
  for each row execute function public.set_updated_at();

-- FERTIG — Schema-Setup abgeschlossen.
