'use client';

import { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { useCreateCharacter } from '@/lib/hooks/use-queries';

// ─── Step definitions ─────────────────────────────────────────────────────────

type Step = 'system' | 'identity' | 'race' | 'class' | 'attributes' | 'review';

const STEPS: Step[] = ['system', 'identity', 'race', 'class', 'attributes', 'review'];
const STEP_LABELS: Record<Step, string> = {
  system: 'Sistema',
  identity: 'Identidade',
  race: 'Raça/Metatipo',
  class: 'Classe',
  attributes: 'Atributos',
  review: 'Revisão',
};

// ─── Race / Class data ────────────────────────────────────────────────────────

const RACES: Record<string, Array<{ id: string; label: string; icon: string; bonus: string }>> = {
  tormenta20: [
    { id: 'humano',    label: 'Humano',    icon: '👤', bonus: '+2 qualquer' },
    { id: 'anão',      label: 'Anão',      icon: '⛏️', bonus: '+2 CON' },
    { id: 'elfo',      label: 'Elfo',      icon: '🌿', bonus: '+2 DES' },
    { id: 'halfling',  label: 'Halfling',  icon: '🍀', bonus: '+2 DES, Sortudo' },
    { id: 'goblin',    label: 'Goblin',    icon: '👺', bonus: '+2 DES, Fuga Astuta' },
    { id: 'minotauro', label: 'Minotauro', icon: '🐂', bonus: '+2 FOR, Grande' },
    { id: 'qareen',    label: 'Qareen',    icon: '💫', bonus: '+2 CAR, Magia Inata' },
    { id: 'lefou',     label: 'Lefou',     icon: '🌀', bonus: '+2 CAR, Mutação' },
    { id: 'sílfide',   label: 'Sílfide',   icon: '🦋', bonus: '+2 DES, Voo' },
    { id: 'dahllan',   label: 'Dahllan',   icon: '🌸', bonus: '+2 SAB, Vegetal' },
    { id: 'suraggel',  label: 'Suraggel',  icon: '✨', bonus: '+2 SAB/CAR' },
    { id: 'osteon',    label: 'Osteon',    icon: '💀', bonus: '+2 CON, Morto-Vivo' },
  ],
  dnd5e: [
    { id: 'human',       label: 'Human',       icon: '👤', bonus: '+1 all' },
    { id: 'dwarf',       label: 'Dwarf',        icon: '⛏️', bonus: '+2 CON' },
    { id: 'elf',         label: 'Elf',          icon: '🌿', bonus: '+2 DEX' },
    { id: 'halfling',    label: 'Halfling',     icon: '🍀', bonus: '+2 DEX, Lucky' },
    { id: 'gnome',       label: 'Gnome',        icon: '🔭', bonus: '+2 INT' },
    { id: 'half-elf',    label: 'Half-Elf',     icon: '🌙', bonus: '+2 CHA, +1×2' },
    { id: 'half-orc',    label: 'Half-Orc',     icon: '💪', bonus: '+2 STR, Savage' },
    { id: 'tiefling',    label: 'Tiefling',     icon: '👿', bonus: '+2 CHA, +1 INT' },
    { id: 'dragonborn',  label: 'Dragonborn',   icon: '🐉', bonus: '+2 STR, +1 CHA' },
  ],
  shadowrun: [
    { id: 'human',   label: 'Human',   icon: '👤', bonus: 'Edge +1' },
    { id: 'elf',     label: 'Elf',     icon: '🌿', bonus: 'AGI +1, CHA +2' },
    { id: 'dwarf',   label: 'Dwarf',   icon: '⛏️', bonus: 'BOD +2, STR +2, WIL +1' },
    { id: 'ork',     label: 'Ork',     icon: '💪', bonus: 'BOD +3, STR +2' },
    { id: 'troll',   label: 'Troll',   icon: '🏔️', bonus: 'BOD +4, STR +4, Armor +1' },
  ],
};

const CLASSES: Record<string, Array<{ id: string; label: string; icon: string; role: string }>> = {
  tormenta20: [
    { id: 'guerreiro',  label: 'Guerreiro',  icon: '⚔️',  role: 'Combate' },
    { id: 'mago',       label: 'Mago',       icon: '🪄',  role: 'Arcano' },
    { id: 'clérigo',    label: 'Clérigo',    icon: '✝️',  role: 'Divino' },
    { id: 'ladino',     label: 'Ladino',     icon: '🗡️',  role: 'Furtivo' },
    { id: 'bárbaro',    label: 'Bárbaro',    icon: '🪓',  role: 'Combate' },
    { id: 'druida',     label: 'Druida',     icon: '🌿',  role: 'Natureza' },
    { id: 'paladino',   label: 'Paladino',   icon: '🛡️',  role: 'Defesa' },
    { id: 'bardo',      label: 'Bardo',      icon: '🎵',  role: 'Suporte' },
    { id: 'arcanista',  label: 'Arcanista',  icon: '💥',  role: 'Arcano' },
    { id: 'caçador',    label: 'Caçador',    icon: '🏹',  role: 'Alcance' },
    { id: 'inventor',   label: 'Inventor',   icon: '⚙️',  role: 'Técnico' },
    { id: 'lutador',    label: 'Lutador',    icon: '👊',  role: 'Combate' },
    { id: 'nobre',      label: 'Nobre',      icon: '👑',  role: 'Lider' },
    { id: 'bucaneiro',  label: 'Bucaneiro',  icon: '⚓',  role: 'Duelista' },
  ],
  dnd5e: [
    { id: 'barbarian',  label: 'Barbarian',  icon: '🪓', role: 'Melee' },
    { id: 'bard',       label: 'Bard',       icon: '🎵', role: 'Support' },
    { id: 'cleric',     label: 'Cleric',     icon: '✝️', role: 'Healer' },
    { id: 'druid',      label: 'Druid',      icon: '🌿', role: 'Nature' },
    { id: 'fighter',    label: 'Fighter',    icon: '⚔️', role: 'Melee' },
    { id: 'monk',       label: 'Monk',       icon: '👊', role: 'Melee' },
    { id: 'paladin',    label: 'Paladin',    icon: '🛡️', role: 'Tank' },
    { id: 'ranger',     label: 'Ranger',     icon: '🏹', role: 'Range' },
    { id: 'rogue',      label: 'Rogue',      icon: '🗡️', role: 'Stealth' },
    { id: 'sorcerer',   label: 'Sorcerer',   icon: '💫', role: 'Arcane' },
    { id: 'warlock',    label: 'Warlock',    icon: '👁️', role: 'Arcane' },
    { id: 'wizard',     label: 'Wizard',     icon: '🪄', role: 'Arcane' },
  ],
  shadowrun: [
    { id: 'street-samurai', label: 'Street Samurai', icon: '⚔️',  role: 'Combat' },
    { id: 'decker',         label: 'Decker',         icon: '💻',  role: 'Matrix' },
    { id: 'mage',           label: 'Mage',           icon: '🪄',  role: 'Magic' },
    { id: 'shaman',         label: 'Shaman',         icon: '🌀',  role: 'Magic' },
    { id: 'rigger',         label: 'Rigger',         icon: '🚗',  role: 'Tech' },
    { id: 'technomancer',   label: 'Technomancer',   icon: '🔮',  role: 'Matrix' },
    { id: 'face',           label: 'Face',           icon: '🎭',  role: 'Social' },
    { id: 'adept',          label: 'Adept',          icon: '🧘',  role: 'Physical' },
  ],
};

const ATTR_DEFAULTS: Record<string, Record<string, number>> = {
  tormenta20: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  dnd5e: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  shadowrun: { body: 3, agility: 3, reaction: 3, strength: 3, willpower: 3, logic: 3, intuition: 3, charisma: 3, edge: 3, essence: 6 },
};

const ATTR_LABELS: Record<string, Array<{ key: string; label: string; abbr: string; min: number; max: number }>> = {
  tormenta20: [
    { key: 'str', label: 'Força',         abbr: 'FOR', min: 8, max: 18 },
    { key: 'dex', label: 'Destreza',      abbr: 'DES', min: 8, max: 18 },
    { key: 'con', label: 'Constituição',  abbr: 'CON', min: 8, max: 18 },
    { key: 'int', label: 'Inteligência',  abbr: 'INT', min: 8, max: 18 },
    { key: 'wis', label: 'Sabedoria',     abbr: 'SAB', min: 8, max: 18 },
    { key: 'cha', label: 'Carisma',       abbr: 'CAR', min: 8, max: 18 },
  ],
  dnd5e: [
    { key: 'str', label: 'Strength',     abbr: 'STR', min: 8, max: 15 },
    { key: 'dex', label: 'Dexterity',    abbr: 'DEX', min: 8, max: 15 },
    { key: 'con', label: 'Constitution', abbr: 'CON', min: 8, max: 15 },
    { key: 'int', label: 'Intelligence', abbr: 'INT', min: 8, max: 15 },
    { key: 'wis', label: 'Wisdom',       abbr: 'WIS', min: 8, max: 15 },
    { key: 'cha', label: 'Charisma',     abbr: 'CHA', min: 8, max: 15 },
  ],
  shadowrun: [
    { key: 'body',      label: 'Body',      abbr: 'BOD', min: 1, max: 6 },
    { key: 'agility',   label: 'Agility',   abbr: 'AGI', min: 1, max: 6 },
    { key: 'reaction',  label: 'Reaction',  abbr: 'REA', min: 1, max: 6 },
    { key: 'strength',  label: 'Strength',  abbr: 'STR', min: 1, max: 6 },
    { key: 'willpower', label: 'Willpower', abbr: 'WIL', min: 1, max: 6 },
    { key: 'logic',     label: 'Logic',     abbr: 'LOG', min: 1, max: 6 },
    { key: 'intuition', label: 'Intuition', abbr: 'INT', min: 1, max: 6 },
    { key: 'charisma',  label: 'Charisma',  abbr: 'CHA', min: 1, max: 6 },
    { key: 'edge',      label: 'Edge',      abbr: 'EDG', min: 1, max: 4 },
  ],
};

const SYSTEM_POINT_BUDGET: Record<string, number> = {
  tormenta20: 10,  // 10 points above base 8 per attr
  dnd5e: 27,       // standard point buy
  shadowrun: 20,   // 20 karma points distributed
};

// ─── Point-buy cost ───────────────────────────────────────────────────────────

const D5E_PB_COST: Record<number, number> = { 8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:7, 15:9 };

function pointBuyCost(system: string, attrs: Record<string, number>): number {
  const base = ATTR_DEFAULTS[system] ?? {};
  if (system === 'dnd5e') {
    return Object.values(attrs).reduce((s, v) => s + (D5E_PB_COST[v] ?? 0), 0);
  }
  return Object.entries(attrs).reduce((s, [k, v]) => s + Math.max(0, v - (base[k] ?? 8)), 0);
}

// ─── Wizard Component ─────────────────────────────────────────────────────────

interface WizardState {
  system: string;
  name: string;
  playerName: string;
  background: string;
  alignment: string;
  race: string;
  classId: string;
  attributes: Record<string, number>;
}

interface Props {
  campaignId: string;
  campaignSystem: string;
  onClose: () => void;
  onCreated: (characterId: string) => void;
}

export default function CharacterWizard({ campaignId, campaignSystem, onClose, onCreated }: Props) {
  const [step, setStep] = useState<Step>('system');
  const [state, setState] = useState<WizardState>({
    system: campaignSystem || 'tormenta20',
    name: '',
    playerName: '',
    background: '',
    alignment: 'Neutro',
    race: '',
    classId: '',
    attributes: { ...ATTR_DEFAULTS[campaignSystem || 'tormenta20'] },
  });
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutateAsync: createCharacter } = useCreateCharacter();

  const stepIdx = STEPS.indexOf(step);

  const pointsUsed = pointBuyCost(state.system, state.attributes);
  const pointBudget = SYSTEM_POINT_BUDGET[state.system] ?? 27;
  const pointsLeft = pointBudget - pointsUsed;

  const update = useCallback((changes: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...changes }));
    setErrors({});
  }, []);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (step === 'identity' && !state.name.trim()) errs.name = 'Nome obrigatório';
    if (step === 'race' && !state.race)     errs.race = 'Selecione uma raça';
    if (step === 'class' && !state.classId) errs.class = 'Selecione uma classe';
    if (step === 'attributes' && pointsLeft < 0) errs.points = 'Pontos excedidos';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [step, state, pointsLeft]);

  const nextStep = useCallback(() => {
    if (!validate()) return;
    const next = STEPS[stepIdx + 1];
    if (next) setStep(next);
  }, [stepIdx, validate]);

  const prevStep = useCallback(() => {
    const prev = STEPS[stepIdx - 1];
    if (prev) setStep(prev);
  }, [stepIdx]);

  const handleCreate = useCallback(async () => {
    if (!validate()) return;
    setCreating(true);
    try {
      const char = await createCharacter({
        campaignId,
        name: state.name,
        systemId: state.system,
        race: state.race,
        classId: state.classId,
        attributes: state.attributes,
        background: state.background,
        alignment: state.alignment,
      });
      onCreated(char.id);
    } catch (err) {
      setErrors({ submit: (err as Error).message });
    } finally {
      setCreating(false);
    }
  }, [campaignId, createCharacter, onCreated, state, validate]);

  const attrLabels = ATTR_LABELS[state.system] ?? ATTR_LABELS.tormenta20;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-white">Criar Personagem</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl w-8 h-8 flex items-center justify-center">×</button>
          </div>
          {/* Step indicators */}
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className={clsx(
                'h-1 rounded-full flex-1 transition-all',
                i < stepIdx ? 'bg-violet-500' : i === stepIdx ? 'bg-violet-400' : 'bg-slate-700',
              )} />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1.5">{STEP_LABELS[step]}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* SYSTEM */}
          {step === 'system' && (
            <div className="space-y-2">
              {[
                { id: 'tormenta20', label: 'Tormenta20',    icon: '🐉', desc: 'O RPG brasileiro definitivo' },
                { id: 'dnd5e',      label: 'D&D 5e',        icon: '⚔️', desc: '5th Edition Dungeons & Dragons' },
                { id: 'shadowrun',  label: 'Shadowrun 6e',  icon: '🤖', desc: 'Cyberpunk meets fantasy' },
              ].map(sys => (
                <button
                  key={sys.id}
                  onClick={() => update({
                    system: sys.id,
                    race: '',
                    classId: '',
                    attributes: { ...ATTR_DEFAULTS[sys.id] },
                  })}
                  className={clsx(
                    'w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
                    state.system === sys.id
                      ? 'bg-violet-900/40 border-violet-600 ring-1 ring-violet-600/40'
                      : 'bg-slate-800/60 border-slate-700 hover:border-slate-500',
                  )}
                >
                  <span className="text-3xl">{sys.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-200">{sys.label}</div>
                    <div className="text-xs text-slate-500">{sys.desc}</div>
                  </div>
                  {state.system === sys.id && <span className="ml-auto text-violet-400 text-lg">✓</span>}
                </button>
              ))}
            </div>
          )}

          {/* IDENTITY */}
          {step === 'identity' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nome do Personagem *
                </label>
                <input
                  type="text"
                  value={state.name}
                  onChange={e => update({ name: e.target.value })}
                  placeholder={state.system === 'shadowrun' ? 'Nome de rua...' : 'Nome do herói...'}
                  className={clsx(
                    'w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 transition-colors',
                    errors.name
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-slate-700 focus:border-violet-500 focus:ring-violet-500/30',
                  )}
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nome do Jogador
                </label>
                <input
                  type="text"
                  value={state.playerName}
                  onChange={e => update({ playerName: e.target.value })}
                  placeholder="Seu nome..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                />
              </div>

              {state.system !== 'shadowrun' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {state.system === 'tormenta20' ? 'Origem' : 'Background'}
                    </label>
                    <input
                      type="text"
                      value={state.background}
                      onChange={e => update({ background: e.target.value })}
                      placeholder={state.system === 'tormenta20' ? 'ex: Soldado, Herói Camponês...' : 'ex: Acolyte, Criminal...'}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Alinhamento
                    </label>
                    <select
                      value={state.alignment}
                      onChange={e => update({ alignment: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
                    >
                      {state.system === 'tormenta20'
                        ? ['Leal e Bom','Neutro e Bom','Caótico e Bom','Leal e Neutro','Neutro','Caótico e Neutro','Leal e Mau','Neutro e Mau','Caótico e Mau'].map(a => <option key={a} value={a}>{a}</option>)
                        : ['Lawful Good','Neutral Good','Chaotic Good','Lawful Neutral','True Neutral','Chaotic Neutral','Lawful Evil','Neutral Evil','Chaotic Evil'].map(a => <option key={a} value={a}>{a}</option>)
                      }
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {/* RACE */}
          {step === 'race' && (
            <div>
              {errors.race && <p className="text-xs text-red-400 mb-2">{errors.race}</p>}
              <div className="grid grid-cols-2 gap-2">
                {(RACES[state.system] ?? []).map(r => (
                  <button
                    key={r.id}
                    onClick={() => update({ race: r.id })}
                    className={clsx(
                      'flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left',
                      state.race === r.id
                        ? 'bg-violet-900/40 border-violet-600'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-500',
                    )}
                  >
                    <span className="text-2xl">{r.icon}</span>
                    <span className="text-sm font-semibold text-slate-200">{r.label}</span>
                    <span className="text-xs text-slate-500">{r.bonus}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CLASS / ARCHETYPE */}
          {step === 'class' && (
            <div>
              {errors.class && <p className="text-xs text-red-400 mb-2">{errors.class}</p>}
              <div className="grid grid-cols-2 gap-2">
                {(CLASSES[state.system] ?? []).map(c => (
                  <button
                    key={c.id}
                    onClick={() => update({ classId: c.id })}
                    className={clsx(
                      'flex items-center gap-2 p-3 rounded-xl border transition-all text-left',
                      state.classId === c.id
                        ? 'bg-violet-900/40 border-violet-600'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-500',
                    )}
                  >
                    <span className="text-xl shrink-0">{c.icon}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-200 truncate">{c.label}</div>
                      <div className="text-xs text-slate-500">{c.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ATTRIBUTES */}
          {step === 'attributes' && (
            <div className="space-y-4">
              <div className={clsx(
                'flex justify-between items-center p-3 rounded-xl text-sm font-semibold border',
                pointsLeft < 0
                  ? 'bg-red-950/40 border-red-700 text-red-400'
                  : pointsLeft === 0
                  ? 'bg-green-950/40 border-green-700 text-green-400'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300',
              )}>
                <span>Pontos restantes</span>
                <span className="text-lg font-bold">{pointsLeft}</span>
              </div>
              {errors.points && <p className="text-xs text-red-400">{errors.points}</p>}

              <div className="space-y-2">
                {attrLabels.map(attr => {
                  const val = state.attributes[attr.key] ?? attr.min;
                  return (
                    <div key={attr.key} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 w-8 shrink-0 uppercase">{attr.abbr}</span>
                      <span className="text-xs text-slate-400 flex-1">{attr.label}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (val > attr.min) update({ attributes: { ...state.attributes, [attr.key]: val - 1 } });
                          }}
                          disabled={val <= attr.min}
                          className="w-7 h-7 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 disabled:opacity-30 transition-colors font-bold"
                        >−</button>
                        <span className={clsx(
                          'w-8 text-center font-mono font-bold text-base',
                          val >= 16 ? 'text-violet-400' : val >= 13 ? 'text-emerald-400' : val <= 9 ? 'text-red-400' : 'text-slate-200',
                        )}>{val}</span>
                        <button
                          onClick={() => {
                            if (val < attr.max && pointsLeft > 0) update({ attributes: { ...state.attributes, [attr.key]: val + 1 } });
                          }}
                          disabled={val >= attr.max || pointsLeft <= 0}
                          className="w-7 h-7 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 disabled:opacity-30 transition-colors font-bold"
                        >+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REVIEW */}
          {step === 'review' && (
            <div className="space-y-3 text-sm">
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-2">
                {[
                  { label: 'Sistema', value: state.system },
                  { label: 'Nome', value: state.name },
                  { label: state.system !== 'shadowrun' ? 'Origem/Background' : 'Jogador', value: state.background || state.playerName || '—' },
                  { label: 'Raça', value: state.race },
                  { label: state.system === 'shadowrun' ? 'Archetype' : 'Classe', value: state.classId },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-slate-200 font-medium">{value || '—'}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Atributos</h4>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                  {attrLabels.map(attr => (
                    <div key={attr.key} className="flex justify-between text-xs">
                      <span className="text-slate-500">{attr.abbr}</span>
                      <span className="font-mono text-slate-200">{state.attributes[attr.key] ?? attr.min}</span>
                    </div>
                  ))}
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-950/40 border border-red-700 rounded-xl p-3 text-xs text-red-400">
                  {errors.submit}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-5 py-4 border-t border-slate-700 flex gap-3">
          <button
            onClick={prevStep}
            disabled={step === 'system'}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 hover:border-slate-500 disabled:opacity-30 transition-colors"
          >← Voltar</button>

          {step !== 'review' ? (
            <button
              onClick={nextStep}
              className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2 rounded-xl text-sm transition-colors"
            >Próximo →</button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={creating}
              className={clsx(
                'flex-1 font-semibold py-2 rounded-xl text-sm transition-all',
                creating
                  ? 'bg-violet-700/50 text-violet-300 cursor-not-allowed'
                  : 'bg-violet-600 hover:bg-violet-500 text-white',
              )}
            >
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span> Criando...
                </span>
              ) : '✓ Criar Personagem'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
