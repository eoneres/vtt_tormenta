import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompendiumEntryData {
  id: string;
  name: string;
  type: string;
  system: string;
  shortDescription?: string;
  description: string;
  tags: string[];
  attributes: Array<{ key: string; value: unknown; label?: string }>;
  source?: { book: string; page?: number };
  isOfficial: boolean;
  isHomebrew: boolean;
}

export interface CompendiumCardProps {
  entry: CompendiumEntryData;
  onDragToSheet?: (entry: CompendiumEntryData) => void;
  onOpenDetail?: (entry: CompendiumEntryData) => void;
  compact?: boolean;
  className?: string;
}

// ─── Entry Type Icons and Colors ─────────────────────────────────────────────

const typeConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  race: { icon: '🧬', color: 'text-emerald-300', bgColor: 'bg-emerald-900/30' },
  class: { icon: '⚔️', color: 'text-violet-300', bgColor: 'bg-violet-900/30' },
  spell: { icon: '✨', color: 'text-blue-300', bgColor: 'bg-blue-900/30' },
  ritual: { icon: '🔮', color: 'text-indigo-300', bgColor: 'bg-indigo-900/30' },
  power: { icon: '💥', color: 'text-orange-300', bgColor: 'bg-orange-900/30' },
  monster: { icon: '👹', color: 'text-red-300', bgColor: 'bg-red-900/30' },
  item: { icon: '⚗️', color: 'text-amber-300', bgColor: 'bg-amber-900/30' },
  equipment: { icon: '🛡️', color: 'text-slate-300', bgColor: 'bg-slate-800/50' },
  condition: { icon: '🌀', color: 'text-purple-300', bgColor: 'bg-purple-900/30' },
  origin: { icon: '📜', color: 'text-teal-300', bgColor: 'bg-teal-900/30' },
  feat: { icon: '⭐', color: 'text-yellow-300', bgColor: 'bg-yellow-900/30' },
  background: { icon: '📖', color: 'text-cyan-300', bgColor: 'bg-cyan-900/30' },
};

const getTypeConfig = (type: string) =>
  typeConfig[type] ?? { icon: '📄', color: 'text-slate-300', bgColor: 'bg-slate-800/50' };

// ─── Component ────────────────────────────────────────────────────────────────

export function CompendiumCard({
  entry,
  onDragToSheet,
  onOpenDetail,
  compact = false,
  className,
}: CompendiumCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { icon, color, bgColor } = getTypeConfig(entry.type);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/vtt-compendium', JSON.stringify(entry));
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
  };

  const handleDragEnd = () => setIsDragging(false);

  // Compact layout for search results
  if (compact) {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => onOpenDetail?.(entry)}
        className={cn(
          'group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer',
          'border border-transparent hover:border-slate-600 hover:bg-slate-800/50',
          'transition-all duration-150',
          isDragging && 'opacity-50 scale-95',
          className,
        )}
      >
        <span className={cn('text-lg shrink-0 w-7 text-center', bgColor, 'rounded p-0.5')}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{entry.name}</p>
          {entry.shortDescription && (
            <p className="text-xs text-slate-400 truncate">{entry.shortDescription}</p>
          )}
        </div>
        {entry.isHomebrew && (
          <Badge variant="arcane" size="sm">HB</Badge>
        )}
        <span
          className="shrink-0 text-slate-600 group-hover:text-slate-400 transition-colors"
          title="Arraste para a ficha"
        >
          ⋮⋮
        </span>
      </div>
    );
  }

  // Full card layout
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'rounded-xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-sm',
        'transition-all duration-200 hover:border-slate-600 hover:shadow-lg hover:shadow-black/30',
        isDragging && 'opacity-50 scale-[0.97] border-violet-500',
        className,
      )}
    >
      {/* Header */}
      <div className={cn('flex items-start gap-3 p-4', bgColor, 'rounded-t-xl')}>
        <span className="text-3xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-semibold text-base leading-tight', color)}>
            {entry.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge variant="default" size="sm">
              {entry.type}
            </Badge>
            <Badge variant="default" size="sm">
              {entry.system}
            </Badge>
            {entry.isOfficial && (
              <Badge variant="divine" size="sm" dot>Official</Badge>
            )}
            {entry.isHomebrew && (
              <Badge variant="arcane" size="sm" dot>Homebrew</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {entry.shortDescription && (
          <p className="text-sm text-slate-300 italic">{entry.shortDescription}</p>
        )}

        {/* Description (collapsible) */}
        <div className="text-sm text-slate-400 leading-relaxed">
          {isExpanded ? (
            <p>{entry.description}</p>
          ) : (
            <p className="line-clamp-3">{entry.description}</p>
          )}
          {entry.description.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-violet-400 hover:text-violet-300 text-xs mt-1 transition-colors"
            >
              {isExpanded ? '▲ menos' : '▼ mais'}
            </button>
          )}
        </div>

        {/* Key Attributes */}
        {entry.attributes.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs border-t border-slate-700/50 pt-3">
            {entry.attributes.slice(0, 6).map((attr) => (
              <div key={attr.key} className="flex flex-col">
                <dt className="text-slate-500 uppercase tracking-wider text-[10px]">
                  {attr.label ?? attr.key}
                </dt>
                <dd className="text-slate-300 font-medium truncate">
                  {Array.isArray(attr.value) ? attr.value.join(', ') : String(attr.value)}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-slate-500 bg-slate-800 rounded px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-700/50 bg-slate-900/30 rounded-b-xl">
        {entry.source && (
          <span className="text-[10px] text-slate-600">
            {entry.source.book}{entry.source.page ? `, p.${entry.source.page}` : ''}
          </span>
        )}
        <div className="flex gap-2 ml-auto">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => onOpenDetail?.(entry)}
          >
            Ver detalhes
          </Button>
          {onDragToSheet && (
            <Button
              size="xs"
              variant="arcane"
              onClick={() => onDragToSheet(entry)}
              title="Adicionar à ficha"
            >
              + Ficha
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
