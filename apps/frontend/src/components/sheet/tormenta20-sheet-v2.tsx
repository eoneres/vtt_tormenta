'use client';

import React, { useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface T20Attrs {
  strength: number; dexterity: number; constitution: number;
  intelligence: number; wisdom: number; charisma: number;
}

interface T20Skill { id: string; label: string; attrKey: keyof T20Attrs; trained: boolean; bonus: number; }
interface T20Power  { id: string; name: string; type: string; description?: string; cost?: string; }
interface T20Spell  { id: string; name: string; circle: number; cost: number; description?: string; }
interface T20Item   { id: string; name: string; quantity: number; weight: number; value: number; equipped: boolean; notes?: string; }

export interface T20SheetData {
  // Background
  name: string; race: string; class: string; origin: string;
  level: number; xp: number; xpNext: number;
  // Attributes
  attributes: T20Attrs;
  // Combat
  currentHp: number; maxHp: number; tempHp: number;
  currentMp: number; maxMp: number;
  defense: number; initiative: number; movementM: number;
  // Skills
  skills: T20Skill[];
  // Powers & Spells
  powers: T20Power[];
  spells: T20Spell[];
  // Inventory
  inventory: T20Item[];
  currency: { tibares: number; oros: number; pratas: number; cobres: number };
  // Misc
  conditions: string[];
  notes: string;
}

interface T20SheetProps {
  sheetData: T20SheetData;
  characterId: string;
  canEdit: boolean;
  onUpdate?: (changes: Partial<T20SheetData>) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ATTR_CONFIG: Array<{ key: keyof T20Attrs; abbr: string; color: string }> = [
  { key: 'strength',     abbr: 'FOR', color: 'text-red-400' },
  { key: 'dexterity',    abbr: 'DES', color: 'text-green-400' },
  { key: 'constitution', abbr: 'CON', color: 'text-orange-400' },
  { key: 'intelligence', abbr: 'INT', color: 'text-blue-400' },
  { key: 'wisdom',       abbr: 'SAB', color: 'text-yellow-400' },
  { key: 'charisma',     abbr: 'CAR', color: 'text-pink-400' },
];

const CIRCLE_COLORS = ['', 'bg-blue-900/40', 'bg-violet-900/40', 'bg-red-900/40', 'bg-amber-900/40', 'bg-emerald-900/40'];

function attrMod(value: number): number { return Math.floor((value - 10) / 2); }
function modStr(mod: number): string { return mod >= 0 ? `+${mod}` : String(mod); }

// ─── Sub-sections ──────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2 flex items-center gap-2">
      <span className="flex-1 h-px bg-slate-700/50" />
      {children}
      <span className="flex-1 h-px bg-slate-700/50" />
    </h3>
  );
}

