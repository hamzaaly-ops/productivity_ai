'use client';

import Link from 'next/link';
import { LogOut, Settings, User } from 'lucide-react';

import { useUser } from '@/contexts/UserProvider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getInitials(username: string, fullName?: string | null): string {
  if (fullName && fullName.trim()) {
    return fullName
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

export function UserProfileDropdown() {
  const { user, logout, isLoading } = useUser();

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" disabled>
        <div className="h-4 w-4 animate-pulse rounded-full bg-slate-600" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" className="h-9 border-slate-700" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
    );
  }

  const initials = getInitials(user.username, user.fullName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full border border-slate-700 hover:bg-slate-800"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 border-slate-800 bg-slate-900"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-slate-100">
              {user.fullName || user.username}
            </p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem asChild className="cursor-pointer text-slate-200 focus:bg-slate-800">
          <Link href="/settings" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer text-slate-200 focus:bg-slate-800">
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
