'use client';

import { useTableStore } from '@/lib/store/table.store';
import { COMMANDS } from '@/lib/colyseus/commands';
import { clsx } from 'clsx';

const ABILITIES = [
  { id: 'strength', abbr: 'STR' },
  { id: 'dexterity', abbr: 'DEX' },
  { id: 'constitution', abbr: 'CON' },
  { id: 'intelligence', abbr: 'INT' },
  { id: 'wisdom', abbr: 'WIS' },
  { id: 'charisma', abbr: 'CHA' },
] as const;

const SKILLS_5E = [
  { name: 'Acrobatics', ability: 'dexterity' },
  { name: 'Animal Handling', ability: 'wisdom' },
  { name: 'Arcana', ability: 'intelligence' },
  { name: 'Athletics', ability: 'strength' },
  { name: 'Deception', ability: 'charisma' },
  { name: 'History', ability: 'intelligence' },
  { name: 'Insight', ability: 'wisdom' },
  { name: 'Intimidation', ability: 'charisma' },
  { name: 'Investigation', ability: 'intelligence' },
  { name: 'Medicine', ability: 'wisdom' },
  { name: 'Nature', ability: 'intelligence' },
  { name: 'Perception', ability: 'wisdom' },
  { name: 'Performance', ability: 'charisma' },
  { name: 'Persuasion', ability: 'charisma' },
  { name: 'Religion', ability: 'intelligence' },
  { name: 'Sleight of Hand', ability: 'dexterity' },
  { name: 'Stealth', ability: 'dexterity' },
  { name: 'Survival', ability: 'wisdom' },
];

function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

