'use client';

/**
 * Zentraler Daten-/Auth-Einstieg für die App.
 *
 * Seit dem Umbau auf echtes Supabase stellt dieser Einstieg die App-Hooks
 * (useUser, useAuth, useFirestore, useCollection, useDoc, ...) aus dem
 * Supabase-Provider (provider.tsx) bereit. Die frühere localStorage-
 * Firebase-Kompat-Schicht (firestore-local.ts) ist nicht mehr aktiv exportiert.
 */

export * from './provider';

// Kompat-Alias für Code, der `useMemoFirebase` etc. erwartet — kommt aus provider.tsx.
