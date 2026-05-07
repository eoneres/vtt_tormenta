'use client';

import { useTableStore } from '@/lib/store/table.store';
import { COMMANDS } from '@/lib/colyseus/commands';
import { clsx } from 'clsx';

// T20 attribute abbreviations
const ATTRIBUTES = [
  { id: 'forca', abbr: 'FOR' },
  { id: 'destreza', abbr: 'DES' },
  { id: 'constituicao', abbr: 'CON' },
  { id: 'inteligencia', abbr: 'INT' },
  { id: 'sabedoria', abbr: 'SAB' },
  { id: 'carisma', abbr: 'CAR' },
] as const;

const SKILLS_T20 = [
  'Acrobacia', 'Adestramento', 'Atletismo', 'Atuação', 'Cavalgar',
  'Conhecimento', 'Cura', 'Diplomacia', 'Enganação', 'Fortitude',
  'Furtividade', 'Iniciativa', 'Intimidação', 'Intuição', 'Investigação',
  'Ladinagem', 'Luta', 'Misticismo', 'Percepção', 'Pontaria',
  'Reflexos', 'Religião', 'Sobrevivência', 'Vontade',
];

function attrMod(value: number): number {
  return Math.floor((value - 10) / 2);
}

function modStr(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

interface SheetData {
  name?: string;
  level?: number;
  race?: string;
  class?: string;
  forca?: number;
  destreza?: number;
  constituicao?: number;
  inteligencia?: number;
  sabedoria?: number;
  carisma?: number;
  pv?: number;
  pvMax?: number;
  pm?: number;
  pmMax?: number;
  defesa?: number;
  skills?: Record<string, { total: number; trained: boolean }>;
  [key: string]: unknown;
}

interface Props {
  characterId: string;
  sheetData: SheetData;
  systemId: string;
  onUpdate: (data: Record<string, unknown>) => void;
}

export function Tormenta20Sheet({ characterId, sheetData, onUpdate }: Props) {
  const { client } = useTableStore();

  const rollSkill = (skillName: string, mod: number) => {
    client?.send({
      type: COMMANDS.ROLL_DICE,
      notation: `1d20${modStr(mod)}`,
      label: skillName,
      characterId,
    });
  };

  const rollAttr = (attrId: string, value: number) => {
    const mod = attrMod(value);
    client?.send({
      type: COMMANDS.ROLL_DICE,
      notation: `1d20${modStr(mod)}`,
      label: attrId.toUpperCase(),
      characterId,
    });
  };

  const updateField = (field: string, value: unknown) => {
    onUpdate({ ...sheetData, [field]: value });
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Header */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-vtt-muted text-xs">Nome</label>
          <input
            className="input-field text-sm py-1"
            value={sheetData.name ?? ''}
            onChange={(e) => updateField('name', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-vtt-muted text-xs">Nível</label>
            <input
              type="number"
              min={1}
              max={20}
              className="input-field text-sm py-1"
              value={sheetData.level ?? 1}
              onChange={(e) => updateField('level', parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="text-vtt-muted text-xs">Classe</label>
            <input
              className="input-field text-sm py-1"
              value={sheetData.class ?? ''}
              onChange={(e) => updateField('class', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'PV', cur: 'pv', max: 'pvMax', color: 'text-vtt-success' },
          { label: 'PM', cur: 'pm', max: 'pmMax', color: 'text-vtt-accent' },
          { label: 'DEF', cur: 'defesa', max: null, color: 'text-vtt-warning' },
        ].map(({ label, cur, max, color }) => (
          <div key={label} className="card text-center py-2">
            <div className={clsx('text-lg font-bold', color)}>
              <input
                type="number"
                className="w-12 bg-transparent text-center font-bold focus:outline-none"
                value={(sheetData[cur] as number) ?? 0}
                onChange={(e) => updateField(cur, parseInt(e.target.value))}
              />
              {max && (
                <>
                  <span className="text-vtt-muted text-sm">/</span>
                  <input
                    type="number"
                    className="w-12 bg-transparent text-center text-vtt-muted text-sm focus:outline-none"
                    value={(sheetData[max] as number) ?? 0}
                    onChange={(e) => updateField(max, parseInt(e.target.value))}
                  />
                </>
              )}
            </div>
            <div className="text-vtt-muted text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Attributes */}
      <div>
        <h4 className="text-vtt-muted text-xs font-semibold uppercase tracking-wider mb-2">
          Atributos
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {ATTRIBUTES.map(({ id, abbr }) => {
            const value = (sheetData[id] as number) ?? 10;
            const mod = attrMod(value);
            return (
              <button
                key={id}
                onClick={() => rollAttr(id, value)}
                className="card text-center py-2 hover:border-vtt-accent/50 transition-colors cursor-pointer"
                title={`Rolar ${abbr}`}
              >
                <div className="text-vtt-accent font-bold">{modStr(mod)}</div>
                <div className="text-vtt-text font-semibold">{value}</div>
                <div className="text-vtt-muted text-xs">{abbr}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="text-vtt-muted text-xs font-semibold uppercase tracking-wider mb-2">
          Perícias
        </h4>
        <div className="space-y-0.5">
          {SKILLS_T20.map((skill) => {
            const key = skill.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '_');
            const skillData = sheetData.skills?.[key];
            const total = skillData?.total ?? 0;
            const trained = skillData?.trained ?? false;
            return (
              <button
                key={skill}
                onClick={() => rollSkill(skill, total)}
                className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-vtt-surface transition-colors text-left"
              >
                <span
                  className={clsx(
                    'w-2 h-2 rounded-full shrink-0',
                    trained ? 'bg-vtt-accent' : 'bg-vtt-border',
                  )}
                />
                <span className="flex-1 text-vtt-text text-xs">{skill}</span>
                <span className="text-vtt-accent font-mono text-xs font-semibold">
                  {modStr(total)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
