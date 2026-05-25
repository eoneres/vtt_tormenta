'use client';

/**
 * PATCH — frontend/src/components/dashboard/NewCampaignModal.tsx
 *
 * Modal de criação de nova campanha com:
 * - Seletor de sistema (Tormenta20 pré-selecionado)
 * - Nome obrigatório
 * - Descrição opcional
 * - Número máximo de jogadores
 *
 * Substitui o formulário inline existente no dashboard.
 * Importar e usar no dashboard/page.tsx onde atualmente está o
 * form de criação de campanha.
 */

import { useState, useTransition, FormEvent } from 'react';
import { SYSTEMS } from '@/lib/systems';
import { useAuth } from '@/contexts/auth.context';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (campaign: Record<string, unknown>) => void;
}

export default function NewCampaignModal({ open, onClose, onCreated }: Props) {
  const { accessToken } = useAuth();
  const [nome, setNome] = useState('');
  const [systemId, setSystemId] = useState('tormenta20'); // T20 como padrão
  const [descricao, setDescricao] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [saving, startSave] = useTransition();
  const [error, setError] = useState('');

  const CAMPAIGN_URL = process.env.NEXT_PUBLIC_CAMPAIGN_URL ?? 'http://localhost:3002';

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setError('');

    startSave(async () => {
      try {
        const res = await fetch(`${CAMPAIGN_URL}/campaigns`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: nome.trim(),
            systemId,
            description: descricao.trim() || undefined,
            maxPlayers,
          }),
        });
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.message ?? 'Falha ao criar campanha');
        }
        const campaign = await res.json();
        onCreated(campaign);
        // Reset
        setNome('');
        setSystemId('tormenta20');
        setDescricao('');
        setMaxPlayers(5);
        onClose();
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-md space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Nova Campanha</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-xs text-stone-400 uppercase tracking-widest">Nome da campanha *</label>
            <input
              autoFocus
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="A Maldição de Thorn…"
              required
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Sistema */}
          <div className="space-y-1.5">
            <label className="text-xs text-stone-400 uppercase tracking-widest">Sistema de RPG</label>
            <div className="grid grid-cols-2 gap-2">
              {SYSTEMS.map(sys => (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => setSystemId(sys.id)}
                  className={`flex flex-col items-start px-3 py-2.5 rounded-xl border text-left transition ${
                    systemId === sys.id
                      ? 'border-amber-500 bg-amber-950/30 text-amber-300'
                      : 'border-stone-700 bg-stone-800/50 text-stone-400 hover:border-stone-600'
                  }`}
                >
                  <span className="font-semibold text-sm">{sys.shortLabel}</span>
                  <span className="text-xs text-stone-500 mt-0.5 line-clamp-1">{sys.label}</span>
                  {sys.hasSheet && (
                    <span className="mt-1 text-[9px] text-green-400 uppercase tracking-wider">✓ Ficha visual</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-xs text-stone-400 uppercase tracking-widest">Descrição (opcional)</label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={3}
              placeholder="Uma breve sinopse da campanha…"
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Máximo de jogadores */}
          <div className="space-y-1.5">
            <label className="text-xs text-stone-400 uppercase tracking-widest">Máximo de jogadores</label>
            <div className="flex items-center gap-3">
              {[3, 4, 5, 6, 8].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMaxPlayers(n)}
                  className={`w-10 h-10 rounded-xl border font-semibold text-sm transition ${
                    maxPlayers === n
                      ? 'border-amber-500 bg-amber-950/30 text-amber-300'
                      : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'
                  }`}
                >
                  {n}
                </button>
              ))}
              <input
                type="number"
                min={2}
                max={20}
                value={maxPlayers}
                onChange={e => setMaxPlayers(parseInt(e.target.value) || 5)}
                className="w-16 bg-stone-800 border border-stone-700 rounded-xl px-2 py-2 text-sm text-center focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Erro */}
          {error && (
            <p className="text-red-400 text-xs bg-red-950/30 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || !nome.trim()}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl transition disabled:opacity-50"
            >
              {saving ? 'Criando…' : 'Criar campanha'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-stone-400 hover:text-white text-sm transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
