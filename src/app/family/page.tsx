'use client';

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/firebase";
import { CreateFamilyGroup } from "@/components/family/create-family-group";
import { FamilyGroupDetails } from "@/components/family/family-group-details";
import { JoinFamilyGroup } from "@/components/family/join-family-group";
import { collection, query, where, doc, or } from "firebase/firestore";
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import React, { useMemo } from 'react';

export default function FamilyPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();

  // Query for groups where the user is a member OR the owner
  const familyGroupQuery = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return query(
        collection(firestore, 'familyGroups'),
        or(
            where('memberIds', 'array-contains', user.uid),
            where('ownerId', '==', user.uid)
        )
    );
  }, [firestore, user?.uid]);

  const { data: familyGroups, isLoading: isGroupsLoading } = useCollection(familyGroupQuery);

  const familyGroup = useMemo(() => {
    if (!familyGroups || familyGroups.length === 0) return null;
    // For now, just display the first group the user belongs to.
    return familyGroups[0];
  }, [familyGroups]);


  const handleLogin = () => {
    initiateAnonymousSignIn(auth);
  };
  
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
             <Button onClick={handleLogin} className="mt-4">
              Anonym anmelden
            </Button>
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
