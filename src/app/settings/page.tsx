'use client';

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useAuth } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!auth.currentUser) {
        toast({ variant: "destructive", title: "Fehler", description: "Sie sind nicht angemeldet." });
        return;
    }
    setIsSaving(true);
    try {
        await updateProfile(auth.currentUser, { displayName });
        toast({ title: "Erfolg!", description: "Ihr Name wurde aktualisiert." });
    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({ variant: "destructive", title: "Fehler", description: "Ihr Name konnte nicht aktualisiert werden." });
    } finally {
        setIsSaving(false);
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
      </div>
    </MainLayout>
  );
}
