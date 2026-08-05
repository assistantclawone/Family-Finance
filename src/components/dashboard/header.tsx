'use client';

import { Bell, PlusCircle, Search, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '../ui/sidebar';
import { user as staticUser } from '@/lib/data';
import { useUser } from '@/firebase';
import { useRegion } from '@/contexts/region-context';
import { AddTransactionDialog } from '../finances/add-transaction-dialog';
import { useState } from 'react';
import type { Transaction } from '@/lib/types';

export function Header({ title }: { title: string }) {
  const { user } = useUser();
  const { region, setRegion } = useRegion();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">
          <h1 className="text-xl font-semibold font-headline">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Suchen..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Region auswählen</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Region</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={region} onValueChange={(value) => setRegion(value as 'DE' | 'AT' | 'CH')}>
                <DropdownMenuRadioItem value="DE">Deutschland</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="AT">Österreich</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="CH">Schweiz</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Benachrichtigungen</span>
          </Button>
          <Button onClick={() => setIsAddTransactionOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Eintrag
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photoURL || staticUser.avatar} alt={user?.displayName || staticUser.name} data-ai-hint="person portrait" />
                  <AvatarFallback>{(user?.displayName || staticUser.name).charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Benutzermenü</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Abrechnung</DropdownMenuItem>
              <DropdownMenuItem>Einstellungen</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Abmelden</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <AddTransactionDialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} />
    </>
  );
}