function modStr(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function profBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

interface SheetData5e {
  name?: string;
  level?: number;
  class?: string;
  race?: string;
  background?: string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  hp?: number;
  hpMax?: number;
  hpTemp?: number;
  ac?: number;
  speed?: number;
  initiative?: number;
  proficiencies?: Record<string, boolean>;
  expertise?: Record<string, boolean>;
  savingThrows?: Record<string, boolean>;
  spellSlots?: Record<string, { used: number; max: number }>;
  deathSaves?: { successes: number; failures: number };
  [key: string]: unknown;
}

interface Props {
  characterId: string;
  sheetData: SheetData5e;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function DnD5eSheet({ characterId, sheetData, onUpdate }: Props) {
  const { client } = useTableStore();
  const level = sheetData.level ?? 1;
  const pb = profBonus(level);

  const roll = (notation: string, label: string, advantage?: boolean) => {
    const finalNotation = advantage === true
      ? `2d20kh1${notation.replace('1d20', '')}`
      : advantage === false
        ? `2d20kl1${notation.replace('1d20', '')}`
        : notation;
    client?.send({ type: COMMANDS.ROLL_DICE, notation: finalNotation, label, characterId });
  };

  const rollAbility = (abilityId: string, score: number, adv?: boolean) => {
    const mod = abilityMod(score);
    roll(`1d20${modStr(mod)}`, abilityId.toUpperCase(), adv);
  };

  const rollSave = (abilityId: string, score: number) => {
    const mod = abilityMod(score);
    const proficient = sheetData.savingThrows?.[abilityId] ?? false;
    const total = mod + (proficient ? pb : 0);
    roll(`1d20${modStr(total)}`, `${abilityId.toUpperCase()} Save`);
  };

  const rollSkill = (skillName: string, abilityId: string) => {
    const score = (sheetData[abilityId] as number) ?? 10;
    const mod = abilityMod(score);
    const key = skillName.toLowerCase().replace(/\s/g, '_');
    const proficient = sheetData.proficiencies?.[key] ?? false;
    const expert = sheetData.expertise?.[key] ?? false;
    const total = mod + (expert ? pb * 2 : proficient ? pb : 0);
    roll(`1d20${modStr(total)}`, skillName);
  };

  const updateField = (field: string, value: unknown) =>
    onUpdate({ ...sheetData, [field]: value });

  return (
    <div className="space-y-4 text-sm">
      {/* Header */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className="text-vtt-muted text-xs">Character Name</label>
          <input
            className="input-field text-sm py-1"
            value={sheetData.name ?? ''}
            onChange={(e) => updateField('name', e.target.value)}
          />
        </div>
        <div>
          <label className="text-vtt-muted text-xs">Level</label>
          <input
            type="number" min={1} max={20}
            className="input-field text-sm py-1"
            value={level}
            onChange={(e) => updateField('level', parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Combat Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'HP', cur: 'hp', max: 'hpMax', color: 'text-vtt-success' },
          { label: 'AC', cur: 'ac', max: null, color: 'text-vtt-warning' },
          { label: 'Speed', cur: 'speed', max: null, color: 'text-vtt-text' },
          { label: 'Prof', cur: null, max: null, color: 'text-vtt-accent', static: `+${pb}` },
        ].map(({ label, cur, max, color, static: staticVal }) => (
          <div key={label} className="card text-center py-2">
            <div className={clsx('text-lg font-bold', color)}>
              {staticVal ?? (
                <>
                  <input
                    type="number"
                    className="w-10 bg-transparent text-center font-bold focus:outline-none"
                    value={(sheetData[cur!] as number) ?? 0}
                    onChange={(e) => updateField(cur!, parseInt(e.target.value))}
                  />
                  {max && (
                    <>
                      <span className="text-vtt-muted text-xs">/</span>
                      <input
                        type="number"
                        className="w-10 bg-transparent text-center text-vtt-muted text-xs focus:outline-none"
                        value={(sheetData[max] as number) ?? 0}
                        onChange={(e) => updateField(max, parseInt(e.target.value))}
                      />
                    </>
                  )}
                </>
              )}
            </div>
            <div className="text-vtt-muted text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Ability Scores */}
      <div>
        <h4 className="text-vtt-muted text-xs font-semibold uppercase tracking-wider mb-2">
          Ability Scores
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {ABILITIES.map(({ id, abbr }) => {
            const score = (sheetData[id] as number) ?? 10;
            const mod = abilityMod(score);
            return (
              <div key={id} className="card text-center py-2">
                <div className="text-vtt-muted text-xs mb-1">{abbr}</div>
                <input
                  type="number" min={1} max={30}
                  className="w-10 bg-transparent text-center text-vtt-text font-semibold focus:outline-none"
                  value={score}
                  onChange={(e) => updateField(id, parseInt(e.target.value))}
                />
                <div className="flex gap-1 justify-center mt-1">
                  <button
                    onClick={() => rollAbility(id, score)}
                    className="text-vtt-accent font-mono text-xs hover:underline"
                    title="Roll"
                  >
                    {modStr(mod)}
                  </button>
                  <button
                    onClick={() => rollSave(id, score)}
                    className="text-vtt-muted text-xs hover:text-vtt-text"
                    title="Saving throw"
                  >
                    S
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="text-vtt-muted text-xs font-semibold uppercase tracking-wider mb-2">
          Skills
        </h4>
        <div className="space-y-0.5">
          {SKILLS_5E.map(({ name, ability }) => {
            const score = (sheetData[ability] as number) ?? 10;
            const mod = abilityMod(score);
            const key = name.toLowerCase().replace(/\s/g, '_');
            const proficient = sheetData.proficiencies?.[key] ?? false;
            const expert = sheetData.expertise?.[key] ?? false;
            const total = mod + (expert ? pb * 2 : proficient ? pb : 0);
            return (
              <button
                key={name}
                onClick={() => rollSkill(name, ability)}
                className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-vtt-surface transition-colors text-left"
              >
                <span
                  className={clsx(
                    'w-2 h-2 rounded-full shrink-0',
                    expert ? 'bg-vtt-warning' : proficient ? 'bg-vtt-accent' : 'bg-vtt-border',
                  )}
                />
                <span className="flex-1 text-vtt-text text-xs">{name}</span>
                <span className="text-vtt-muted text-xs">
                  {ability.slice(0, 3).toUpperCase()}
                </span>
                <span className="text-vtt-accent font-mono text-xs font-semibold w-8 text-right">
                  {modStr(total)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spell Slots */}
      <div>
        <h4 className="text-vtt-muted text-xs font-semibold uppercase tracking-wider mb-2">
          Spell Slots
        </h4>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
            const slot = sheetData.spellSlots?.[`level_${lvl}`] ?? { used: 0, max: 0 };
            if (slot.max === 0) return null;
            return (
              <div key={lvl} className="card text-center py-1">
                <div className="text-vtt-text font-mono text-sm">
                  {slot.max - slot.used}/{slot.max}
                </div>
                <div className="text-vtt-muted text-xs">Lv {lvl}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
