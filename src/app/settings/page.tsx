'use client';

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useAuth, signOut } from "@/firebase";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const currentUser = auth.currentUser;
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const meta = currentUser?.user_metadata as Record<string, any> | undefined;
    const email = user?.email || '';
    setDisplayName(meta?.name || (email ? email.split('@')[0] : ''));
  }, [user, currentUser]);

  const handleProfileUpdate = async () => {
    if (!currentUser) {
        toast({ variant: "destructive", title: "Fehler", description: "Sie sind nicht angemeldet." });
        return;
    }
    setIsSaving(true);
    try {
        await supabase!.auth.updateUser({ data: { name: displayName } });
        await supabase!.from('profiles').upsert({
          id: currentUser.id,
          name: displayName,
          email: currentUser.email ?? '',
          updated_at: new Date().toISOString(),
        });
        toast({ title: "Erfolg!", description: "Ihr Name wurde aktualisiert." });
    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({ variant: "destructive", title: "Fehler", description: "Ihr Name konnte nicht aktualisiert werden." });
    } finally {
        setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Fehler", description: "Abmelden fehlgeschlagen." });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <MainLayout title="Einstellungen">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Verwalten Sie Ihre persönlichen Informationen.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Anzeigename</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ihr Name"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleProfileUpdate} disabled={isSaving}>
              {isSaving ? "Wird gespeichert..." : "Änderungen speichern"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Darstellung</CardTitle>
            <CardDescription>Passen Sie das Erscheinungsbild der App an.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Dunkler Modus</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Aktivieren, um das dunkle Design zu verwenden.
                </span>
              </Label>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Konto</CardTitle>
            <CardDescription>Melden Sie sich von diesem Gerät ab.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? "Wird abgemeldet..." : "Abmelden"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
