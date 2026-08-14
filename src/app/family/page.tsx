'use client';

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser, useCollection } from "@/firebase";
import { CreateFamilyGroup } from "@/components/family/create-family-group";
import { FamilyGroupDetails } from "@/components/family/family-group-details";
import { JoinFamilyGroup } from "@/components/family/join-family-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useMemo } from 'react';

export default function FamilyPage() {
  const { user, isUserLoading } = useUser();

  // Query groups where the user is a member OR the owner
  const familyGroupQuery = useMemo(() => {
    if (!user?.id || !isSupabaseConfigured) return null;
    return (client: any) =>
      client.from('family_groups').select('*').or(`owner_id.eq.${user.id},member_ids.cs.{${user.id}}`);
  }, [user?.id]);

  const { data: familyGroups, isLoading: isGroupsLoading } = useCollection<any>(familyGroupQuery);

  const familyGroup = useMemo(() => {
    if (!familyGroups || familyGroups.length === 0) return null;
    // For now, just display the first group the user belongs to.
    return familyGroups[0];
  }, [familyGroups]);
  
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
      {familyGroup ? (
        <FamilyGroupDetails familyGroup={familyGroup} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <CreateFamilyGroup />
          <JoinFamilyGroup />
        </div>
      )}
    </MainLayout>
  );
}
