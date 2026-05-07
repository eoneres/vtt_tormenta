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
