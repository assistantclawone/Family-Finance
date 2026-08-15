-- #############################################################################
-- TEIL C (NEU) — Multi-Währung, Vermögens-/Portfolio-/Steuer-/Budget-Module
-- #############################################################################
-- WICHTIG: Diese Erweiterung NACH Teil A/B AUSFÜHREN, wenn du bereits eine
-- laufende Datenbank hast. Der Block ist idempotent (kann mehrfach laufen).
-- Führe ALLE Statements unten im Supabase SQL-Editor aus.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Multi-Währung: CHECK-Constraints der Währung SKILLEN auf beliebige ISO-Codes
--    (bisher war nur 'EUR'/'CHF' erlaubt). Dabei entfallende Constraints neu anlegen.
-- -----------------------------------------------------------------------------
alter table public.assets drop constraint if exists assets_currency_check;
alter table public.transactions drop constraint if exists transactions_currency_check;
alter table public.recurring_expenses drop constraint if exists recurring_expenses_currency_check;

alter table public.assets add constraint assets_currency_iso
  check (currency in ('CHF','EUR','USD','GBP'));
alter table public.transactions add constraint transactions_currency_iso
  check (currency in ('CHF','EUR','USD','GBP'));
alter table public.recurring_expenses add constraint recurring_expenses_currency_iso
  check (currency in ('CHF','EUR','USD','GBP'));

-- -----------------------------------------------------------------------------
-- 2) Assets: Asset-Typen erweitern + neue Spalten für Steuer/Vorsorge
-- -----------------------------------------------------------------------------
alter table public.assets drop constraint if exists assets_type_check;
alter table public.assets add constraint assets_type_extended
  check (type in (
    'Bank Account','Portfolio','Other',
    'Savings 3a','Savings 3b','Vested Benefits','Pension',
    'Property','Vehicle','Art','Crypto','Cash','Receivable'
  ));

-- Steuerkategorie (Schweizer Veranlagung) und Vorsorge-Bindung
alter table public.assets add column if not exists tax_category text
  check (tax_category in ('movable','immobile','securities','bankbalances','receivables','liabilities'));
alter table public.assets add column if not exists binding text
  check (binding in ('free','pillar3a','pillar3b','vested','pillar2'));

-- -----------------------------------------------------------------------------
-- 3) Portfolios (Depot-Kategorien) + Aktien/ETF-Positionen
-- -----------------------------------------------------------------------------
create table if not exists public.portfolios (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade not null,
  name        text not null,
  description text,
  currency    text not null default 'CHF' check (currency in ('CHF','EUR','USD','GBP')),
  type        text not null default 'depot' check (type in ('depot','fonds','bank','krypto','sonstiges')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.portfolios enable row level security;
create policy "portfolios_select_own" on public.portfolios for select using (auth.uid() = user_id);
create policy "portfolios_insert_own" on public.portfolios for insert with check (auth.uid() = user_id);
create policy "portfolios_update_own" on public.portfolios for update using (auth.uid() = user_id);
create policy "portfolios_delete_own" on public.portfolios for delete using (auth.uid() = user_id);

create table if not exists public.stock_positions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users (id) on delete cascade not null,
  portfolio_id  uuid references public.portfolios (id) on delete cascade not null,
  name          text not null,
  isin          text,
  ticker        text,
  quantity      numeric not null default 0,
  purchase_price numeric not null default 0,
  current_price numeric not null default 0,
  currency      text not null default 'CHF' check (currency in ('CHF','EUR','USD','GBP')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.stock_positions enable row level security;
create policy "stock_positions_select_own" on public.stock_positions for select using (auth.uid() = user_id);
create policy "stock_positions_insert_own" on public.stock_positions for insert with check (auth.uid() = user_id);
create policy "stock_positions_update_own" on public.stock_positions for update using (auth.uid() = user_id);
create policy "stock_positions_delete_own" on public.stock_positions for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4) Budgetgrenzen (monatlich pro Kategorie)
-- -----------------------------------------------------------------------------
create table if not exists public.budget_limits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users (id) on delete cascade not null,
  category      text not null,
  monthly_limit numeric not null default 0,
  currency      text not null default 'CHF' check (currency in ('CHF','EUR','USD','GBP')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.budget_limits enable row level security;
create policy "budget_limits_select_own" on public.budget_limits for select using (auth.uid() = user_id);
create policy "budget_limits_insert_own" on public.budget_limits for insert with check (auth.uid() = user_id);
create policy "budget_limits_update_own" on public.budget_limits for update using (auth.uid() = user_id);
create policy "budget_limits_delete_own" on public.budget_limits for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5) Sparziele
-- -----------------------------------------------------------------------------
create table if not exists public.savings_goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users (id) on delete cascade not null,
  name          text not null,
  target_amount numeric not null default 0,
  saved_amount  numeric not null default 0,
  currency      text not null default 'CHF' check (currency in ('CHF','EUR','USD','GBP')),
  deadline      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.savings_goals enable row level security;
create policy "savings_goals_select_own" on public.savings_goals for select using (auth.uid() = user_id);
create policy "savings_goals_insert_own" on public.savings_goals for insert with check (auth.uid() = user_id);
create policy "savings_goals_update_own" on public.savings_goals for update using (auth.uid() = user_id);
create policy "savings_goals_delete_own" on public.savings_goals for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 6) updated_at-Trigger für die neuen Tabellen
-- -----------------------------------------------------------------------------
create trigger set_updated_at_portfolios before update on public.portfolios
  for each row execute function public.set_updated_at();
create trigger set_updated_at_stock_positions before update on public.stock_positions
  for each row execute function public.set_updated_at();
create trigger set_updated_at_budget_limits before update on public.budget_limits
  for each row execute function public.set_updated_at();
create trigger set_updated_at_savings_goals before update on public.savings_goals
  for each row execute function public.set_updated_at();
