import React, { useState, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiceResult {
  notation: string;
  rolls: number[];
  total: number;
  breakdown: string;
  timestamp: number;
}

export interface DiceRollerProps {
  onRoll?: (notation: string) => Promise<DiceResult> | DiceResult;
  className?: string;
  compact?: boolean;
}

// ─── Presets ─────────────────────────────────────────────────────────────────

const QUICK_DICE = [
  { label: 'd4',  notation: '1d4',  color: 'text-pink-400' },
  { label: 'd6',  notation: '1d6',  color: 'text-amber-400' },
  { label: 'd8',  notation: '1d8',  color: 'text-green-400' },
  { label: 'd10', notation: '1d10', color: 'text-blue-400' },
  { label: 'd12', notation: '1d12', color: 'text-purple-400' },
  { label: 'd20', notation: '1d20', color: 'text-violet-400' },
  { label: 'd100', notation: '1d100', color: 'text-slate-300' },
];

const T20_PRESETS = [
  { label: 'Ataque',    notation: '1d20' },
  { label: 'Ataque Furtivo', notation: '1d20+1d8' },
  { label: '4d6 drop',  notation: '4d6kh3' },
  { label: 'Dano 2d6',  notation: '2d6' },
  { label: 'Crítico',   notation: '2d20kh1' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function DiceRoller({ onRoll, className, compact = false }: DiceRollerProps) {
  const [notation, setNotation] = useState('1d20');
  const [modifier, setModifier] = useState('');
  const [history, setHistory] = useState<DiceResult[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<DiceResult | null>(null);

  const buildNotation = useCallback(() => {
    const mod = modifier.trim();
    if (!mod || mod === '0') return notation;
    const isNeg = mod.startsWith('-');
    return `${notation}${isNeg ? mod : `+${mod}`}`;
  }, [notation, modifier]);

  const handleRoll = useCallback(async () => {
    const fullNotation = buildNotation();
    setIsRolling(true);
    try {
      let result: DiceResult;
      if (onRoll) {
        result = await onRoll(fullNotation);
      } else {
        // Local fallback for UI testing
        result = localRoll(fullNotation);
      }
      setLastResult(result);
      setHistory((prev) => [result, ...prev].slice(0, 10));
    } finally {
      setIsRolling(false);
    }
  }, [buildNotation, onRoll]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void handleRoll();
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <input
          value={notation}
          onChange={(e) => setNotation(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
          placeholder="1d20+5"
          aria-label="Notação de dados"
        />
        <Button size="sm" variant="arcane" onClick={handleRoll} isLoading={isRolling}>
          🎲 Rolar
        </Button>
        {lastResult && (
          <span className={cn(
            'text-lg font-bold tabular-nums',
            lastResult.total >= 18 ? 'text-amber-400' :
            lastResult.total <= 2  ? 'text-red-400' : 'text-violet-300'
          )}>
            {lastResult.total}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Quick dice buttons */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_DICE.map((d) => (
          <button
            key={d.notation}
            onClick={() => setNotation(d.notation)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold border transition-all',
              notation === d.notation
                ? 'border-violet-500 bg-violet-900/50 text-violet-200'
                : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-400 hover:text-slate-200',
              d.color,
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Notation input + modifier */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            value={notation}
            onChange={(e) => setNotation(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
            placeholder="ex: 2d6+3"
            aria-label="Notação de dados"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">notação</span>
        </div>
        <div className="w-20">
          <input
            value={modifier}
            onChange={(e) => setModifier(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono text-center focus:outline-none focus:border-violet-500"
            placeholder="+0"
            aria-label="Modificador"
          />
        </div>
      </div>

      {/* Tormenta20 presets */}
      <div className="flex flex-wrap gap-1">
        {T20_PRESETS.map((p) => (
          <button
            key={p.notation}
            onClick={() => setNotation(p.notation)}
            className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors border border-slate-700"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Roll button */}
      <Button
        fullWidth
        variant="arcane"
        size="lg"
        onClick={handleRoll}
        isLoading={isRolling}
        leftIcon={<span>🎲</span>}
      >
        Rolar {buildNotation()}
      </Button>

      {/* Last result */}
      {lastResult && (
        <div className={cn(
          'rounded-xl border p-4 text-center transition-all',
          lastResult.total >= 20 && lastResult.notation.includes('d20')
            ? 'border-amber-500 bg-amber-900/20 shadow-lg shadow-amber-900/30'
            : lastResult.total <= 1 && lastResult.notation.includes('d20')
            ? 'border-red-700 bg-red-900/20'
            : 'border-slate-600 bg-slate-800/50',
        )}>
          <div className={cn(
            'text-5xl font-black tabular-nums mb-1',
            lastResult.total >= 20 && lastResult.notation.includes('d20') ? 'text-amber-400' :
            lastResult.total <= 1  && lastResult.notation.includes('d20') ? 'text-red-400' :
            'text-violet-300'
          )}>
            {lastResult.total}
          </div>
          <div className="text-xs text-slate-400 font-mono">{lastResult.breakdown}</div>
          {lastResult.total === 20 && lastResult.notation.includes('d20') && (
            <Badge variant="divine" className="mt-2">✨ CRÍTICO NATURAL!</Badge>
          )}
          {lastResult.total === 1 && lastResult.notation.includes('d20') && (
            <Badge variant="danger" className="mt-2">💀 FALHA CRÍTICA!</Badge>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Histórico</p>
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {history.slice(1).map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-slate-500 px-2 py-0.5 rounded hover:bg-slate-800/50">
                <span className="font-mono">{r.notation}</span>
                <span className="font-mono text-slate-400">{r.breakdown}</span>
                <span className="font-bold text-slate-300">{r.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Local Fallback Roll (client-side for UI testing) ─────────────────────────

function localRoll(notation: string): DiceResult {
  // Simple parser for UI-only fallback
  const match = notation.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!match) {
    return { notation, rolls: [0], total: 0, breakdown: 'invalid', timestamp: Date.now() };
  }
  const count = parseInt(match[1] || '1', 10);
  const sides = parseInt(match[2]!, 10);
  const mod = parseInt(match[3] || '0', 10);
  const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  const sum = rolls.reduce((a, b) => a + b, 0);
  const total = sum + mod;
  const modStr = mod !== 0 ? ` ${mod > 0 ? '+' : ''}${mod}` : '';
  return {
    notation,
    rolls,
    total,
    breakdown: `[${rolls.join(', ')}]${modStr} = ${total}`,
    timestamp: Date.now(),
  };
}
