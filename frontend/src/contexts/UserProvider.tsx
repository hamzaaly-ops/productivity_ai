'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { Organization, User, UserResponse } from '@/types/api';

function mapUserResponse(res: UserResponse): User {
  return {
    userId: res.user_id,
    username: res.username,
    email: res.email,
    fullName: res.full_name,
    isActive: res.is_active,
  };
}

interface UserContextValue {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setOrganization: (org: Organization | null) => void;
  logout: () => void;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const queryClient = useQueryClient();
  const [organization, setOrganizationState] = useState<Organization | null>(null);

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const res = await apiClient.get<UserResponse>('/auth/me');
      return mapUserResponse(res);
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!apiClient.getAuthToken(),
  });

  const setOrganization = useCallback((org: Organization | null) => {
    setOrganizationState(org);
  }, []);

  const logout = useCallback(() => {
    apiClient.clearAuthToken();
    queryClient.setQueryData(['user', 'me'], null);
    setOrganizationState(null);
  }, [queryClient]);

  const refetchUser = useCallback(() => {
    refetch();
  }, [refetch]);

  const value = useMemo<UserContextValue>(
    () => ({
      user: user ?? null,
      organization,
      isLoading,
      isAuthenticated: !!user,
      setOrganization,
      logout,
      refetchUser,
    }),
    [user, organization, isLoading, setOrganization, logout, refetchUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
