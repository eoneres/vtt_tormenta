'use client';

import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShadowrunSheetData {
  characterName: string;
  playerName: string;
  metatype: string;   // Human, Elf, Dwarf, Ork, Troll
  archetype: string;  // Street Samurai, Decker, Mage, etc.
  ethnicity?: string;
  age?: number;
  gender?: string;
  height?: string;
  weight?: string;
  reputation: number;
  notoriety: number;
  streetCred: number;

  // Core Attributes
  attributes: {
    body: number; agility: number; reaction: number; strength: number;
    willpower: number; logic: number; intuition: number; charisma: number;
    edge: number; magic?: number; resonance?: number;
  };
  currentEdge: number;
  essence: number;

  // Derived
  initiative: number;   // REA + INT
  composure: number;    // WIL + CHA
  judgeIntentions: number;  // INT + CHA
  memory: number;       // LOG + WIL
  liftCarry: number;    // BOD + STR

  // Resources
  currentHP: number;
  physicalDamage: number;   // 0-Physical Monitor
  stunDamage: number;       // 0-Stun Monitor

  nuyen: number;

  // Skills (name -> rating)
  skills: Record<string, { rating: number; specialization?: string }>;

  // Gear
  weapons: Array<{
    name: string; type: string; damage: string;
    ap: number; mode: string; recoil: number;
  }>;
  armor: Array<{ name: string; rating: number; isEquipped: boolean }>;
  augmentations: Array<{ name: string; rating: number; essenceCost: number; type: string }>;
  gear: Array<{ name: string; quantity: number; rating?: number }>;

  // Matrix (for Deckers/Technomancers)
  matrix?: {
    attack: number; sleaze: number; dataProcessing: number; firewall: number;
    currentMatrixHP: number;
    programs: Array<{ name: string; rating: number; isRunning: boolean }>;
  };

  // Qualities
  positiveQualities: Array<{ name: string; karma: number }>;
  negativeQualities: Array<{ name: string; karma: number }>;

  // Contacts
  contacts: Array<{ name: string; type: string; loyalty: number; connection: number }>;

  notes: string;
  backstory: string;
}

interface Props {
  sheetData: ShadowrunSheetData;
  characterId: string;
  canEdit: boolean;
  onUpdate?: (changes: Partial<ShadowrunSheetData>) => void;
  onRollPool?: (pool: number, limit: number | null, label: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const METATYPE_COLORS: Record<string, string> = {
  Human: 'text-slate-300', Elf: 'text-emerald-400',
  Dwarf: 'text-amber-400', Ork: 'text-orange-400', Troll: 'text-red-400',
};

const ATTR_CONFIG: Array<{ key: keyof ShadowrunSheetData['attributes']; label: string; abbr: string; color: string }> = [
  { key: 'body',        label: 'Body',         abbr: 'BOD', color: 'text-red-400' },
  { key: 'agility',     label: 'Agility',      abbr: 'AGI', color: 'text-green-400' },
  { key: 'reaction',    label: 'Reaction',      abbr: 'REA', color: 'text-yellow-400' },
  { key: 'strength',    label: 'Strength',      abbr: 'STR', color: 'text-orange-400' },
  { key: 'willpower',   label: 'Willpower',     abbr: 'WIL', color: 'text-purple-400' },
  { key: 'logic',       label: 'Logic',         abbr: 'LOG', color: 'text-blue-400' },
  { key: 'intuition',   label: 'Intuition',     abbr: 'INT', color: 'text-cyan-400' },
  { key: 'charisma',    label: 'Charisma',      abbr: 'CHA', color: 'text-pink-400' },
  { key: 'edge',        label: 'Edge',          abbr: 'EDG', color: 'text-amber-300' },
  { key: 'magic',       label: 'Magic',         abbr: 'MAG', color: 'text-violet-400' },
  { key: 'resonance',   label: 'Resonance',     abbr: 'RES', color: 'text-teal-400' },
];

const KEY_SKILLS = [
  'Athletics', 'Stealth', 'Firearms', 'Close Combat', 'Piloting',
  'Electronics', 'Engineering', 'Cracking', 'Sorcery', 'Conjuring',
  'Con', 'Intimidation', 'Negotiation', 'Perception', 'First Aid',
];

type Tab = 'attributes' | 'skills' | 'combat' | 'gear' | 'matrix' | 'contacts' | 'notes';

// ─── Sub-components ───────────────────────────────────────────────────────────

function DamageMonitor({ label, current, max, color, onChange }: {
  label: string; current: number; max: number; color: string;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</h4>
        <span className="text-xs text-slate-500">{current}/{max} filled</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange?.(i < current ? i : i + 1)}
            className={clsx(
              'w-5 h-5 rounded border text-xs transition-all',
              i < current
                ? `${color} border-opacity-80`
                : 'bg-slate-700 border-slate-600',
            )}
          />
        ))}
      </div>
    </div>
  );
}

