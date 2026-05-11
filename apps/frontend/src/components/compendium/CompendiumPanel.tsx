'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { useCompendiumSearchState, useCompendiumEntry } from '../../hooks/useCompendium';
import type { CompendiumEntry } from '../../hooks/useCompendium';

// ─── Constants ────────────────────────────────────────────────────────────────

const GAME_SYSTEMS = [
  { id: 'tormenta20', label: 'Tormenta20', emoji: '🐉' },
  { id: 'dnd5e', label: 'D&D 5e', emoji: '⚔️' },
  { id: 'shadowrun', label: 'Shadowrun', emoji: '🤖' },
  { id: 'custom', label: 'Custom', emoji: '⚙️' },
];

const ENTRY_TYPES: Record<string, { label: string; emoji: string; color: string }> = {
  race:      { label: 'Raças',      emoji: '🧬', color: 'text-emerald-400' },
  class:     { label: 'Classes',    emoji: '⚔️', color: 'text-violet-400' },
  origin:    { label: 'Origens',    emoji: '📜', color: 'text-teal-400' },
  power:     { label: 'Poderes',    emoji: '💥', color: 'text-orange-400' },
  spell:     { label: 'Magias',     emoji: '✨', color: 'text-blue-400' },
  ritual:    { label: 'Rituais',    emoji: '🔮', color: 'text-indigo-400' },
  monster:   { label: 'Monstros',   emoji: '👹', color: 'text-red-400' },
  item:      { label: 'Itens',      emoji: '⚗️', color: 'text-amber-400' },
  equipment: { label: 'Equipamentos', emoji: '🛡️', color: 'text-slate-400' },
  condition: { label: 'Condições',  emoji: '🌀', color: 'text-purple-400' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
  isLoading,
}: {
  value: string;
  onChange: (v: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
        {isLoading ? '⟳' : '🔍'}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar no compêndio..."
        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors"
        aria-label="Buscar entradas do compêndio"
      />
    </div>
  );
}

function SystemTabs({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (s: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
      {GAME_SYSTEMS.map((sys) => (
        <button
          key={sys.id}
          onClick={() => onSelect(sys.id)}
          className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            selected === sys.id
              ? 'bg-violet-700 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }`}
        >
          <span>{sys.emoji}</span>
          <span>{sys.label}</span>
        </button>
      ))}
    </div>
  );
}

function TypeFilter({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (t: string | undefined) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      <button
        onClick={() => onSelect(undefined)}
        className={`px-2 py-0.5 rounded text-[11px] transition-all ${
          !selected
            ? 'bg-slate-600 text-white'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
        }`}
      >
        Todos
      </button>
      {Object.entries(ENTRY_TYPES).map(([type, config]) => (
        <button
          key={type}
          onClick={() => onSelect(type === selected ? undefined : type)}
          className={`px-2 py-0.5 rounded text-[11px] transition-all flex items-center gap-1 ${
            selected === type
              ? 'bg-slate-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <span>{config.emoji}</span>
          <span>{config.label}</span>
        </button>
      ))}
    </div>
  );
}

function EntryListItem({
  entry,
  isSelected,
  onClick,
  onDragToCombat,
}: {
  entry: CompendiumEntry;
  isSelected: boolean;
  onClick: () => void;
  onDragToCombat?: (entry: CompendiumEntry) => void;
}) {
  const typeConfig = ENTRY_TYPES[entry.type] ?? { emoji: '📄', color: 'text-slate-400' };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/vtt-compendium', JSON.stringify(entry));
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={onClick}
      className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all select-none ${
        isSelected
          ? 'bg-violet-900/30 border border-violet-600/50'
          : 'hover:bg-slate-800/60 border border-transparent'
      }`}
      role="button"
      aria-selected={isSelected}
    >
      <span className="text-base shrink-0">{typeConfig.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isSelected ? 'text-violet-200' : 'text-slate-200'}`}>
          {entry.name}
        </p>
        {entry.shortDescription && (
          <p className="text-xs text-slate-500 truncate">{entry.shortDescription}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {entry.isHomebrew && (
          <span className="text-[9px] bg-violet-900/50 text-violet-300 px-1 rounded border border-violet-700/50">HB</span>
        )}
        <span className="text-slate-600 text-xs" title="Arrastar para mesa">⋮⋮</span>
      </div>
    </div>
  );
}

function EntryDetail({ entry }: { entry: CompendiumEntry }) {
  const typeConfig = ENTRY_TYPES[entry.type] ?? { emoji: '📄', color: 'text-slate-400', label: entry.type };
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-start gap-2.5">
          <span className="text-3xl">{typeConfig.emoji}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-100 leading-tight">{entry.name}</h2>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-[10px] uppercase tracking-wider font-semibold ${typeConfig.color}`}>
                {typeConfig.label ?? entry.type}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] text-slate-500">{entry.system}</span>
              {entry.isOfficial && (
                <span className="text-[9px] bg-amber-900/30 text-amber-400 border border-amber-700/30 px-1 rounded">Oficial</span>
              )}
              {entry.isHomebrew && (
                <span className="text-[9px] bg-violet-900/30 text-violet-400 border border-violet-700/30 px-1 rounded">Homebrew</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Short description */}
        {entry.shortDescription && (
          <p className="text-sm text-slate-300 italic leading-relaxed border-l-2 border-violet-500/50 pl-3">
            {entry.shortDescription}
          </p>
        )}

        {/* Description */}
        <div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {expanded ? entry.description : entry.description.slice(0, 300) + (entry.description.length > 300 ? '…' : '')}
          </p>
          {entry.description.length > 300 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-violet-400 hover:text-violet-300 mt-1 transition-colors"
            >
              {expanded ? '▲ Mostrar menos' : '▼ Mostrar mais'}
            </button>
          )}
        </div>

        {/* Attributes */}
        {entry.attributes.length > 0 && (
          <div>
            <h3 className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Atributos</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              {entry.attributes.map((attr) => (
                <div key={attr.key} className="space-y-0.5">
                  <dt className="text-[10px] text-slate-500 uppercase tracking-wide">
                    {attr.label ?? attr.key}
                  </dt>
                  <dd className="text-xs text-slate-300 font-medium">
                    {Array.isArray(attr.value)
                      ? (attr.value as unknown[]).join(', ')
                      : String(attr.value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded border border-slate-700/50"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Source */}
        {entry.source && (
          <div className="pt-2 border-t border-slate-700/50">
            <p className="text-[10px] text-slate-600">
              📚 {entry.source.book}
              {entry.source.page && `, página ${entry.source.page}`}
            </p>
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div className="px-4 py-2.5 border-t border-slate-700/50 bg-slate-900/50 flex gap-2">
        <button
          className="flex-1 py-1.5 text-xs bg-violet-700 hover:bg-violet-600 text-white rounded-lg transition-colors font-medium"
          title="Arrastar para a ficha do personagem"
        >
          + Adicionar à Ficha
        </button>
        <button
          className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
          title="Compartilhar no chat da mesa"
        >
          💬 Chat
        </button>
      </div>
    </div>
  );
}

// ─── Main CompendiumPanel ─────────────────────────────────────────────────────

export interface CompendiumPanelProps {
  defaultSystem?: string;
  onEntryDragToMap?: (entry: CompendiumEntry) => void;
  className?: string;
}

export default function CompendiumPanel({
  defaultSystem = 'tormenta20',
  onEntryDragToMap,
  className = '',
}: CompendiumPanelProps) {
  const [rawQuery, setRawQuery] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [debouncedQuery] = useDebounce(rawQuery, 300);

  const {
    entries,
    total,
    hasMore,
    page,
    isLoading,
    isFetching,
    params,
    search,
    filterByType,
    filterBySystem,
    nextPage,
    prevPage,
    toggleOfficial,
    toggleHomebrew,
  } = useCompendiumSearchState(defaultSystem);

  const selectedEntry = entries.find((e) => e.id === selectedEntryId) ?? null;

  // Sync debounced query to search hook
  React.useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  const handleEntryClick = useCallback((entry: CompendiumEntry) => {
    setSelectedEntryId(entry.id);
    setShowDetail(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setShowDetail(false);
    setSelectedEntryId(null);
  }, []);

  return (
    <div
      className={`flex flex-col h-full bg-slate-900 text-slate-200 overflow-hidden ${className}`}
      aria-label="Painel do Compêndio"
    >
      {/* ─── Panel header ─────────────────────────────────────────────────── */}
      <div className="flex-none px-3 pt-3 pb-2 border-b border-slate-700/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            📚 Compêndio
            {total > 0 && (
              <span className="text-[10px] font-normal text-slate-500">
                {total.toLocaleString('pt-BR')} entradas
              </span>
            )}
          </h2>
          {showDetail && (
            <button
              onClick={handleBackToList}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← Lista
            </button>
          )}
        </div>

        {!showDetail && (
          <>
            {/* System selector */}
            <SystemTabs
              selected={params.system ?? 'tormenta20'}
              onSelect={filterBySystem}
            />

            {/* Search */}
            <SearchInput
              value={rawQuery}
              onChange={setRawQuery}
              isLoading={isFetching}
            />

            {/* Type filter */}
            <TypeFilter
              selected={params.type}
              onSelect={filterByType}
            />

            {/* Flags */}
            <div className="flex gap-2">
              <button
                onClick={toggleOfficial}
                className={`px-2 py-0.5 text-[11px] rounded border transition-all ${
                  params.isOfficial
                    ? 'border-amber-600 bg-amber-900/20 text-amber-300'
                    : 'border-slate-700 text-slate-500 hover:border-slate-500'
                }`}
              >
                ⭐ Oficial
              </button>
              <button
                onClick={toggleHomebrew}
                className={`px-2 py-0.5 text-[11px] rounded border transition-all ${
                  params.isHomebrew
                    ? 'border-violet-600 bg-violet-900/20 text-violet-300'
                    : 'border-slate-700 text-slate-500 hover:border-slate-500'
                }`}
              >
                🛠 Homebrew
              </button>
            </div>
          </>
        )}
      </div>

      {/* ─── Content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {showDetail && selectedEntry ? (
          <EntryDetail entry={selectedEntry} />
        ) : (
          <div className="h-full flex flex-col">
            {/* Entry list */}
            <div className="flex-1 overflow-y-auto py-1.5 px-1.5 space-y-0.5">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-500">Carregando...</span>
                  </div>
                </div>
              ) : entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <span className="text-3xl mb-2">📭</span>
                  <p className="text-sm text-slate-500">
                    {rawQuery ? `Nenhuma entrada para "${rawQuery}"` : 'Nenhuma entrada encontrada'}
                  </p>
                  {rawQuery && (
                    <button
                      onClick={() => setRawQuery('')}
                      className="text-xs text-violet-400 hover:text-violet-300 mt-2 transition-colors"
                    >
                      Limpar busca
                    </button>
                  )}
                </div>
              ) : (
                entries.map((entry) => (
                  <EntryListItem
                    key={entry.id}
                    entry={entry}
                    isSelected={entry.id === selectedEntryId}
                    onClick={() => handleEntryClick(entry)}
                    onDragToCombat={onEntryDragToMap}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {!isLoading && entries.length > 0 && (
              <div className="flex-none flex items-center justify-between px-3 py-2 border-t border-slate-700/50 bg-slate-900/50">
                <button
                  onClick={prevPage}
                  disabled={page <= 1}
                  className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1"
                >
                  ← Anterior
                </button>
                <span className="text-[10px] text-slate-600">
                  Página {page} · {entries.length} de {total}
                </span>
                <button
                  onClick={nextPage}
                  disabled={!hasMore}
                  className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1"
                >
                  Próxima →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
