'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useTableStore } from '@/lib/store/table.store';
import { useAuthStore } from '@/lib/store/auth.store';
import { ChatPanel } from '@/components/chat/chat-panel';
import { InitiativePanel } from '@/components/initiative/initiative-panel';
import { SheetPanel } from '@/components/sheet/sheet-panel';
import CompendiumPanel from '@/components/compendium/CompendiumPanel';
import { COMMANDS } from '@/lib/colyseus/commands';
import { clsx } from 'clsx';

const VttCanvas = dynamic(
  () => import('@/components/vtt/vtt-canvas').then((m) => ({ default: m.VttCanvas })),
  { ssr: false, loading: () => <div className="w-full h-full bg-vtt-bg animate-pulse" /> },
);

type Panel = 'chat' | 'initiative' | 'sheet' | 'compendium' | null;

function Toolbar() {
  const { toolMode, setToolMode, client, roomState } = useTableStore();
  const { user } = useAuthStore();
  const isGm = roomState?.gmId === user?.id;

  const tools = [
    { id: 'select',         icon: '↖',  label: 'Selecionar (S)' },
    { id: 'measure',        icon: '📏', label: 'Medir Distância (M)' },
    { id: 'measure_circle', icon: '⭕', label: 'Medir Área Circular' },
    { id: 'measure_cone',   icon: '🔺', label: 'Medir Cone (60°)' },
    { id: 'ping',           icon: '📍', label: 'Marcar Ponto' },
    ...(isGm ? [
      { id: 'draw_wall',    icon: '🧱', label: 'Desenhar Parede' },
      { id: 'draw_door',    icon: '🚪', label: 'Adicionar Porta' },
    ] : []),
  ] as const;

  return (
    <div className="flex flex-col gap-1 p-2 bg-vtt-surface border-r border-vtt-border">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setToolMode(tool.id as never)}
          title={tool.label}
          className={clsx(
            'w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors',
            toolMode === tool.id
              ? 'bg-vtt-accent text-white'
              : 'text-vtt-muted hover:bg-vtt-border hover:text-vtt-text',
          )}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}

function PanelToggleBar({
  active,
  onToggle,
}: {
  active: Panel;
  onToggle: (p: Panel) => void;
}) {
  const buttons: Array<{ id: Panel; label: string; icon: string }> = [
    { id: 'chat',       label: 'Chat',       icon: '💬' },
    { id: 'initiative', label: 'Iniciativa', icon: '⚔️' },
    { id: 'sheet',      label: 'Ficha',      icon: '📋' },
    { id: 'compendium', label: 'Compêndio',  icon: '📚' },
  ];

  return (
    <div className="flex gap-1 p-2 bg-vtt-surface border-b border-vtt-border">
      {buttons.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onToggle(active === id ? null : id)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
            active === id
              ? 'bg-vtt-accent text-white'
              : 'text-vtt-muted hover:bg-vtt-border hover:text-vtt-text',
          )}
        >
          <span>{icon}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function TablePage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params['tableId'] as string;

  const { connect, disconnect, connected, error, roomState, client } = useTableStore();
  const { user, accessToken } = useAuthStore();
  const [activePanel, setActivePanel] = useState<Panel>('chat');
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    if (!user || !accessToken) {
      router.push('/login');
      return;
    }

    // TODO: fetch actual mapId from campaign-service
    const mapId = new URLSearchParams(window.location.search).get('mapId') ?? '';

    connect({
      tableId,
      campaignId: tableId, // simplified — in production fetch from campaign-service
      mapId,
      userId: user.id,
      displayName: user.displayName,
      token: accessToken,
    })
      .catch((err) => console.error('Connection failed:', err))
      .finally(() => setConnecting(false));

    return () => { disconnect(); };
  }, [tableId, user, accessToken]);

  // Ping keepalive every 30s
  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => {
      client?.send({ type: COMMANDS.PING });
    }, 30_000);
    return () => clearInterval(interval);
  }, [connected, client]);

  if (connecting) {
    return (
      <div className="min-h-screen bg-vtt-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-vtt-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-vtt-muted">Conectando à mesa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-vtt-bg flex items-center justify-center">
        <div className="card text-center max-w-sm">
          <p className="text-vtt-danger mb-4">{error}</p>
          <button onClick={() => router.push('/campaigns')} className="btn-primary">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-vtt-bg overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-vtt-surface border-b border-vtt-border shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/campaigns')} className="btn-ghost text-sm py-1">
            ← Sair
          </button>
          <span className="text-vtt-text font-medium text-sm">
            {roomState?.tableId ?? 'Mesa'}
          </span>
          {roomState?.phase === 'combat' && (
            <span className="text-xs bg-vtt-danger/20 text-vtt-danger px-2 py-0.5 rounded-full font-medium">
              ⚔️ Combate — Round {roomState.round}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-vtt-muted text-xs">
            {roomState?.players.size ?? 0} jogadores
          </span>
          <div className={clsx('w-2 h-2 rounded-full', connected ? 'bg-vtt-success' : 'bg-vtt-danger')} />
        </div>
      </header>

      {/* Panel toggle */}
      <PanelToggleBar active={activePanel} onToggle={setActivePanel} />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <Toolbar />

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <VttCanvas />
        </div>

        {/* Side panel */}
        {activePanel && (
          <div className="w-72 shrink-0 panel overflow-hidden flex flex-col">
            {activePanel === 'chat' && <ChatPanel />}
            {activePanel === 'initiative' && <InitiativePanel />}
            {activePanel === 'sheet' && <SheetPanel />}
            {activePanel === 'compendium' && (
              <CompendiumPanel defaultSystem="tormenta20" className="flex-1 overflow-hidden" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
