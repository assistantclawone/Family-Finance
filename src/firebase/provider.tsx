'use client';

/**
 * Auth-Provider auf Basis von Supabase (statt Firebase/localStorage-Shim).
 *
 * Stellt der App den gewohnten Export-Kontrakt bereit (useUser, useAuth,
 * useFirestore, useCollection, useDoc, useFirebaseApp, useMemoFirebase,
 * initiateAnonymousSignIn, initiateEmailSignIn, initiateEmailSignUp,
 * signOut), jetzt aber ECHT über Supabase Auth + Datenbank.
 *
 * Session-Pflege (statischer Export / GitHub Pages):
 *   - Kein Server-Runtime, daher rein client-seitig über supabase-js
 *     `getSession()` / `onAuthStateChange`. supabase-js persistiert selbst
 *     im Browser-LocalStorage.
 *   - Fehlende Keys (nicht konfiguriert) -> isConfigured=false, Nutzer
 *     behandelt die App als "nicht angemeldet" und sieht einen Hinweis
 *     statt zu crashen.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthValue {
  currentUser: User | null;
  isConfigured: boolean;
  isLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<AuthValue>({
  currentUser: null,
  isConfigured: false,
  isLoading: true,
  userError: null,
});

export function FirebaseProvider({ children }: any) {
  const [session, setSession] = useState<AuthValue>({
    currentUser: null,
    isConfigured: isSupabaseConfigured,
    isLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!supabase) {
      setSession((s) => ({ ...s, isLoading: false, isConfigured: false }));
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession({
          currentUser: data.session?.user ?? null,
          isConfigured: true,
          isLoading: false,
          userError: null,
        });
      })
      .catch((err) => {
        if (!mounted) return;
        setSession({ currentUser: null, isConfigured: true, isLoading: false, userError: err });
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession({
        currentUser: nextSession?.user ?? null,
        isConfigured: true,
        isLoading: false,
        userError: null,
      });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => session, [session]);

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext);
  return ctx ?? { currentUser: null, isConfigured: isSupabaseConfigured, isLoading: true, userError: null };
}

/** Aktueller Auth-Status. */
export function useAuth(): AuthValue {
  return useContext(FirebaseContext);
}

/** Supabase-Client bzw. null, wenn nicht konfiguriert. */
export function useFirestore() {
  return supabase;
}
export function useFirebaseApp() {
  return supabase;
}

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(factory, deps);
}

/** Angemeldeter Nutzer (Supabase User) oder null. */
export function useUser() {
  const auth = useContext(FirebaseContext);
  return {
    user: auth.currentUser,
    isUserLoading: auth.isLoading,
    userError: auth.userError,
  };
}

/** useCollection: liest eine Supabase-Tabelle per Query-Callback. */
export function useCollection<T = any>(
  queryFn: ((client: NonNullable<typeof supabase>) => PromiseLike<any> | any) | null | undefined,
) {
  const [data, setData] = React.useState<Array<T & { id: string }> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<any>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    if (!supabase || !queryFn) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    Promise.resolve(queryFn(supabase))
      .then((res: any) => {
        if (!mounted) return;
        if (res?.error) throw res.error;
        setData((res?.data ?? []).map((d: any) => ({ ...d, id: d.id })));
        setError(null);
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err);
        setData([]);
        setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [queryFn, reloadKey]);

  return { data, isLoading, error, reload: () => setReloadKey((k) => k + 1) };
}

/** useDoc: liest eine einzelne Zeile aus Supabase. */
export function useDoc<T = any>(
  queryFn: ((client: NonNullable<typeof supabase>) => PromiseLike<any> | any) | null | undefined,
) {
  const [data, setData] = React.useState<(T & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<any>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    if (!supabase || !queryFn) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    Promise.resolve(queryFn(supabase))
      .then((res: any) => {
        if (!mounted) return;
        if (res?.error) throw res.error;
        setData(res?.data && res.data.length > 0 ? { ...res.data[0], id: res.data[0].id } : null);
        setError(null);
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (!mounted) return;
        setError(err);
        setData(null);
        setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [queryFn, reloadKey]);

  return { data, isLoading, error, reload: () => setReloadKey((k) => k + 1) };
}

/** Sign-out. */
export async function signOut() {
  if (!supabase) return;
  return supabase.auth.signOut();
}

/** E-Mail-Login. */
export async function initiateEmailSignIn(email: string, password: string) {
  if (!supabase) throw new Error('Supabase nicht konfiguriert.');
  return supabase.auth.signInWithPassword({ email, password });
}

/** E-Mail-Registrierung. */
export async function initiateEmailSignUp(email: string, password: string) {
  if (!supabase) throw new Error('Supabase nicht konfiguriert.');
  return supabase.auth.signUp({ email, password });
}

/** Passwort-Reset. */
export async function initiatePasswordReset(email: string) {
  if (!supabase) throw new Error('Supabase nicht konfiguriert.');
  return supabase.auth.resetPasswordForEmail(email);
}

/** Ohne Login (nur Viewer/Hinweis) möglich — kein echtes anonymes Konto. */
export async function initiateAnonymousSignIn() {
  // Bewusst keine anonyme Session: Login ist für echte Nutzerdaten Pflicht.
}
