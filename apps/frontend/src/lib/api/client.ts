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

  create: (token: string, data: {
    name: string;
    campaignId: string;
    systemId: string;
    race?: string;
    classId?: string;
    attributes?: Record<string, number>;
    background?: string;
    alignment?: string;
  }) =>
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

// ─── Character combat actions ─────────────────────────────────────────────────

Object.assign(characterApi, {
  damage: (token: string, id: string, amount: number) =>
    request<{ currentPV: number; maxPV: number; isDying: boolean }>(
      `/v1/characters/${id}/damage`,
      { method: 'POST', body: JSON.stringify({ amount }) },
      token,
    ),

  heal: (token: string, id: string, amount: number) =>
    request<{ currentPV: number; maxPV: number }>(
      `/v1/characters/${id}/heal`,
      { method: 'POST', body: JSON.stringify({ amount }) },
      token,
    ),

  grantXP: (token: string, id: string, amount: number, reason?: string) =>
    request<{ totalXP: number; level: number; leveledUp: boolean }>(
      `/v1/characters/${id}/xp`,
      { method: 'POST', body: JSON.stringify({ amount, reason }) },
      token,
    ),

  applyCondition: (token: string, id: string, name: string, source: string, durationRounds?: number) =>
    request<void>(
      `/v1/characters/${id}/conditions`,
      { method: 'POST', body: JSON.stringify({ name, source, durationRounds }) },
      token,
    ),
});

// ─── Marketplace ──────────────────────────────────────────────────────────────

export const marketplaceApi = {
  getFeatured: (token: string, system?: string) =>
    request<MarketplaceListing[]>(
      `/v1/marketplace/featured${system ? `?system=${system}` : ''}`,
      {},
      token,
    ),

  search: (token: string, filters: Record<string, unknown>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    });
    return request<{ items: MarketplaceListing[]; total: number; totalPages: number }>(
      `/v1/marketplace/search?${params.toString()}`,
      {},
      token,
    );
  },

  getListing: (token: string, id: string) =>
    request<MarketplaceListing>(`/v1/marketplace/listings/${id}`, {}, token),

  purchase: (token: string, listingId: string) =>
    request<{ purchaseId: string; downloadUrl?: string }>(
      `/v1/marketplace/listings/${listingId}/purchase`,
      { method: 'POST' },
      token,
    ),

  getMyPurchases: (token: string) =>
    request<MarketplaceListing[]>('/v1/marketplace/my-purchases', {}, token),

  getMyListings: (token: string) =>
    request<MarketplaceListing[]>('/v1/marketplace/my-listings', {}, token),
};

interface MarketplaceListing {
  id: string;
  title: string;
  shortDescription: string;
  system: string;
  type: string;
  licenseType: 'free' | 'cc_by' | 'proprietary';
  priceCentavos: number;
  coverImageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  creatorId: string;
  creatorName: string;
  publishedAt: string;
  tags: string[];
}

// ─── Compendium API ───────────────────────────────────────────────────────────

export const compendiumApi = {
  search: (token: string, params: {
    system: string;
    type?: string;
    query?: string;
    page?: number;
    limit?: number;
  }) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') p.set(k, String(v));
    });
    return request<{ items: CompendiumEntry[]; total: number; totalPages: number }>(
      `/v1/compendium?${p.toString()}`, {}, token,
    );
  },

  getById: (token: string, id: string) =>
    request<CompendiumEntry>(`/v1/compendium/${id}`, {}, token),

  search_public: (params: { system: string; type?: string; query?: string }) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, v); });
    return request<{ items: CompendiumEntry[] }>(`/v1/public/compendium?${p.toString()}`, {});
  },
};

interface CompendiumEntry {
  id: string;
  name: string;
  type: string;
  system: string;
  shortDescription: string;
  description: string;
  tags: string[];
  attributes: Array<{ key: string; value: unknown; label: string }>;
  source?: { book: string; page?: number };
  slug: string;
}
