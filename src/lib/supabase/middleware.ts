/**
 * Supabase SSR-Middleware-Helfer.
 *
 * HINWEIS — NUR für Server-Deploys gedacht (Vercel/Railway).
 * Bei statischem Export (`output:'export'`, GitHub Pages) wird KEINE Middleware
 * ausgeführt. Die App pflegt die Session client-seitig via supabase-js
 * (siehe src/lib/supabase/client.ts und docs/blueprint.md).
 *
 * Diese Funktion wird in src/middleware.ts (App-Wurzel) referenziert. Ist die
 * Middleware dort aktiv geschaltet, läuft sie ausschliesslich auf einer
 * Server-Runtime. Für GitHub Pages bleibt sie auskommentiert.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Kein Server-Betrieb -> kein Session-Update nötig.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Session-Refresh (aktualisiert Ablaufzeiten bei jeder Anfrage).
  await supabase.auth.getUser();

  return response;
}
