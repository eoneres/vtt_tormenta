import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Badge } from '../Badge/Badge';

export interface TokenHUDData {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp?: number;
  maxMp?: number;
  conditions: string[];
  isPlayer: boolean;
  canControl: boolean;
  imageUrl?: string;
}

export interface TokenHUDProps {
  token: TokenHUDData;
  onHpChange?: (tokenId: string, newHp: number) => void;
  onMpChange?: (tokenId: string, newMp: number) => void;
  onAddCondition?: (tokenId: string, condition: string) => void;
  onRemoveCondition?: (tokenId: string, condition: string) => void;
  isGM?: boolean;
  className?: string;
}

const COMMON_CONDITIONS = [
  'Abalado', 'Agarrado', 'Apavorado', 'Atordoado', 'Caído',
  'Cego', 'Ensurdecido', 'Fascinado', 'Imóvel', 'Inconsciente',
  'Lento', 'Surpreendido', 'Vulnerável',
];

function HpBubble({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="relative w-full">
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function TokenHUD({
  token,
  onHpChange,
  onMpChange,
  onAddCondition,
  onRemoveCondition,
  isGM = false,
  className,
}: TokenHUDProps) {
  const [hpInput, setHpInput] = useState('');
  const [mpInput, setMpInput] = useState('');
  const [showConditions, setShowConditions] = useState(false);

  const canEdit = isGM || token.canControl;

  const applyHpDelta = (delta: number) => {
    const newHp = Math.max(0, Math.min(token.maxHp, token.hp + delta));
    onHpChange?.(token.id, newHp);
    setHpInput('');
  };

  const applyHpInput = () => {
    const val = parseInt(hpInput, 10);
    if (!isNaN(val)) applyHpDelta(val);
  };

  const hpColor =
    token.hp / token.maxHp > 0.5 ? 'bg-emerald-500' :
    token.hp / token.maxHp > 0.25 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className={cn(
      'rounded-xl border border-slate-600 bg-slate-900/95 backdrop-blur-sm shadow-xl shadow-black/50 p-3 min-w-[200px]',
      className,
    )}>
      {/* Name + type */}
      <div className="flex items-center gap-2 mb-2.5">
        {token.imageUrl ? (
          <img src={token.imageUrl} alt={token.name} className="w-8 h-8 rounded-full object-cover border border-slate-600" />
        ) : (
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
            token.isPlayer ? 'bg-blue-800 text-blue-200' : 'bg-red-900/60 text-red-200'
          )}>
            {token.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100 truncate">{token.name}</p>
          <p className="text-[10px] text-slate-500">{token.isPlayer ? 'Personagem' : 'NPC/Monstro'}</p>
        </div>
      </div>

      {/* HP */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center justify-between text-xs mb-0.5">
          <span className="text-slate-400 uppercase tracking-wider text-[10px]">PV</span>
          <span className="text-slate-300 tabular-nums font-mono">
            {token.hp} / {token.maxHp}
          </span>
        </div>
        <HpBubble value={token.hp} max={token.maxHp} color={hpColor} />

        {canEdit && (
          <div className="flex gap-1 mt-1.5">
            <button
              onClick={() => applyHpDelta(-5)}
              className="flex-1 py-0.5 text-xs bg-red-900/50 hover:bg-red-800/50 text-red-300 rounded transition-colors"
            >−5</button>
            <button
              onClick={() => applyHpDelta(-1)}
              className="flex-1 py-0.5 text-xs bg-red-900/30 hover:bg-red-800/30 text-red-400 rounded transition-colors"
            >−1</button>
            <input
              value={hpInput}
              onChange={(e) => setHpInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyHpInput()}
              placeholder="±"
              className="w-10 text-center text-xs bg-slate-700 text-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-violet-500 py-0.5"
            />
            <button
              onClick={() => applyHpDelta(1)}
              className="flex-1 py-0.5 text-xs bg-emerald-900/30 hover:bg-emerald-800/30 text-emerald-400 rounded transition-colors"
            >+1</button>
            <button
              onClick={() => applyHpDelta(5)}
              className="flex-1 py-0.5 text-xs bg-emerald-900/50 hover:bg-emerald-800/50 text-emerald-300 rounded transition-colors"
            >+5</button>
          </div>
        )}
      </div>

      {/* MP (optional) */}
      {token.mp !== undefined && token.maxMp !== undefined && (
        <div className="space-y-1 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">PM</span>
            <span className="text-xs text-slate-300 tabular-nums font-mono">
              {token.mp} / {token.maxMp}
            </span>
          </div>
          <HpBubble value={token.mp} max={token.maxMp} color="bg-blue-500" />
        </div>
      )}

      {/* Conditions */}
      {(token.conditions.length > 0 || canEdit) && (
        <div className="border-t border-slate-700/50 pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Condições</span>
            {canEdit && (
              <button
                onClick={() => setShowConditions(v => !v)}
                className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
              >
                {showConditions ? '▲' : '+ Adicionar'}
              </button>
            )}
          </div>

          {token.conditions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {token.conditions.map((c) => (
                <span
                  key={c}
                  className="group inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-red-900/40 text-red-300 border border-red-800/50"
                >
                  {c}
                  {canEdit && (
                    <button
                      onClick={() => onRemoveCondition?.(token.id, c)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-300 leading-none transition-opacity"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-slate-600 italic">Nenhuma condição</p>
          )}

          {showConditions && canEdit && (
            <div className="mt-2 grid grid-cols-2 gap-0.5">
              {COMMON_CONDITIONS.filter(c => !token.conditions.includes(c)).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onAddCondition?.(token.id, c);
                    setShowConditions(false);
                  }}
                  className="text-left text-[10px] px-1.5 py-0.5 rounded text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
                >
                  + {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
