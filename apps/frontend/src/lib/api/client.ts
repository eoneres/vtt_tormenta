import type { AuthTokens, Campaign, Character, PaginatedResult } from '@vtt/shared-types';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly traceId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string; traceId?: string };
    throw new ApiError(res.status, body.message ?? res.statusText, body.traceId);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string, displayName: string) =>
    request<AuthTokens>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    }),

  login: (email: string, password: string, mfaCode?: string) =>
    request<AuthTokens>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...(mfaCode && { mfaCode }) }),
    }),

  refresh: (refreshToken: string) =>
    request<AuthTokens>('/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  setupMfa: (token: string) =>
    request<{ qrCodeUrl: string; secret: string }>('/v1/auth/mfa/setup', {
      method: 'POST',
    }, token),

  confirmMfa: (token: string, code: string) =>
    request<void>('/v1/auth/mfa/confirm', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }, token),
};

// ─── Campaigns ────────────────────────────────────────────────────────────────

export const campaignApi = {
  list: (token: string, page = 1) =>
    request<PaginatedResult<Campaign>>(`/v1/campaigns?page=${page}`, {}, token),

  get: (token: string, id: string) =>
    request<Campaign>(`/v1/campaigns/${id}`, {}, token),

  create: (token: string, data: { name: string; systemId: string; description?: string }) =>
    request<Campaign>('/v1/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  update: (token: string, id: string, data: Partial<{ name: string; description: string }>) =>
    request<Campaign>(`/v1/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token),

  archive: (token: string, id: string) =>
    request<void>(`/v1/campaigns/${id}`, { method: 'DELETE' }, token),
};

// ─── Characters ───────────────────────────────────────────────────────────────

export const characterApi = {
  list: (token: string, campaignId: string) =>
    request<Character[]>(`/v1/campaigns/${campaignId}/characters`, {}, token),

  get: (token: string, id: string) =>
    request<Character>(`/v1/characters/${id}`, {}, token),

  create: (token: string, data: { name: string; campaignId: string; systemId: string }) =>
    request<Character>('/v1/characters', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateSheet: (token: string, id: string, sheetData: Record<string, unknown>) =>
    request<Character>(`/v1/characters/${id}/sheet`, {
      method: 'PATCH',
      body: JSON.stringify({ sheetData }),
    }, token),
};

export { ApiError };
