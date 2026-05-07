'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCampaigns, useCreateCampaign, useArchiveCampaign } from '@/lib/hooks/use-queries';
import { useAuthStore } from '@/lib/store/auth.store';
import type { Campaign } from '@vtt/shared-types';

const SYSTEMS = [
  { id: 'tormenta20', label: 'Tormenta 20', color: 'bg-amber-600' },
  { id: 'dnd5e', label: 'D&D 5e', color: 'bg-red-700' },
  { id: 'shadowrun', label: 'Shadowrun', color: 'bg-green-700' },
];

const createSchema = z.object({
  name: z.string().min(2).max(100),
  systemId: z.string().min(1),
  description: z.string().max(500).optional(),
});
type CreateForm = z.infer<typeof createSchema>;

function SystemBadge({ systemId }: { systemId: string }) {
  const sys = SYSTEMS.find((s) => s.id === systemId);
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${sys?.color ?? 'bg-vtt-muted'}`}>
      {sys?.label ?? systemId}
    </span>
  );
}

function CampaignCard({ campaign, onEnter, onArchive }: {
  campaign: Campaign;
  onEnter: () => void;
  onArchive: () => void;
}) {
  return (
    <div className="card hover:border-vtt-accent/50 transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-vtt-text truncate">{campaign.name}</h3>
          {campaign.description && (
            <p className="text-vtt-muted text-sm mt-1 line-clamp-2">{campaign.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <SystemBadge systemId={campaign.systemId} />
            <span className="text-vtt-muted text-xs">
              {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEnter} className="btn-primary text-sm py-1 px-3">
            Entrar
          </button>
          <button
            onClick={onArchive}
            className="btn-ghost text-sm py-1 px-2 text-vtt-danger hover:text-vtt-danger"
          >
            Arquivar
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateCampaignModal({ onClose }: { onClose: () => void }) {
  const { mutateAsync, isPending } = useCreateCampaign();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { systemId: 'tormenta20' },
  });

  const onSubmit = async (data: CreateForm) => {
    await mutateAsync(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Nova Campanha</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input {...register('name')} className="input-field" placeholder="A Maldição de Arton" />
            {errors.name && <p className="text-vtt-danger text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sistema</label>
            <select {...register('systemId')} className="input-field">
              {SYSTEMS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
            <textarea
              {...register('description')}
              className="input-field resize-none"
              rows={3}
              placeholder="Descreva sua campanha..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useCampaigns();
  const { mutate: archive } = useArchiveCampaign();

  return (
    <div className="min-h-screen bg-vtt-bg">
      {/* Header */}
      <header className="border-b border-vtt-border bg-vtt-surface px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-vtt-text">VTT Tormenta</h1>
        <div className="flex items-center gap-4">
          <span className="text-vtt-muted text-sm">{user?.displayName}</span>
          <button onClick={logout} className="btn-ghost text-sm">Sair</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Minhas Campanhas</h2>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            + Nova Campanha
          </button>
        </div>

        {isLoading && (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse h-24 bg-vtt-border/20" />
            ))}
          </div>
        )}

        {!isLoading && data?.data.length === 0 && (
          <div className="text-center py-16 text-vtt-muted">
            <p className="text-lg">Nenhuma campanha ainda.</p>
            <p className="text-sm mt-1">Crie sua primeira campanha para começar!</p>
          </div>
        )}

        <div className="grid gap-3">
          {data?.data.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEnter={() => router.push(`/table/${campaign.id}`)}
              onArchive={() => archive(campaign.id)}
            />
          ))}
        </div>
      </main>

      {showCreate && <CreateCampaignModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
