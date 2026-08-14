'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Route-Guard für angemeldete Bereiche.
 *
 * - Nicht konfiguriert (Keys fehlen): zeigt einen klaren Hinweis statt zu crashen.
 * - Ladend: neutraler Lade-Skeleton.
 * - Nicht angemeldet: Umleitung auf /login.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      setRedirecting(true);
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md space-y-4 rounded-xl border p-8 text-center">
          <h1 className="text-xl font-semibold font-headline">Backend nicht konfiguriert</h1>
          <p className="text-sm text-muted-foreground">
            Für die Anmeldung fehlen die Supabase-Zugangsdaten. Legen Sie eine{' '}
            <code className="rounded bg-muted px-1">.env.local</code> mit{' '}
            <code className="rounded bg-muted px-1">NEXT_PUBLIC_SUPABASE_URL</code> und{' '}
            <code className="rounded bg-muted px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> an und
            führen Sie <code className="rounded bg-muted px-1">supabase/schema.sql</code> aus.
          </p>
          <Button asChild variant="outline">
            <Link href="/settings">Mehr erfahren</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isUserLoading || redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null; // Umleitung läuft über useEffect.
  }

  return <>{children}</>;
}
