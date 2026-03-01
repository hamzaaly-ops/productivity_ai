import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { DashboardShell } from '@/components/DashboardShell';

const SIDEBAR_COOKIE_NAME = 'sidebar:state';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get(SIDEBAR_COOKIE_NAME);
  const sidebarOpen = sidebarCookie?.value !== 'false';

  return <DashboardShell sidebarOpen={sidebarOpen}>{children}</DashboardShell>;
}
