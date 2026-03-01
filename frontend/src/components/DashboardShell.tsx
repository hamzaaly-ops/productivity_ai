'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, LayoutDashboard, Settings2, Users } from 'lucide-react';

import { DynamicBreadcrumbs } from '@/components/DynamicBreadcrumbs';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const navItems = [
  { label: 'Overview', href: '/overview', icon: LayoutDashboard },
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings2 },
];

interface DashboardShellProps {
  children: ReactNode;
  sidebarOpen?: boolean;
}

export function DashboardShell({ children, sidebarOpen = true }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-slate-800">
          <SidebarHeader className="flex items-center gap-2 px-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/40">
              <span className="text-sm font-semibold text-cyan-400">RW</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold leading-tight text-slate-100">Remote Work</p>
              <p className="text-xs text-slate-400">Productivity Console</p>
            </div>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href} className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-slate-800 px-3 py-3">
            <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-900/80 px-3 py-2">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-slate-200">Organization</p>
                <p className="text-[11px] text-slate-500">Multi-tenant context</p>
              </div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex min-h-screen flex-1 flex-col bg-slate-950">
          <header className="flex h-14 items-center gap-3 border-b border-slate-800 px-3 lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex flex-1 items-center justify-between gap-4">
              <DynamicBreadcrumbs />
              <UserProfileDropdown />
            </div>
          </header>

          <main className="flex flex-1 flex-col bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 px-3 py-4 lg:px-6 lg:py-6">
            <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