function EdgeTracker({ current, max, onChange }: { current: number; max: number; onChange?: (v: number) => void }) {
  return (
    <div className="bg-amber-950/40 border border-amber-700/40 rounded-xl p-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Edge</h4>
        <span className="text-xs text-amber-500">{current}/{max}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange?.(i < current ? i : i + 1)}
            className={clsx(
              'w-6 h-6 rounded-full border text-xs font-bold transition-all',
              i < current
                ? 'bg-amber-500 border-amber-400 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-500',
            )}
          >⭐</button>
        ))}
      </div>
    </div>
  );
}

function AttrBlock({ attr, value, onRoll }: {
  attr: typeof ATTR_CONFIG[0];
  value: number | undefined;
  onRoll?: () => void;
}) {
  if (value === undefined || value === 0) return null;
  return (
    <button
      onClick={onRoll}
      className="flex flex-col items-center bg-slate-800/60 border border-slate-700 rounded-xl p-2 gap-1 hover:border-slate-500 transition-colors group"
      title={`Roll ${attr.label}`}
    >
      <span className={clsx('text-xs font-bold uppercase tracking-widest', attr.color)}>
        {attr.abbr}
      </span>
      <div className="text-2xl font-bold text-white">{value}</div>
      <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">Roll</span>
    </button>
  );
}

// ─── Main Sheet ───────────────────────────────────────────────────────────────

