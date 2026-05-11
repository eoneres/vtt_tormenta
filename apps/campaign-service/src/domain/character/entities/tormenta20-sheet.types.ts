import { generateId } from '@vtt/shared-utils';

// ─── Tormenta20 Attribute Types ───────────────────────────────────────────────

export type T20Attribute = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

export const T20_ATTRIBUTE_LABELS: Record<T20Attribute, string> = {
  strength:     'Força',
  dexterity:    'Destreza',
  constitution: 'Constituição',
  intelligence: 'Inteligência',
  wisdom:       'Sabedoria',
  charisma:     'Carisma',
};

export interface T20Attributes {
  strength:     number;
  dexterity:    number;
  constitution: number;
  intelligence: number;
  wisdom:       number;
  charisma:     number;
}

// ─── Skills ──────────────────────────────────────────────────────────────────

export type T20SkillId =
  | 'acrobatics' | 'animals' | 'athletics' | 'crafting' | 'deception'
  | 'diplomacy' | 'fortitude' | 'healing' | 'history' | 'initiative'
  | 'intimidation' | 'investigation' | 'lore' | 'nature' | 'perception'
  | 'performance' | 'piloting' | 'reflexes' | 'religion' | 'stealth'
  | 'survival' | 'thievery' | 'will';

export const T20_SKILL_ATTRIBUTE: Record<T20SkillId, T20Attribute> = {
  acrobatics:    'dexterity',
  animals:       'charisma',
  athletics:     'strength',
  crafting:      'intelligence',
  deception:     'charisma',
  diplomacy:     'charisma',
  fortitude:     'constitution',
  healing:       'wisdom',
  history:       'intelligence',
  initiative:    'dexterity',
  intimidation:  'charisma',
  investigation: 'intelligence',
  lore:          'intelligence',
  nature:        'wisdom',
  perception:    'wisdom',
  performance:   'charisma',
  piloting:      'dexterity',
  reflexes:      'dexterity',
  religion:      'wisdom',
  stealth:       'dexterity',
  survival:      'wisdom',
  thievery:      'dexterity',
  will:          'wisdom',
};

export interface T20Skill {
  id: T20SkillId;
  trained: boolean;
  extraBonus: number;      // from items, feats, etc.
  hasExpertise: boolean;   // doubles proficiency bonus
}

// ─── Combat stats ─────────────────────────────────────────────────────────────

export interface T20CombatStats {
  maxHp: number;
  currentHp: number;
  tempHp: number;
  maxMp: number;           // Pontos de Mana
  currentMp: number;
  defense: number;         // CA / Defesa
  initiative: number;
  movementM: number;       // meters
  attackBonus: number;     // extra bonus beyond attribute+level
}

// ─── Powers ──────────────────────────────────────────────────────────────────

export interface T20Power {
  id: string;
  compendiumId?: string;    // links to CompendiumEntry
  name: string;
  type: 'combat' | 'destiny' | 'race' | 'class' | 'magic' | 'general';
  description?: string;
  cost?: string;            // e.g. "2 PM", "ação padrão"
  source?: string;          // class or race that granted it
}

// ─── Spells ──────────────────────────────────────────────────────────────────

export interface T20Spell {
  id: string;
  compendiumId?: string;
  name: string;
  circle: number;           // 1-5
  school?: string;          // Evocação, Ilusão, etc.
  cost: number;             // PM cost
  description?: string;
  isPrepared?: boolean;     // for cleric/druid style preparation
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export type ItemSlot =
  | 'head' | 'neck' | 'body' | 'hands' | 'feet' | 'ring1' | 'ring2'
  | 'mainhand' | 'offhand' | 'ranged' | 'backpack';

export interface T20InventoryItem {
  id: string;
  compendiumId?: string;
  name: string;
  quantity: number;
  weight: number;           // kg
  value: number;            // tibares
  equipped: boolean;
  slot?: ItemSlot;
  notes?: string;
  bonuses?: {               // attribute/skill/defense bonuses
    attribute?: Partial<T20Attributes>;
    defense?: number;
    skills?: Partial<Record<T20SkillId, number>>;
    attackBonus?: number;
    damageDice?: string;
  };
}

// ─── Character Background ─────────────────────────────────────────────────────

export interface T20Background {
  race: string;
  raceId?: string;
  class: string;
  classId?: string;
  subclass?: string;
  origin: string;
  originId?: string;
  level: number;
  xp: number;
  xpNextLevel: number;
  alignment?: string;
  divinity?: string;
  age?: number;
  height?: string;
  weight?: string;
  backstory?: string;
  appearance?: string;
}

// ─── Full Sheet ───────────────────────────────────────────────────────────────

export interface Tormenta20SheetData {
  background: T20Background;
  attributes: T20Attributes;
  skills: T20Skill[];
  combat: T20CombatStats;
  powers: T20Power[];
  spells: T20Spell[];
  inventory: T20InventoryItem[];
  currency: {
    tibares: number;
    oros: number;
    pratas: number;
    cobres: number;
  };
  conditions: string[];
  notes: string;
}

// ─── Derived Stats Calculator ─────────────────────────────────────────────────

export class Tormenta20Calculator {
  /**
   * Calculate attribute modifier: (value - 10) / 2, rounded down
   */
  static attrMod(value: number): number {
    return Math.floor((value - 10) / 2);
  }

