'use client';

import { useCallback, useEffect, useState } from 'react';
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/firebase";
import { CreateFamilyGroup } from "@/components/family/create-family-group";
import { FamilyGroupDetails } from "@/components/family/family-group-details";
import { JoinFamilyGroup } from "@/components/family/join-family-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchFamilyGroups } from "@/lib/supabase/data";
import type { FamilyGroup } from "@/lib/types";

export default function FamilyPage() {
  const { user, isUserLoading } = useUser();
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured) {
      setIsGroupsLoading(false);
      return;
    }
    setIsGroupsLoading(true);
    setLoadError(null);
    try {
      const groups = await fetchFamilyGroups(user.id);
      setFamilyGroups(groups);
    } catch (e) {
      console.error('Fehler beim Laden der Gruppen:', e);
      setLoadError('Die Familiengruppen konnten nicht geladen werden.');
      setFamilyGroups([]);
    } finally {
      setIsGroupsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const familyGroup = familyGroups.length > 0 ? familyGroups[0] : null;

  if (isUserLoading || isGroupsLoading) {
    return (
      <MainLayout title="Familie">
        <Card>
          <CardHeader>
            <CardTitle>Familienverwaltung</CardTitle>
            <CardDescription>Laden...</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Ihre Gruppendaten werden geladen.</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout title="Familie">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Anmeldung erforderlich</AlertTitle>
          <AlertDescription>
            Sie müssen angemeldet sein, um Ihre Familiengruppe zu verwalten.
            <Button asChild className="mt-4">
              <Link href="/login">Anmelden</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <MainLayout title="Familie">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Supabase nicht konfiguriert</AlertTitle>
          <AlertDescription>
            Für die Familienverwaltung muss Supabase eingerichtet sein.
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Familie">
      {loadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}
      {familyGroup ? (
        <FamilyGroupDetails familyGroup={familyGroup} onChanged={loadGroups} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <CreateFamilyGroup onCreated={loadGroups} />
          <JoinFamilyGroup onChanged={loadGroups} />
        </div>
      )}
    </MainLayout>
  );
}