function NumberField({
  label, value, min = 0, max = 999, onChange, small = false,
}: { label: string; value: number; min?: number; max?: number; onChange?: (v: number) => void; small?: boolean }) {
  const size = small ? 'text-base font-bold w-10 h-8' : 'text-2xl font-black w-14 h-12';
  return (
    <div className="flex flex-col items-center gap-0.5">
      <input
        type="number" min={min} max={max} value={value}
        readOnly={!onChange}
        onChange={(e) => onChange?.(parseInt(e.target.value, 10) || 0)}
        className={`${size} bg-slate-800 border border-slate-600 rounded-lg text-center text-slate-100 tabular-nums focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 ${!onChange ? 'cursor-default' : ''}`}
      />
      <span className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function AttributeBlock({ attrKey, abbr, color, value, canEdit, onChange }: {
  attrKey: keyof T20Attrs; abbr: string; color: string; value: number;
  canEdit: boolean; onChange?: (v: number) => void;
}) {
  const mod = attrMod(value);
  return (
    <div className="flex flex-col items-center gap-1 p-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
      <span className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>{abbr}</span>
      <input
        type="number" min={1} max={30} value={value} readOnly={!canEdit}
        onChange={(e) => onChange?.(parseInt(e.target.value, 10) || 10)}
        className="w-10 h-9 bg-slate-900 border border-slate-600 rounded-lg text-center text-sm font-bold text-slate-100 tabular-nums focus:outline-none focus:border-violet-500"
      />
      <span className={`text-lg font-black tabular-nums ${mod >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {modStr(mod)}
      </span>
    </div>
  );
}

function HpMpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  return (
    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Tab definitions ─────────────────────────────────────────────────────────

type Tab = 'combate' | 'periciás' | 'poderes' | 'magias' | 'inventário' | 'notas';
const TABS: Array<{ id: Tab; label: string; emoji: string }> = [
  { id: 'combate', label: 'Combate', emoji: '⚔️' },
  { id: 'periciás', label: 'Perícias', emoji: '🎯' },
  { id: 'poderes', label: 'Poderes', emoji: '💥' },
  { id: 'magias', label: 'Magias', emoji: '✨' },
  { id: 'inventário', label: 'Inventário', emoji: '🎒' },
  { id: 'notas', label: 'Notas', emoji: '📝' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function Tormenta20Sheet({ sheetData: data, characterId, canEdit, onUpdate }: T20SheetProps) {
  const [activeTab, setActiveTab] = useState<Tab>('combate');

  const update = useCallback(<K extends keyof T20SheetData>(key: K, value: T20SheetData[K]) => {
    if (!canEdit) return;
    onUpdate?.({ [key]: value });
  }, [canEdit, onUpdate]);

  const xpPct = Math.round((data.xp / Math.max(1, data.xpNext)) * 100);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 select-none overflow-hidden">

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex-none px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-black text-base text-slate-100 leading-tight truncate">{data.name || 'Sem nome'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {data.race && <span>{data.race} · </span>}
              {data.class && <span className="text-violet-300">{data.class}</span>}
              {data.level > 0 && <span className="text-slate-500"> · Nível {data.level}</span>}
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className="text-[10px] text-slate-500">XP: {data.xp.toLocaleString('pt-BR')}</span>
            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>

        {/* Conditions badges */}
        {data.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.conditions.map((c) => (
              <span key={c} className="text-[10px] px-1.5 py-0.5 bg-red-900/40 text-red-300 border border-red-800/40 rounded">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ─── Attributes Row ───────────────────────────────────────────────── */}
      <div className="flex-none px-2 py-2 border-b border-slate-700/50">
        <div className="grid grid-cols-6 gap-1">
          {ATTR_CONFIG.map(({ key, abbr, color }) => (
            <AttributeBlock
              key={key} attrKey={key} abbr={abbr} color={color}
              value={data.attributes[key]} canEdit={canEdit}
              onChange={(v) => update('attributes', { ...data.attributes, [key]: v })}
            />
          ))}
        </div>
      </div>

      {/* ─── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="flex-none flex overflow-x-auto scrollbar-none border-b border-slate-700/50 bg-slate-900">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* COMBATE */}
        {activeTab === 'combate' && (
          <div className="p-3 space-y-4">
            {/* HP / MP */}
            <div className="grid grid-cols-2 gap-3">
              {/* HP */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">Pontos de Vida</span>
                  <span className="text-[10px] text-emerald-400">HP</span>
                </div>
                <HpMpBar current={data.currentHp} max={data.maxHp}
                  color={data.currentHp / data.maxHp > 0.5 ? 'bg-emerald-500' : data.currentHp / data.maxHp > 0.25 ? 'bg-amber-500' : 'bg-red-500'} />
                <div className="flex items-center justify-center gap-1">
                  {canEdit && <button onClick={() => onUpdate?.({ currentHp: Math.max(0, data.currentHp - 1) })} className="w-6 h-6 rounded bg-red-900/40 text-red-300 hover:bg-red-800/40 text-xs">−</button>}
                  <span className="text-xl font-black text-slate-100 tabular-nums">{data.currentHp}</span>
                  <span className="text-slate-500 text-sm">/ {data.maxHp}</span>
                  {canEdit && <button onClick={() => onUpdate?.({ currentHp: Math.min(data.maxHp, data.currentHp + 1) })} className="w-6 h-6 rounded bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/40 text-xs">+</button>}
                </div>
                {data.tempHp > 0 && (
                  <div className="text-center text-xs text-blue-400">+{data.tempHp} temp</div>
                )}
              </div>

              {/* MP */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">Pontos de Mana</span>
                  <span className="text-[10px] text-blue-400">PM</span>
                </div>
                <HpMpBar current={data.currentMp} max={data.maxMp} color="bg-blue-500" />
                <div className="flex items-center justify-center gap-1">
                  {canEdit && <button onClick={() => onUpdate?.({ currentMp: Math.max(0, data.currentMp - 1) })} className="w-6 h-6 rounded bg-red-900/40 text-red-300 hover:bg-red-800/40 text-xs">−</button>}
                  <span className="text-xl font-black text-slate-100 tabular-nums">{data.currentMp}</span>
                  <span className="text-slate-500 text-sm">/ {data.maxMp}</span>
                  {canEdit && <button onClick={() => onUpdate?.({ currentMp: Math.min(data.maxMp, data.currentMp + 1) })} className="w-6 h-6 rounded bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/40 text-xs">+</button>}
                </div>
              </div>
            </div>

            {/* Combat Stats */}
            <div className="grid grid-cols-4 gap-2">
              <NumberField label="Defesa" value={data.defense} />
              <NumberField label="Iniciativa" value={data.initiative} small />
              <NumberField label="Movimento" value={data.movementM} small />
              <NumberField label="Nível" value={data.level} small />
            </div>
          </div>
        )}

        {/* PERÍCIAS */}
        {activeTab === 'periciás' && (
          <div className="p-2">
            <div className="space-y-0.5">
              {data.skills.map((skill) => {
                const mod = attrMod(data.attributes[skill.attrKey] ?? 10);
                const total = mod + (skill.trained ? 2 : 0) + skill.bonus;
                return (
                  <div key={skill.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800/50 transition-colors group">
                    <button
                      onClick={() => canEdit && onUpdate?.({ skills: data.skills.map((s) => s.id === skill.id ? { ...s, trained: !s.trained } : s) })}
                      className={`w-4 h-4 rounded border shrink-0 transition-colors ${skill.trained ? 'bg-violet-600 border-violet-500' : 'bg-slate-800 border-slate-600 group-hover:border-slate-400'}`}
                      title={skill.trained ? 'Treinado' : 'Não treinado'}
                    />
                    <span className="flex-1 text-xs text-slate-300">{skill.label}</span>
                    <span className="text-[9px] text-slate-600 uppercase w-7 text-center">{skill.attrKey.slice(0, 3).toUpperCase()}</span>
                    <span className={`text-sm font-bold tabular-nums w-8 text-right ${total >= 0 ? 'text-slate-200' : 'text-red-400'}`}>
                      {modStr(total)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PODERES */}
        {activeTab === 'poderes' && (
          <div className="p-3 space-y-2">
            {data.powers.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">Nenhum poder aprendido</div>
            ) : (
              data.powers.map((power) => (
                <div key={power.id} className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{power.name}</p>
                      {power.type && <span className="text-[10px] text-orange-400 uppercase tracking-wide">{power.type}</span>}
                    </div>
                    {power.cost && <span className="text-xs text-blue-300 shrink-0">{power.cost}</span>}
                  </div>
                  {power.description && <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{power.description}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* MAGIAS */}
        {activeTab === 'magias' && (
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4, 5].map((circle) => {
              const spells = data.spells.filter((s) => s.circle === circle);
              if (spells.length === 0) return null;
              return (
                <div key={circle}>
                  <SectionTitle>{circle}º Círculo</SectionTitle>
                  <div className="space-y-1.5">
                    {spells.map((spell) => (
                      <div key={spell.id} className={`rounded-lg border border-slate-700/50 p-2.5 ${CIRCLE_COLORS[circle]}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-200">{spell.name}</span>
                          <span className="text-xs text-blue-300 tabular-nums">{spell.cost} PM</span>
                        </div>
                        {spell.description && <p className="text-xs text-slate-400 mt-1">{spell.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {data.spells.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">Nenhuma magia aprendida</div>
            )}
          </div>
        )}

        {/* INVENTÁRIO */}
        {activeTab === 'inventário' && (
          <div className="p-3 space-y-3">
            {/* Currency */}
            <div className="grid grid-cols-4 gap-2 bg-slate-800/50 rounded-xl border border-slate-700/50 p-3">
              {[
                { key: 'tibares', label: 'TO', color: 'text-amber-400' },
                { key: 'oros',    label: 'PO', color: 'text-yellow-400' },
                { key: 'pratas',  label: 'PP', color: 'text-slate-300' },
                { key: 'cobres',  label: 'PC', color: 'text-orange-700' },
              ].map(({ key, label, color }) => (
                <div key={key} className="flex flex-col items-center gap-0.5">
                  <span className={`text-base font-black tabular-nums ${color}`}>
                    {data.currency[key as keyof typeof data.currency]}
                  </span>
                  <span className="text-[9px] text-slate-500">{label}</span>
                </div>
              ))}
            </div>

            {/* Items */}
            {data.inventory.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">Inventário vazio</div>
            ) : (
              <div className="space-y-1">
                {data.inventory.map((item) => (
                  <div key={item.id} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-colors ${item.equipped ? 'border-violet-600/40 bg-violet-900/10' : 'border-slate-700/40 bg-slate-800/30'}`}>
                    <span className="text-[10px] font-bold text-slate-500 w-5 text-center">{item.quantity}×</span>
                    <span className="flex-1 text-sm text-slate-200 truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-600">{item.weight}kg</span>
                    {item.equipped && <span className="text-[9px] text-violet-400 border border-violet-700/40 px-1 rounded">Equip</span>}
                  </div>
                ))}
                <p className="text-[10px] text-slate-600 text-right pt-1">
                  Carga total: {data.inventory.reduce((s, i) => s + i.weight * i.quantity, 0).toFixed(1)} kg
                </p>
              </div>
            )}
          </div>
        )}

        {/* NOTAS */}
        {activeTab === 'notas' && (
          <div className="p-3 h-full">
            <textarea
              value={data.notes}
              onChange={(e) => canEdit && onUpdate?.({ notes: e.target.value })}
              readOnly={!canEdit}
              placeholder="Anotações, história do personagem, segredos..."
              className="w-full h-full min-h-[200px] bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
            />
          </div>
        )}

      </div>
    </div>
  );
}
