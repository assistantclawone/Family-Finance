/**
 * Supabase Browser-Client für den statischen Export (GitHub Pages).
 *
 * Da die App als statisches Exports (next export / output:'export') läuft,
 * gibt es KEINEN Server und KEINEN Server-Middleware-Laufzeitstack. Wir pflegen
 * die Auth-Session daher ausschliesslich client-seitig über supabase-js
 * `getSession()`/`onAuthStateChange` (Persistenz im Browser-LocalStorage,
 * verwaltet von supabase-js selbst).
 *
 * WICHTIG — Session-Entscheidung (siehe docs/blueprint.md):
 *   - `@supabase/ssr`-middleware ist für Server-Deploys (Vercel/Railway) gedacht.
 *   - Bei statischem Export läuft diese NICHT. Daher ist sie hier bewusst
 *     NICHT eingebunden und in `src/middleware.ts` nur als auskommentierte
 *     Option dokumentiert (für einen späteren Server-Umzug).
 *
 * Fehlende Keys: Der Client wird dennoch (lazy) erzeugt, aber `isSupabaseConfigured`
 * ist dann false, damit die UI einen klaren Hinweis anzeigen kann statt zu crashen.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** true, sobald beide Supabase-Keys vorhanden sind. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Lazy erzeugter Browser-Client. Erzeugt ihn nur, wenn konfiguriert.
 * Sonst null, damit die Store-Hooks defensiv einen leeren Zustand liefern.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
