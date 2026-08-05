'use client';

import { Coins, DollarSign, Gauge, BookHeart, Settings, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { user as staticUser } from '@/lib/data';
import { useUser } from '@/firebase';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useSidebar } from '../ui/sidebar';

const AnydayToolLogo = () => (
  <div className="flex items-center gap-2">
    <div className="bg-primary rounded-lg p-1.5 text-primary-foreground">
      <Coins className="h-6 w-6" />
    </div>
    <span className="font-bold text-lg font-headline">AnydayTool</span>
  </div>
);

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { user } = useUser();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Gauge },
    { href: '/finances', label: 'Finanzen', icon: DollarSign },
    { href: '/family', label: 'Familie', icon: Users },
    { href: '/health', label: 'Gesundheit', icon: BookHeart },
    { href: '/insurance', label: 'Versicherung', icon: Shield },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };
  
  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader>
        <div
          className={cn(
            'flex h-16 items-center justify-between p-2 pr-4',
            isMobile && 'justify-center'
          )}
        >
          <AnydayToolLogo />
          {!isMobile && <SidebarTrigger />}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarGroup>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton isActive={isActive(item.href)} tooltip={{ children: item.label }}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings" passHref>
              <SidebarMenuButton isActive={isActive('/settings')} tooltip={{ children: 'Einstellungen' }}>
                <Settings />
                <span>Einstellungen</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-3 p-2 overflow-hidden border-t mt-2 group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:mt-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL || staticUser.avatar} alt={user?.displayName || staticUser.name} data-ai-hint="person portrait" />
            <AvatarFallback>{(user?.displayName || staticUser.name).charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="font-medium truncate text-sm">{user?.displayName || 'Anonym'}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email || 'Nicht angemeldet'}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
