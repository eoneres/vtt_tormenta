'use client';

import { useTableStore } from '@/lib/store/table.store';
import { useAuthStore } from '@/lib/store/auth.store';
import { COMMANDS } from '@/lib/colyseus/commands';
import { clsx } from 'clsx';

export function InitiativePanel() {
  const { roomState, client } = useTableStore();
  const { user } = useAuthStore();

  const isGm = roomState?.gmId === user?.id;
  const phase = roomState?.phase ?? 'exploration';
  const initiative = roomState?.initiative ?? [];
  const currentTurn = roomState?.turn ?? 0;

  const startCombat = () => client?.send({ type: COMMANDS.START_COMBAT });
  const endCombat = () => client?.send({ type: COMMANDS.END_COMBAT });
  const nextTurn = () => client?.send({ type: COMMANDS.NEXT_TURN });

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-vtt-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-vtt-text">Iniciativa</h3>
        {phase === 'combat' && (
          <span className="text-xs text-vtt-warning font-medium">
            Round {roomState?.round}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {initiative.length === 0 ? (
          <p className="text-vtt-muted text-xs text-center py-6">
            Nenhuma iniciativa definida
          </p>
        ) : (
          <ul className="divide-y divide-vtt-border">
            {initiative.map((entry, idx) => (
              <li
                key={entry.tokenId}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 text-sm',
                  idx === currentTurn && phase === 'combat' && 'bg-vtt-accent/10 border-l-2 border-vtt-accent',
                  entry.hasActed && 'opacity-50',
                )}
              >
                <span className="font-mono text-vtt-accent w-6 text-right shrink-0">
                  {entry.initiative}
                </span>
                <span className="flex-1 truncate text-vtt-text">{entry.name}</span>
                {idx === currentTurn && phase === 'combat' && (
                  <span className="text-vtt-accent text-xs">▶</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isGm && (
        <div className="px-3 py-2 border-t border-vtt-border space-y-2">
          {phase !== 'combat' ? (
            <button onClick={startCombat} className="btn-primary w-full text-sm py-1.5">
              ⚔️ Iniciar Combate
            </button>
          ) : (
            <>
              <button onClick={nextTurn} className="btn-primary w-full text-sm py-1.5">
                Próximo Turno →
              </button>
              <button
                onClick={endCombat}
                className="w-full text-sm py-1.5 text-vtt-danger hover:bg-vtt-danger/10 rounded-lg transition-colors"
              >
                Encerrar Combate
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