  /**
   * Proficiency bonus: +2 at levels 1-5, +4 at 6-10, +6 at 11-15, +8 at 16-20
   */
  static profBonus(level: number): number {
    if (level <= 5) return 2;
    if (level <= 10) return 4;
    if (level <= 15) return 6;
    return 8;
  }

  /**
   * Skill total: attribute modifier + (trained ? proficiency : 0) + extra
   */
  static skillTotal(skill: T20Skill, attrs: T20Attributes, level: number): number {
    const attrKey = T20_SKILL_ATTRIBUTE[skill.id];
    const attrValue = attrs[attrKey] ?? 10;
    const mod = this.attrMod(attrValue);
    const prof = skill.trained
      ? (skill.hasExpertise ? this.profBonus(level) * 2 : this.profBonus(level))
      : 0;
    return mod + prof + skill.extraBonus;
  }

  /**
   * Maximum HP: class die average + Constitution modifier per level
   */
  static calcMaxHp(classHd: number, conMod: number, level: number): number {
    // Level 1: max die value; subsequent: average + con mod per level
    const level1 = classHd;
    const perLevel = Math.floor(classHd / 2) + 1 + conMod;
    return level1 + perLevel * (level - 1);
  }

  /**
   * Defense (Defesa): 10 + Dexterity modifier + armor bonus + shield bonus
   */
  static calcDefense(dexMod: number, armorBonus: number, shieldBonus: number): number {
    return 10 + dexMod + armorBonus + shieldBonus;
  }

  /**
   * Mana Pool (PM): class-specific formula
   * Simplified: 2 + level * classMultiplier + (Int + Wis + Cha) mods
   */
  static calcMaxMp(level: number, classMultiplier: number, attrMods: number): number {
    return 2 + level * classMultiplier + attrMods;
  }

  /**
   * XP thresholds for Tormenta20
   */
  static xpForLevel(level: number): number {
    const thresholds = [0, 0, 1000, 3000, 6000, 10000, 15000, 21000, 28000, 36000,
                        45000, 55000, 66000, 78000, 91000, 105000, 120000, 136000, 153000, 171000, 190000];
    return thresholds[level] ?? 0;
  }
}

// ─── Default Sheet Factory ────────────────────────────────────────────────────

export function createDefaultT20Sheet(): Tormenta20SheetData {
  const defaultSkills: T20Skill[] = (Object.keys(T20_SKILL_ATTRIBUTE) as T20SkillId[]).map(
    (id) => ({ id, trained: false, extraBonus: 0, hasExpertise: false }),
  );

  return {
    background: {
      race: '',
      class: '',
      origin: '',
      level: 1,
      xp: 0,
      xpNextLevel: Tormenta20Calculator.xpForLevel(2),
    },
    attributes: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    skills: defaultSkills,
    combat: {
      maxHp: 8,
      currentHp: 8,
      tempHp: 0,
      maxMp: 2,
      currentMp: 2,
      defense: 10,
      initiative: 0,
      movementM: 9,
      attackBonus: 0,
    },
    powers: [],
    spells: [],
    inventory: [],
    currency: { tibares: 0, oros: 0, pratas: 0, cobres: 0 },
    conditions: [],
    notes: '',
  };
}
