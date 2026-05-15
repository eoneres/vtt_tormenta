import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi, characterApi } from '../api/client';
import { useAuthStore } from '../store/auth.store';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  campaigns: (page: number) => ['campaigns', page] as const,
  campaign: (id: string) => ['campaign', id] as const,
  characters: (campaignId: string) => ['characters', campaignId] as const,
  character: (id: string) => ['character', id] as const,
};

// ─── Campaigns ────────────────────────────────────────────────────────────────

export function useCampaigns(page = 1) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: QUERY_KEYS.campaigns(page),
    queryFn: () => campaignApi.list(token!, page),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useCampaign(id: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: QUERY_KEYS.campaign(id),
    queryFn: () => campaignApi.get(token!, id),
    enabled: !!token && !!id,
    staleTime: 60_000,
  });
}

export function useCreateCampaign() {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; systemId: string; description?: string }) =>
      campaignApi.create(token!, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

export function useArchiveCampaign() {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => campaignApi.archive(token!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

// ─── Characters ───────────────────────────────────────────────────────────────

export function useCharacters(campaignId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: QUERY_KEYS.characters(campaignId),
    queryFn: () => characterApi.list(token!, campaignId),
    enabled: !!token && !!campaignId,
    staleTime: 30_000,
  });
}

export function useCharacter(id: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: QUERY_KEYS.character(id),
    queryFn: () => characterApi.get(token!, id),
    enabled: !!token && !!id,
    staleTime: 30_000,
  });
}

export function useUpdateSheet() {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sheetData }: { id: string; sheetData: Record<string, unknown> }) =>
      characterApi.updateSheet(token!, id, sheetData),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: QUERY_KEYS.character(id) }),
  });
}

export function useDamageCharacter() {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      characterApi.damage(token!, id, amount),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: QUERY_KEYS.character(id) }),
  });
}

export function useHealCharacter() {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      characterApi.heal(token!, id, amount),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: QUERY_KEYS.character(id) }),
  });
}

// ─── Compendium ───────────────────────────────────────────────────────────────

export const COMPENDIUM_KEYS = {
  search: (system: string, type: string, query: string, page: number) =>
    ['compendium', 'search', system, type, query, page] as const,
  entry: (id: string) => ['compendium', 'entry', id] as const,
};

// ─── Marketplace ──────────────────────────────────────────────────────────────

export const MARKETPLACE_KEYS = {
  search: (filters: Record<string, unknown>) => ['marketplace', 'search', filters] as const,
  listing: (id: string) => ['marketplace', 'listing', id] as const,
  featured: (system?: string) => ['marketplace', 'featured', system] as const,
  myPurchases: () => ['marketplace', 'my-purchases'] as const,
  myListings: () => ['marketplace', 'my-listings'] as const,
};

export function useMarketplaceFeatured(system?: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: MARKETPLACE_KEYS.featured(system),
    queryFn: () => marketplaceApi.getFeatured(token!, system),
    staleTime: 5 * 60_000,
  });
}

export function useMarketplaceSearch(filters: Record<string, unknown>) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: MARKETPLACE_KEYS.search(filters),
    queryFn: () => marketplaceApi.search(token!, filters),
    staleTime: 60_000,
    enabled: !!token,
  });
}

export function useMyPurchases() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: MARKETPLACE_KEYS.myPurchases(),
    queryFn: () => marketplaceApi.getMyPurchases(token!),
    staleTime: 2 * 60_000,
    enabled: !!token,
  });
}

// ─── Character creation ───────────────────────────────────────────────────────

export function useCreateCharacter() {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      campaignId: string;
      name: string;
      systemId: string;
      race: string;
      classId: string;
      attributes: Record<string, number>;
      background?: string;
      alignment?: string;
    }) => characterApi.create(token!, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.characters(vars.campaignId) });
    },
  });
}

// ─── Compendium search ────────────────────────────────────────────────────────

export function useCompendiumSearch(params: {
  system: string;
  type?: string;
  query?: string;
  page?: number;
  limit?: number;
}) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: COMPENDIUM_KEYS.search(params.system, params.type ?? '', params.query ?? '', params.page ?? 1),
    queryFn: () => compendiumApi.search(token!, params),
    staleTime: 2 * 60_000,
    enabled: !!token && !!params.system,
  });
}

export function useCompendiumEntry(id: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: COMPENDIUM_KEYS.entry(id),
    queryFn: () => compendiumApi.getById(token!, id),
    staleTime: 10 * 60_000,
    enabled: !!token && !!id,
  });
}

// ─── XP granting ─────────────────────────────────────────────────────────────

export function useGrantXP() {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason?: string }) =>
      characterApi.grantXP(token!, id, amount, reason),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: QUERY_KEYS.character(id) }),
  });
}

// ─── Apply condition from table ───────────────────────────────────────────────

export function useApplyCondition() {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, name, source, durationRounds,
    }: { id: string; name: string; source: string; durationRounds?: number }) =>
      characterApi.applyCondition(token!, id, name, source, durationRounds),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: QUERY_KEYS.character(id) }),
  });
}
