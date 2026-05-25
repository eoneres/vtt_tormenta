'use client';

/**
 * CharacterSheet — roteador de sistemas
 *
 * systemId          → componente
 * ──────────────────────────────────────
 * 'tormenta20'      → Tormenta20Sheet  (Ciclo 6)
 * 'dnd5e'           → Dnd5eSheetEditor (Ciclo 5)
 * qualquer outro    → GenericSheetEditor (JSON bruto)
 */

import { useTransition, useState } from 'react';
import Tormenta20Sheet from './Tormenta20Sheet';
import { T20Sheet } from './tormenta20-types';
import { Dnd5eSheet, defaultDnd5eSheet } from './dnd5e-types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CharacterSheetProps {
  sheet: Record<string, unknown>;
  characterName: string;
  systemId: string;
  readOnly?: boolean;
  onSave?: (sheetData: Record<string, unknown>) => Promise<void>;
}

// ─── Roteador ─────────────────────────────────────────────────────────────────

export default function CharacterSheet({
  sheet,
  characterName,
  systemId,
  readOnly,
  onSave,
}: CharacterSheetProps) {
  // ── Tormenta20 ──────────────────────────────────────────────────────────────
  if (systemId === 'tormenta20') {
    return (
      <Tormenta20Sheet
        sheet={sheet}
        characterName={characterName}
        readOnly={readOnly}
        onSave={onSave as ((data: T20Sheet) => Promise<void>) | undefined}
      />
    );
  }

  // ── D&D 5e ──────────────────────────────────────────────────────────────────
  if (systemId === 'dnd5e') {
    // Importação dinâmica inline para não aumentar o bundle quando o sistema
    // não é D&D 5e.  O componente já estava completo no Ciclo 5.
    return (
      <Dnd5eSheetWrapper
        sheet={sheet}
        characterName={characterName}
        readOnly={readOnly}
        onSave={onSave}
      />
    );
  }

  // ── Fallback genérico ───────────────────────────────────────────────────────
  return (
    <GenericSheetEditor
      sheet={sheet}
      systemId={systemId}
      readOnly={readOnly}
      onSave={onSave}
    />
  );
}

// ─── D&D 5e wrapper (lazy import) ────────────────────────────────────────────

import dynamic from 'next/dynamic';

const Dnd5eSheetEditor = dynamic(
  () => import('./Dnd5eSheetEditor').then(m => m.Dnd5eSheetEditor),
  { loading: () => <SheetSkeleton />, ssr: false },
);

function Dnd5eSheetWrapper({
  sheet, characterName, readOnly, onSave,
}: {
  sheet: Record<string, unknown>;
  characterName: string;
  readOnly?: boolean;
  onSave?: (data: Record<string, unknown>) => Promise<void>;
}) {
  const initial = defaultDnd5eSheet(sheet as Partial<Dnd5eSheet>);
  return (
    <Dnd5eSheetEditor
      initial={initial}
      characterName={characterName}
      readOnly={readOnly}
      onSave={onSave as any}
    />
  );
}

// ─── Editor JSON genérico ─────────────────────────────────────────────────────

function GenericSheetEditor({
  sheet, systemId, readOnly, onSave,
}: {
  sheet: Record<string, unknown>;
  systemId: string;
  readOnly?: boolean;
  onSave?: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [json, setJson] = useState(JSON.stringify(sheet, null, 2));
  const [error, setError] = useState('');
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(json);
      setError('');
      if (onSave) {
        startSave(async () => {
          await onSave(parsed);
          setSaved(true);
        });
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="bg-stone-950 border border-stone-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">Sistema</p>
          <p className="font-semibold text-white">{systemId}</p>
        </div>
        <span className="text-xs bg-stone-800 text-stone-400 px-3 py-1 rounded-full">
          Sem ficha dedicada — editor JSON
        </span>
      </div>
      <p className="text-xs text-stone-500">
        Este sistema ainda não tem uma ficha visual dedicada. Edite os dados diretamente em JSON.
      </p>
      <textarea
        rows={24}
        value={json}
        onChange={e => { setJson(e.target.value); setSaved(false); }}
        readOnly={readOnly}
        spellCheck={false}
        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-4 py-3 text-xs font-mono text-green-300 focus:outline-none focus:border-amber-500 resize-y"
      />
      {error && (
        <p className="text-red-400 text-xs bg-red-950/30 border border-red-800 rounded-lg px-3 py-2">
          JSON inválido: {error}
        </p>
      )}
      {!readOnly && onSave && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          {saved && <span className="text-green-400 text-xs">✓ Salvo</span>}
        </div>
      )}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SheetSkeleton() {
  return (
    <div className="bg-stone-950 border border-stone-800 rounded-xl p-5 animate-pulse space-y-4">
      <div className="h-6 bg-stone-800 rounded w-1/3" />
      <div className="h-4 bg-stone-800 rounded w-1/2" />
      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-stone-800 rounded-xl" />
        ))}
      </div>
      <div className="h-40 bg-stone-800 rounded-xl" />
    </div>
  );
}
