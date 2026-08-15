'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { deleteFamilyGroup } from "@/lib/supabase/data";

interface MemberProfile {
  id: string;
  name: string;
  email: string;
}

export function FamilyGroupDetails({ familyGroup, onChanged }: { familyGroup: any; onChanged?: () => void }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const memberIds: string[] = familyGroup?.member_ids ?? [];
  const ownerId: string = familyGroup?.owner_id;
  const isOwner = user?.id === ownerId;

  useEffect(() => {
    let mounted = true;
    if (!supabase || !isSupabaseConfigured || memberIds.length === 0) {
      setIsLoading(false);
      return;
    }
    supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', memberIds)
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error('Fehler beim Laden der Mitglieder:', error);
        } else {
          setMembers(data ?? []);
        }
        setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyGroup?.id]);

  const copyGroupId = () => {
    if (!familyGroup?.id) return;
    navigator.clipboard.writeText(familyGroup.id);
    toast({
      title: "Gruppen-ID kopiert!",
      description: "Sie können diese ID nun mit anderen teilen.",
    });
  };

  const handleDelete = async () => {
    if (!isOwner || !familyGroup?.id || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteFamilyGroup(familyGroup.id);
      toast({ title: "Gruppe gelöscht", description: "Die Familiengruppe wurde entfernt." });
      onChanged?.();
    } catch (e) {
      console.error("Fehler beim Löschen der Gruppe:", e);
      toast({ variant: "destructive", title: "Fehler", description: "Die Gruppe konnte nicht gelöscht werden." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{familyGroup?.name}</CardTitle>
            <CardDescription>{familyGroup?.description || 'Keine Beschreibung vorhanden.'}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input type="text" readOnly value={familyGroup?.id || ''} className="w-auto text-xs h-8" />
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyGroupId}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-4">Mitglieder</h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Mitglieder werden geladen...</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Mitglieder.</p>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{member.name ? member.name.charAt(0).toUpperCase() : 'A'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name || 'Anonymer Benutzer'}</p>
                    <p className="text-sm text-muted-foreground">{member.email || 'Keine E-Mail'}</p>
                  </div>
                </div>
                {ownerId === member.id && <Badge variant="secondary">Inhaber</Badge>}
              </div>
            ))}
          </div>
        )}

        {isOwner && (
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-1">Mitglieder einladen</h3>
            <p className="text-xs text-muted-foreground">
              Teilen Sie die Gruppen-ID mit der Person, die Sie hinzufügen möchten. Diese tritt dann selbst bei — oder Sie fügen ihre Benutzer-ID hier hinzu.
            </p>
            <Button variant="destructive" size="sm" className="mt-4" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Wird gelöscht..." : "Gruppe löschen"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
