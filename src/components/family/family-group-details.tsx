'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Copy, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function MemberDetails({ memberId }: { memberId: string }) {
    const firestore = useFirestore();
    const memberDocRef = useMemoFirebase(() => {
        if (!firestore || !memberId) return null;
        return doc(firestore, 'users', memberId);
    }, [firestore, memberId]);

    const { data: member, isLoading } = useDoc(memberDocRef);

    if (isLoading) {
        return <p>Mitglied wird geladen...</p>;
    }
    if (!member) return null;
    
    // Find owner from parent component through a prop or context if needed.
    // For now, this component only displays member info.

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                     <AvatarImage src={member.photoURL} alt={member.name} />
                    <AvatarFallback>{member.name ? member.name.charAt(0) : 'A'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{member.name || 'Anonymer Benutzer'}</p>
                    <p className="text-sm text-muted-foreground">{member.email || 'Keine E-Mail'}</p>
                </div>
            </div>
             {/* This requires passing down ownerId, for now we hide the badge from here */}
        </div>
    );
}

export function FamilyGroupDetails({ familyGroup }: { familyGroup: any }) {
    const { user } = useUser();
    const { toast } = useToast();

    const copyGroupId = () => {
        if (!familyGroup?.id) return;
        navigator.clipboard.writeText(familyGroup.id);
        toast({
            title: "Gruppen-ID kopiert!",
            description: "Sie können diese ID nun mit anderen teilen.",
        });
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{familyGroup.name}</CardTitle>
                        <CardDescription>{familyGroup.description || 'Keine Beschreibung vorhanden.'}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input type="text" readOnly value={familyGroup.id || ''} className="w-auto text-xs h-8" />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyGroupId}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <h3 className="font-semibold mb-4">Mitglieder</h3>
                <div className="space-y-4">
                   {familyGroup.memberIds.map((memberId: string) => (
                       <div key={memberId} className="flex items-center justify-between">
                           <MemberDetails memberId={memberId} />
                           {familyGroup.ownerId === memberId && <Badge variant="secondary">Inhaber</Badge>}
                       </div>
                   ))}
                </div>

                 {familyGroup.ownerId === user?.uid && (
                    <div className="mt-6 border-t pt-6">
                        <h3 className="font-semibold mb-4">Mitglied einladen</h3>
                         <div className="flex w-full max-w-sm items-center space-x-2">
                            <Input type="email" placeholder="Email des Mitglieds" />
                            <Button type="submit"><UserPlus className="mr-2 h-4 w-4"/> Einladen</Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Die eingeladene Person kann mit der Gruppen-ID beitreten.</p>
                    </div>
                 )}
            </CardContent>
        </Card>
    )
}
