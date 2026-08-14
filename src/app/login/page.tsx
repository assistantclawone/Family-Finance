'use client';

/**
 * Login-Seite: echte Supabase-Auth (Email + Passwort).
 * Zeigt bei fehlender Konfiguration einen klaren Hinweis statt zu crashen.
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { initiateEmailSignIn, initiatePasswordReset } from '@/firebase';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const configured = isSupabaseConfigured;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      toast({ variant: 'destructive', title: 'Backend-Konfiguration fehlt', description: 'Legen Sie die Supabase-Keys in .env.local fest (siehe .env.example).' });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await initiateEmailSignIn(email, password);
      if (error) throw error;
      toast({ title: 'Angemeldet', description: 'Willkommen zurück!' });
      router.push('/');
      router.refresh();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Anmeldung fehlgeschlagen', description: err?.message ?? 'Bitte Email und Passwort prüfen.' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgot() {
    if (!configured || !email) {
      toast({ variant: 'destructive', title: 'Email fehlt', description: 'Bitte zuerst Ihre Email-Adresse eingeben.' });
      return;
    }
    try {
      const { error } = await initiatePasswordReset(email);
      if (error) throw error;
      toast({ title: 'Link gesendet', description: 'Wir haben Ihnen einen Link zum Zurücksetzen zugeschickt.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Fehler', description: err?.message ?? 'Konnte Link nicht senden.' });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Coins className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-headline">AnydayTool</CardTitle>
          <CardDescription>Family Finance Forecaster — anmelden</CardDescription>
        </CardHeader>
        <CardContent>
          {!configured && (
            <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              Backend-Konfiguration fehlt. Bitte setzen Sie die Supabase-Keys in <code className="font-mono">.env.local</code> (siehe <code className="font-mono">.env.example</code>) und starten Sie die App neu.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="ihre@email.ch" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !configured}>
              {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <button type="button" onClick={handleForgot} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Passwort vergessen?
          </button>
          <div className="text-sm text-muted-foreground">
            Noch kein Konto?{' '}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Registrieren
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
