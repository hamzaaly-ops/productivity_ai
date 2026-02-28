export interface User {
  userId: string;
  username: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
}

/** API response shape (snake_case from backend) */
export interface UserResponse {
  user_id: string;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export type WorkSessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface WorkSession {
  id: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  status: WorkSessionStatus;
  projectName?: string | null;
}

export interface Heartbeat {
  id: number;
  sessionId: string;
  timestamp: string;
  isIdle: boolean;
  metaData: Record<string, unknown> | null;
}

export interface ProductivityHeatmapPoint {
  day: string; // e.g. "Mon"
  hour: number; // 0-23
  intensity: number; // 0-1
}

export interface TeamMemberPresence {
  userId: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'IDLE' | 'OFFLINE';
  timezone: string;
}


