# AnydayTool — Family Finance Forecaster

Persönliche Finanz- und Familienverwaltung (Next.js 15 + Supabase). Deutsch, Schweiz-Fokus.

## Setup

1. **Supabase-Projekt** anlegen (gratis): <https://supabase.com> → New Project.
2. **Auth aktivieren:** Dashboard → Authentication → Providers → **Email** ON.
3. **Schema ausführen:**
   - Beim **Erstaufbau**: gesamte Datei `supabase/schema.sql` im SQL-Editor ausführen.
   - Bei **bestehender Datenbank**: nur den Abschnitt **„TEIL C (NEU)"** am Ende von
     `supabase/schema.sql` (oder die kopierbare Datei `supabase/teil-c-extension.sql`)
     im SQL-Editor ausführen. Er ist idempotent und erweitert bestehende Tabellen
     per `ALTER` (Multi-Währung, neue Asset-Typen, Steuer-/Vorsorge-Spalten) plus
     neue Tabellen (Portfolios, Aktien, Budgetgrenzen, Sparziele).
4. **Keys** in `.env.local` eintragen (NICHT committen):
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public Key
5. `npm install && npm run dev` → <http://localhost:3000>

## Funktionen

- **Dashboard** — Gesamtvermögen, Prognose, Einnahmen/Ausgaben, AI-Insights.
- **Finanzen** — Einnahmen/Ausgaben erfassen (mit Kategorie), Fixkosten, Multi-Währung.
- **Vermögen** (`/vermoegen`) —
  - **Vermögenswerte**: Bankkonten, Kasse, Forderungen, Portfolios, Säule 3a/3b,
    Freizügigkeit/Pensionskasse (gebunden vs. frei), Immobilien, Fahrzeuge, Kunst,
    Crypto usw. Mit **Steuerkategorie** und Währung.
  - **Portfolios & Depots**: Aktien/ETF-Positionen (ISIN, Ticker, Stückzahl,
    Kaufkurs, aktueller Kurs → Positionswert + Gewinn/Verlust), Schweizer Depot-Kategorien.
- **Budget & Ziele** (`/budget`) — monatliche **Budgetgrenzen** pro Kategorie mit
  Verbrauchsanzeige, **Ausgaben-Chart** (Kreisdiagramm), **Sparziele** mit Fortschritt.
- **Steuererklärung** (`/tax`) — automatische **Vermögensaufstellung** nach Schweizer
  Steuerkategorien (Guthaben, Wertschriften, bewegliches/immobiles Vermögen, Forderungen,
  Schulden), Netto-Vermögen, Export als Textdatei, steuerliche Hinweise & Quellensteuer.
- **Familie** — Familiengruppen erstellen/beitreten, Mitglieder übersicht (gruppen-basiert).
- **Gesundheit** — Arzttermine, Versicherungen, Notfallkontakte.
- **Versicherung** — Platzhalter (folgt).
- **Einstellungen** — Profil, Region, Theme.

## Multi-Währung

Jede Position trägt ihre eigene Währung (`CHF`, `EUR`, `USD`, `GBP`). Die
Referenzwährung ist **CHF**; Summen, Charts und die Steueraufstellung rechnen
über fest hinterlegte Durchschnittskurse um (`src/lib/currency.ts`).
Hinweis: Die Kurse sind grobe Werte — für präzise Veranlagung bitte aktuelle
Kurse einsetzen.

## Architektur & Daten

- Client: `src/lib/supabase/client.ts` (Auth persistiert im Browser-LocalStorage).
- Daten-Helfer (CRUD): `src/lib/supabase/data.ts`.
- Auth-Provider: `src/firebase/provider.tsx` (Supabase-basiert, Bezeichnung historisch).
- Schema + Migration: `supabase/schema.sql`, inkrementelle Erweiterung `supabase/teil-c-extension.sql`.
- Row-Level-Security: Jede Zeile gehört dem angemeldeten Nutzer (`auth.uid()` = `user_id` /
  `owner_id`), Gruppen-Familienzugriff über `member_ids`.

## Deployment

Vercel-Deployment läuft automatisch bei jedem Push auf `origin/main`.
`typescript.ignoreBuildErrors` und `eslint.ignoreDuringBuilds` sind aktiv;
trotzdem wird `npx tsc --noEmit` vor dem Commit geprüft.
