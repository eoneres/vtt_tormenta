'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompendiumEntry {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  type: string;
  system: string;
  tags: string[];
  attributes: Array<{ key: string; value: unknown; label?: string }>;
  relations: Array<{ type: string; targetId: string; targetName: string }>;
  source?: { book: string; page?: number };
  isOfficial: boolean;
  isHomebrew: boolean;
  createdBy?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompendiumSearchResult {
  entries: CompendiumEntry[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

export interface SearchParams {
  q?: string;
  system?: string;
  type?: string;
  tags?: string[];
  isOfficial?: boolean;
  isHomebrew?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ─── API client ───────────────────────────────────────────────────────────────

const BASE_URL = process.env['NEXT_PUBLIC_COMPENDIUM_URL'] ?? 'http://localhost:3040';

async function fetchCompendium<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((error as any).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function buildSearchQuery(params: SearchParams): string {
  const q = new URLSearchParams();
  if (params.q) q.set('q', params.q);
  if (params.system) q.set('system', params.system);
  if (params.type) q.set('type', params.type);
  if (params.isOfficial !== undefined) q.set('isOfficial', String(params.isOfficial));
  if (params.isHomebrew !== undefined) q.set('isHomebrew', String(params.isHomebrew));
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.sortBy) q.set('sortBy', params.sortBy);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  if (params.tags?.length) params.tags.forEach((t) => q.append('tags', t));
  return q.toString() ? `?${q.toString()}` : '';
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCompendiumSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['compendium', 'search', params],
    queryFn: () =>
      fetchCompendium<CompendiumSearchResult>(
        `/v1/compendium/entries${buildSearchQuery(params)}`,
      ),
    staleTime: 60_000,          // 1 min — compendium data is relatively stable
    gcTime: 5 * 60_000,         // 5 min cache
    placeholderData: (prev) => prev,
  });
}

export function useCompendiumEntry(id: string | null) {
  return useQuery({
    queryKey: ['compendium', 'entry', id],
    queryFn: () => fetchCompendium<CompendiumEntry>(`/v1/compendium/entries/${id}`),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });
}

export function useSystemStats(system: string) {
  return useQuery({
    queryKey: ['compendium', 'stats', system],
    queryFn: () =>
      fetchCompendium<{ system: string; total: number; byType: Record<string, number> }>(
        `/v1/compendium/stats/${system}`,
      ),
    staleTime: 10 * 60_000,
  });
}

// ─── Paginated search with infinite scroll support ────────────────────────────

export function useCompendiumSearchState(initialSystem = 'tormenta20') {
  const [params, setParams] = useState<SearchParams>({
    system: initialSystem,
    limit: 20,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const query = useCompendiumSearch(params);

  const search = useCallback((q: string) => {
    setParams((p) => ({ ...p, q: q || undefined, page: 1 }));
  }, []);

  const filterByType = useCallback((type: string | undefined) => {
    setParams((p) => ({ ...p, type, page: 1 }));
  }, []);

  const filterBySystem = useCallback((system: string) => {
    setParams((p) => ({ ...p, system, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    if (query.data?.hasMore) {
      setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }));
    }
  }, [query.data?.hasMore]);

  const prevPage = useCallback(() => {
    setParams((p) => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }));
  }, []);

  const toggleOfficial = useCallback(() => {
    setParams((p) => ({
      ...p,
      isOfficial: p.isOfficial === undefined ? true : undefined,
      page: 1,
    }));
  }, []);

  const toggleHomebrew = useCallback(() => {
    setParams((p) => ({
      ...p,
      isHomebrew: p.isHomebrew === undefined ? true : undefined,
      page: 1,
    }));
  }, []);

  return {
    entries: query.data?.entries ?? [],
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    page: params.page ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    params,
    search,
    filterByType,
    filterBySystem,
    nextPage,
    prevPage,
    toggleOfficial,
    toggleHomebrew,
  };
}
