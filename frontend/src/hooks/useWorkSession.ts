'use client';

import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { WorkSession } from '@/types/api';

interface StartSessionPayload {
  projectName?: string;
}

interface UseWorkSessionOptions {
  onStarted?: (session: WorkSession) => void;
}

export function useWorkSession(options: UseWorkSessionOptions = {}) {
  const { onStarted } = options;

  const startSessionMutation = useMutation({
    mutationKey: ['work-session', 'start'],
    mutationFn: async (payload: StartSessionPayload) => {
      // Shell only: the backend contract will be wired later.
      return apiClient.post<WorkSession>('/api/v1/sessions/start', payload);
    },
    onSuccess: (session) => {
      onStarted?.(session);
    },
  });

  return {
    startSession: startSessionMutation.mutate,
    startSessionAsync: startSessionMutation.mutateAsync,
    isStarting: startSessionMutation.isPending,
    error: startSessionMutation.error,
  };
}