export default function ShadowrunSheet({ sheetData, characterId, canEdit, onUpdate, onRollPool }: Props) {
  const [tab, setTab] = useState<Tab>('attributes');

  // Physical monitor = 8 + ceil(BOD/2); Stun monitor = 8 + ceil(WIL/2)
  const physMonitor = 8 + Math.ceil((sheetData.attributes.body) / 2);
  const stunMonitor = 8 + Math.ceil((sheetData.attributes.willpower) / 2);

  const handleAttrRoll = useCallback((attr: typeof ATTR_CONFIG[0]) => {
    const val = sheetData.attributes[attr.key] ?? 0;
    if (val > 0) onRollPool?.(val, null, attr.label);
  }, [sheetData.attributes, onRollPool]);

  const handleSkillRoll = useCallback((skillName: string, attrKey: keyof ShadowrunSheetData['attributes']) => {
    const skillRating = sheetData.skills[skillName]?.rating ?? 0;
    const attrVal = sheetData.attributes[attrKey] ?? 0;
    const pool = skillRating + attrVal;
    onRollPool?.(pool, null, `${skillName} (${skillRating}+${attrVal})`);
  }, [sheetData.skills, sheetData.attributes, onRollPool]);

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'attributes', label: 'Attrs' },
    { id: 'skills',     label: 'Skills' },
    { id: 'combat',     label: 'Combat' },
    { id: 'gear',       label: 'Gear' },
    { id: 'matrix',     label: 'Matrix' },
    { id: 'contacts',   label: 'Contacts' },
    { id: 'notes',      label: 'Notes' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-200 text-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-slate-700 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-base text-white">{sheetData.characterName}</h2>
            <p className={clsx('text-xs', METATYPE_COLORS[sheetData.metatype] ?? 'text-slate-400')}>
              {sheetData.metatype} · {sheetData.archetype}
            </p>
          </div>
          <div className="text-right space-y-0.5">
            <div className="flex gap-2 text-xs">
              <span className="text-slate-500">Rep</span>
              <span className="text-green-400 font-mono">{sheetData.reputation}</span>
              <span className="text-slate-500">Not</span>
              <span className="text-red-400 font-mono">{sheetData.notoriety}</span>
            </div>
            <div className="text-xs text-amber-400">
              Essence: <span className="font-mono">{sheetData.essence.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Damage monitors summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/60 rounded-lg px-3 py-1.5 flex justify-between items-center">
            <span className="text-xs text-slate-400">Physical</span>
            <span className={clsx('text-sm font-mono font-bold',
              sheetData.physicalDamage >= physMonitor ? 'text-red-400' :
              sheetData.physicalDamage > physMonitor * 0.6 ? 'text-orange-400' : 'text-slate-200',
            )}>
              {sheetData.physicalDamage}/{physMonitor}
            </span>
          </div>
          <div className="bg-slate-800/60 rounded-lg px-3 py-1.5 flex justify-between items-center">
            <span className="text-xs text-slate-400">Stun</span>
            <span className={clsx('text-sm font-mono font-bold',
              sheetData.stunDamage >= stunMonitor ? 'text-red-400' :
              sheetData.stunDamage > stunMonitor * 0.6 ? 'text-yellow-400' : 'text-slate-200',
            )}>
              {sheetData.stunDamage}/{stunMonitor}
            </span>
          </div>
        </div>

        {/* Edge + Initiative */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: sheetData.attributes.edge }).map((_, i) => (
              <button
                key={i}
                onClick={() => onUpdate?.({ currentEdge: i < sheetData.currentEdge ? i : i + 1 })}
                className={clsx(
                  'w-5 h-5 rounded-full border text-xs transition-all',
                  i < sheetData.currentEdge
                    ? 'bg-amber-500 border-amber-400'
                    : 'bg-slate-700 border-slate-600',
                )}
              />
            ))}
            <span className="text-xs text-amber-400 ml-1">Edge</span>
          </div>
          <div className="ml-auto flex gap-3 text-xs">
            <div className="text-center">
              <div className="text-slate-500">Init</div>
              <div className="font-mono text-white">{sheetData.attributes.reaction + sheetData.attributes.intuition}+1d6</div>
            </div>
            <div className="text-center">
              <div className="text-slate-500">Composure</div>
              <div className="font-mono text-white">{sheetData.attributes.willpower + sheetData.attributes.charisma}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 overflow-x-auto shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors',
              tab === t.id
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-slate-500 hover:text-slate-300',
            )}
          >{t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* ATTRIBUTES */}
        {tab === 'attributes' && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {ATTR_CONFIG.map(attr => (
                <AttrBlock
                  key={attr.key}
                  attr={attr}
                  value={sheetData.attributes[attr.key]}
                  onRoll={() => handleAttrRoll(attr)}
                />
              ))}
            </div>

            {/* Derived stats */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Derived</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {[
                  { label: 'Initiative',       val: `${sheetData.attributes.reaction + sheetData.attributes.intuition} + 1d6` },
                  { label: 'Composure',        val: sheetData.attributes.willpower + sheetData.attributes.charisma },
                  { label: 'Judge Intentions', val: sheetData.attributes.intuition + sheetData.attributes.charisma },
                  { label: 'Memory',           val: sheetData.attributes.logic + sheetData.attributes.willpower },
                  { label: 'Lift/Carry',       val: sheetData.attributes.body + sheetData.attributes.strength },
                  { label: 'Phys. Monitor',    val: physMonitor },
                  { label: 'Stun Monitor',     val: stunMonitor },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-mono text-slate-200">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SKILLS */}
        {tab === 'skills' && (
          <div className="space-y-1">
            {KEY_SKILLS.map(skill => {
              const entry = sheetData.skills[skill];
              if (!entry && !canEdit) return null;
              const rating = entry?.rating ?? 0;
              // Simplified: map key skills to attributes
              const attrMap: Record<string, keyof ShadowrunSheetData['attributes']> = {
                'Athletics': 'agility', 'Stealth': 'agility', 'Firearms': 'agility',
                'Close Combat': 'agility', 'Piloting': 'reaction', 'Electronics': 'logic',
                'Engineering': 'logic', 'Cracking': 'logic', 'Sorcery': 'magic',
                'Conjuring': 'magic', 'Con': 'charisma', 'Intimidation': 'charisma',
                'Negotiation': 'charisma', 'Perception': 'intuition', 'First Aid': 'logic',
              };
              const linkedAttr = attrMap[skill] ?? 'agility';
              const attrVal = sheetData.attributes[linkedAttr] ?? 0;
              const pool = rating + attrVal;

              return (
                <div key={skill} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-slate-800/40">
                  <button
                    onClick={() => handleSkillRoll(skill, linkedAttr)}
                    className="text-green-400 text-xs font-mono w-5 text-right hover:text-green-300"
                    title={`Roll ${pool} dice (${rating} skill + ${attrVal} attr)`}
                  >{pool}</button>
                  <span className="text-slate-300 text-xs flex-1">{skill}</span>
                  {entry?.specialization && (
                    <span className="text-xs text-cyan-400">{entry.specialization} +2</span>
                  )}
                  <span className="text-xs text-slate-500 font-mono">{rating}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* COMBAT */}
        {tab === 'combat' && (
          <div className="space-y-3">
            <DamageMonitor
              label="Physical Damage"
              current={sheetData.physicalDamage}
              max={physMonitor}
              color="bg-red-600 border-red-500"
              onChange={v => onUpdate?.({ physicalDamage: v })}
            />
            <DamageMonitor
              label="Stun Damage"
              current={sheetData.stunDamage}
              max={stunMonitor}
              color="bg-yellow-600 border-yellow-500"
              onChange={v => onUpdate?.({ stunDamage: v })}
            />

            {/* Weapons */}
            {sheetData.weapons.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weapons</h4>
                {sheetData.weapons.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-slate-700/50 last:border-0">
                    <span className="text-slate-200 font-medium flex-1">{w.name}</span>
                    <span className="text-red-400 font-mono">{w.damage}</span>
                    <span className="text-slate-500">AP {w.ap}</span>
                    <span className="text-slate-500">{w.mode}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Armor */}
            {sheetData.armor.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Armor</h4>
                {sheetData.armor.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={clsx('w-2 h-2 rounded-full', a.isEquipped ? 'bg-green-400' : 'bg-slate-600')} />
                    <span className="flex-1 text-slate-300">{a.name}</span>
                    <span className="font-mono text-orange-400">{a.rating}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GEAR */}
        {tab === 'gear' && (
          <div className="space-y-3">
            {/* Augmentations */}
            {sheetData.augmentations.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Augmentations</h4>
                {sheetData.augmentations.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                    <span className="flex-1 text-slate-300">{a.name}</span>
                    <span className="text-slate-500">R{a.rating}</span>
                    <span className="text-amber-400">-{a.essenceCost} ESS</span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between text-xs">
                  <span className="text-slate-500">Total Essence</span>
                  <span className="text-amber-400 font-mono">{sheetData.essence.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* General Gear */}
            {sheetData.gear.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gear</h4>
                {sheetData.gear.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                    <span className="flex-1 text-slate-300">{g.name}</span>
                    {g.rating && <span className="text-slate-500">R{g.rating}</span>}
                    <span className="text-slate-400 font-mono">×{g.quantity}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Nuyen */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 flex justify-between items-center">
              <span className="text-sm text-slate-400">¥ Nuyen</span>
              <span className="font-mono text-green-400 text-lg">¥{sheetData.nuyen.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* MATRIX */}
        {tab === 'matrix' && (
          <div className="space-y-3">
            {!sheetData.matrix ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No matrix stats — not a Decker/Technomancer
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Attack',          val: sheetData.matrix.attack,         color: 'text-red-400' },
                    { label: 'Sleaze',          val: sheetData.matrix.sleaze,          color: 'text-purple-400' },
                    { label: 'Data Processing', val: sheetData.matrix.dataProcessing,  color: 'text-blue-400' },
                    { label: 'Firewall',        val: sheetData.matrix.firewall,         color: 'text-orange-400' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 text-center">
                      <div className={clsx('text-2xl font-bold', color)}>{val}</div>
                      <div className="text-xs text-slate-500">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Programs */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Programs</h4>
                  {sheetData.matrix.programs.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={clsx('w-2 h-2 rounded-full', p.isRunning ? 'bg-blue-400' : 'bg-slate-600')} />
                      <span className="flex-1 text-slate-300">{p.name}</span>
                      <span className="text-slate-500">R{p.rating}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* CONTACTS */}
        {tab === 'contacts' && (
          <div className="space-y-2">
            {sheetData.contacts.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-8">No contacts recorded.</p>
            )}
            {sheetData.contacts.map((c, i) => (
              <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-slate-200 text-sm">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.type}</div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-slate-500">Loyalty</div>
                      <div className="font-mono text-emerald-400">{c.loyalty}/6</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-500">Connection</div>
                      <div className="font-mono text-blue-400">{c.connection}/12</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NOTES */}
        {tab === 'notes' && (
          <div className="space-y-3">
            {/* Qualities */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
              <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Positive Qualities</h4>
              {sheetData.positiveQualities.map((q, i) => (
                <div key={i} className="flex justify-between text-xs py-0.5">
                  <span className="text-slate-300">{q.name}</span>
                  <span className="text-green-400">{q.karma}K</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Negative Qualities</h4>
              {sheetData.negativeQualities.map((q, i) => (
                <div key={i} className="flex justify-between text-xs py-0.5">
                  <span className="text-slate-300">{q.name}</span>
                  <span className="text-red-400">{q.karma}K</span>
                </div>
              ))}
            </div>
            <textarea
              value={sheetData.notes}
              readOnly={!canEdit}
              onChange={e => onUpdate?.({ notes: e.target.value })}
              rows={5}
              placeholder="Notes, run prep, contacts info..."
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 resize-none focus:outline-none focus:border-green-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
