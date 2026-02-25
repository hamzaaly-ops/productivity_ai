const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  setToken(token: string) {
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    localStorage.removeItem("auth_token");
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options;
    const token = this.getToken();

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(data: { username: string; email: string; password: string }) {
    return this.request<{ access_token: string; token_type: string }>("/auth/register", {
      method: "POST",
      body: data,
    });
  }

  async login(data: { username: string; password: string }) {
    return this.request<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: data,
    });
  }

  async getMe() {
    return this.request<{ id: number; username: string; email: string }>("/auth/me");
  }

  // Activity
  async createIdleEpisode(data: { start_time: string; end_time: string; reason?: string }) {
    return this.request("/activity/idle-episodes", { method: "POST", body: data });
  }

  async createWorkLog(data: {
    date: string;
    total_tracked_time: number;
    active_time: number;
    deep_work_time: number;
    tasks_completed: number;
    tasks_started: number;
    context_switches: number;
    breaks_taken: number;
    notes?: string;
  }) {
    return this.request("/activity/work-logs", { method: "POST", body: data });
  }

  async getDailySummary(date?: string) {
    const params = date ? `?date=${date}` : "";
    return this.request<DailySummary>(`/activity/me/daily-summary${params}`);
  }

  async getBurnoutRisk(lookback_days?: number) {
    const params = lookback_days ? `?lookback_days=${lookback_days}` : "";
    return this.request<BurnoutRisk>(`/activity/me/burnout${params}`);
  }

  async getAnomalyDetection() {
    return this.request<AnomalyDetection>("/activity/me/anomaly");
  }

  async healthCheck() {
    return this.request<{ status: string }>("/");
  }
}

// Types
export interface DailySummary {
  date: string;
  isolation_metrics: {
    count: number;
    total_minutes: number;
    average_minutes: number;
    longest_minutes: number;
  };
  time_metrics: {
    tracked_time: number;
    active_time: number;
    deep_work_time: number;
  };
  task_metrics: {
    completed: number;
    started: number;
    context_switches: number;
  };
  productivity_score: {
    score: number;
    breakdown: {
      deep_work: number;
      engagement: number;
      task_completion: number;
      context_switch_penalty: number;
    };
  };
}

export interface BurnoutRisk {
  risk_level: string;
  risk_score: number;
  factors: {
    late_night_load: number;
    weekend_work: number;
    high_engagement_low_breaks: number;
    declining_deep_work_trend: number;
  };
  recommendation: string;
}

export interface AnomalyDetection {
  anomalies_detected: boolean;
  method: string;
  anomalies: Array<{
    metric: string;
    value: number;
    expected_range: [number, number];
    severity: string;
  }>;
}

export const api = new ApiService();
