'use client';

/**
 * Registrierungs-Seite: echte Supabase-Auth.
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
import { initiateEmailSignUp } from '@/firebase';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
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
    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Passwort zu kurz', description: 'Das Passwort muss mindestens 6 Zeichen haben.' });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await initiateEmailSignUp(email, password);
      if (error) throw error;
      // Profilname direkt am Konto hinterlegen.
      try {
        await (await import('@/lib/supabase/client')).supabase!.auth.updateUser({ data: { name } });
      } catch {
        /* optional */
      }
      toast({
        title: data.session ? 'Konto erstellt' : 'Bestätigung gesendet',
        description: data.session
          ? 'Willkommen! Ihr Konto ist bereit.'
          : 'Bitte bestätigen Sie Ihre Email-Adresse über den zugesandten Link.',
      });
      router.push(data.session ? '/' : '/login');
      if (data.session) router.refresh();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Registrierung fehlgeschlagen', description: err?.message ?? 'Bitte erneut versuchen.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Coins className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-headline">Konto erstellen</CardTitle>
          <CardDescription>Richten Sie sich ein kostenloses Konto ein.</CardDescription>
        </CardHeader>
        <CardContent>
          {!configured && (
            <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              Backend-Konfiguration fehlt. Bitte setzen Sie die Supabase-Keys in <code className="font-mono">.env.local</code> (siehe <code className="font-mono">.env.example</code>).
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input id="name" placeholder="Max Muster" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="ihre@email.ch" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !configured}>
              {isLoading ? 'Wird erstellt...' : 'Konto erstellen'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm text-muted-foreground">
            Bereits ein Konto?{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Anmelden
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
