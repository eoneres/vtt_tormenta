import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InitiativeEntry {
  id: string;
  tokenId: string;
  name: string;
  initiative: number;
  hp?: number;
  maxHp?: number;
  isActive: boolean;
  isPlayer: boolean;
  conditions: string[];
  imageUrl?: string;
  isDelayed?: boolean;
  isReadied?: boolean;
}

export interface InitiativeTrackerProps {
  entries: InitiativeEntry[];
  round: number;
  isGM: boolean;
  onNextTurn?: () => void;
  onPrevTurn?: () => void;
  onEndCombat?: () => void;
  onAddEntry?: (name: string, initiative: number) => void;
  onRemoveEntry?: (id: string) => void;
  onDelay?: (id: string) => void;
  onReady?: (id: string) => void;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function HpBar({ hp, maxHp }: { hp: number; maxHp: number }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const color =
    pct > 50 ? 'bg-emerald-500' :
    pct > 25 ? 'bg-amber-500' :
    pct > 0  ? 'bg-red-500' : 'bg-slate-700';

  return (
    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-500', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function InitiativeEntryRow({
  entry,
  isGM,
  onDelay,
  onReady,
  onRemove,
}: {
  entry: InitiativeEntry;
  isGM: boolean;
  onDelay?: () => void;
  onReady?: () => void;
  onRemove?: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={cn(
        'relative rounded-lg border transition-all duration-200',
        entry.isActive
          ? 'border-violet-500 bg-violet-900/20 shadow-md shadow-violet-900/30'
          : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600',
        entry.isDelayed && 'opacity-60 border-dashed',
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Active indicator */}
      {entry.isActive && (
        <div className="absolute -left-px top-1/2 -translate-y-1/2 w-0.5 h-8 bg-violet-400 rounded-full" />
      )}

      <div className="flex items-center gap-2.5 px-3 py-2">
        {/* Initiative badge */}
        <div className={cn(
          'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black tabular-nums',
          entry.isActive
            ? 'bg-violet-600 text-white'
            : 'bg-slate-700 text-slate-300',
        )}>
          {entry.initiative}
        </div>

        {/* Avatar */}
        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt={entry.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-600 shrink-0"
          />
        ) : (
          <div className={cn(
            'w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold',
            entry.isPlayer ? 'bg-blue-800 text-blue-200' : 'bg-red-900 text-red-200',
          )}>
            {entry.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn(
              'text-sm font-medium truncate',
              entry.isActive ? 'text-violet-200' : 'text-slate-200',
            )}>
              {entry.name}
            </span>
            {entry.isDelayed && <Badge variant="warning" size="sm">Aguardando</Badge>}
            {entry.isReadied && <Badge variant="nature" size="sm">Preparado</Badge>}
            {entry.conditions.slice(0, 2).map((c) => (
              <Badge key={c} variant="danger" size="sm">{c}</Badge>
            ))}
          </div>
          {entry.hp !== undefined && entry.maxHp !== undefined && (
            <div className="mt-1 flex items-center gap-2">
              <HpBar hp={entry.hp} maxHp={entry.maxHp} />
              {isGM && (
                <span className="text-[10px] text-slate-500 tabular-nums shrink-0">
                  {entry.hp}/{entry.maxHp}
                </span>
              )}
            </div>
          )}
        </div>

        {/* GM Actions */}
        {isGM && showActions && (
          <div className="flex gap-1 shrink-0">
            {onDelay && (
              <button
                onClick={onDelay}
                title="Adiar turno"
                className="w-6 h-6 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-700 transition-colors text-xs"
              >
                ⏸
              </button>
            )}
            {onReady && (
              <button
                onClick={onReady}
                title="Preparar ação"
                className="w-6 h-6 rounded text-slate-400 hover:text-green-400 hover:bg-slate-700 transition-colors text-xs"
              >
                ⚡
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                title="Remover"
                className="w-6 h-6 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors text-xs"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function InitiativeTracker({
  entries,
  round,
  isGM,
  onNextTurn,
  onPrevTurn,
  onEndCombat,
  onAddEntry,
  onRemoveEntry,
  onDelay,
  onReady,
  className,
}: InitiativeTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newInit, setNewInit] = useState('');

  const sorted = [...entries].sort((a, b) => {
    // Delayed entries go to the end
    if (a.isDelayed && !b.isDelayed) return 1;
    if (!a.isDelayed && b.isDelayed) return -1;
    return b.initiative - a.initiative;
  });

  const activeIndex = sorted.findIndex((e) => e.isActive);

  const handleAdd = () => {
    if (!newName.trim() || !newInit.trim()) return;
    onAddEntry?.(newName.trim(), parseInt(newInit, 10));
    setNewName('');
    setNewInit('');
    setShowAddForm(false);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Iniciativa</span>
          <Badge variant="arcane" size="sm">Rodada {round}</Badge>
        </div>
        {isGM && (
          <div className="flex gap-1">
            <Button size="xs" variant="ghost" onClick={() => setShowAddForm(v => !v)} title="Adicionar">
              +
            </Button>
            {onEndCombat && (
              <Button size="xs" variant="danger" onClick={onEndCombat}>
                Encerrar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add form */}
      {showAddForm && isGM && (
        <div className="flex gap-2 bg-slate-800 rounded-lg p-2 border border-slate-700">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome"
            className="flex-1 bg-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <input
            value={newInit}
            onChange={(e) => setNewInit(e.target.value)}
            placeholder="Init"
            type="number"
            className="w-14 bg-slate-700 rounded px-2 py-1 text-xs text-slate-200 text-center focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <Button size="xs" variant="primary" onClick={handleAdd}>OK</Button>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-1.5">
        {sorted.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            Nenhum combatente na iniciativa
          </div>
        ) : (
          sorted.map((entry, idx) => (
            <React.Fragment key={entry.id}>
              {/* Turn separator */}
              {idx === activeIndex + 1 && (
                <div className="flex items-center gap-2 py-0.5">
                  <div className="flex-1 h-px bg-slate-700/50" />
                  <span className="text-[10px] text-slate-600">próximos</span>
                  <div className="flex-1 h-px bg-slate-700/50" />
                </div>
              )}
              <InitiativeEntryRow
                entry={entry}
                isGM={isGM}
                onDelay={isGM ? () => onDelay?.(entry.id) : undefined}
                onReady={isGM ? () => onReady?.(entry.id) : undefined}
                onRemove={isGM ? () => onRemoveEntry?.(entry.id) : undefined}
              />
            </React.Fragment>
          ))
        )}
      </div>

      {/* Navigation */}
      {isGM && sorted.length > 0 && (
        <div className="flex gap-2 pt-1">
          {onPrevTurn && (
            <Button size="sm" variant="ghost" onClick={onPrevTurn} className="flex-1">
              ← Anterior
            </Button>
          )}
          {onNextTurn && (
            <Button size="sm" variant="primary" onClick={onNextTurn} className="flex-1">
              Próximo →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
