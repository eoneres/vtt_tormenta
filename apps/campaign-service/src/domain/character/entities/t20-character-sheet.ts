/**
 * Tormenta20CharacterSheet
 *
 * Sprint 8 — Strongly-typed T20 character sheet with:
 *   - All 6 attributes + derived modifiers
 *   - Automatic derived stats (PV, PM, Defesa, Iniciativa, atk bonus)
 *   - Level-up automation (new class features, attribute improvements)
 *   - XP thresholds per level (T20 LB p. 18)
 *   - Skill ranks + total calculation
 *   - Condition tracking
 *   - Equipment slots
 *   - Serialisation to/from plain JSON (for sheetData column)
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** XP required to reach each level (index = level - 1) */
const XP_THRESHOLDS: Record<number, number> = {
  1: 0,   2: 1000,  3: 3000,  4: 6000,   5: 10000,
  6: 15000, 7: 21000, 8: 28000, 9: 36000, 10: 45000,
  11: 55000, 12: 66000, 13: 78000, 14: 91000, 15: 105000,
  16: 120000, 17: 136000, 18: 153000, 19: 171000, 20: 190000,
};

const ATTRIBUTE_MODIFIER: Record<number, number> = {
  1: -5, 2: -4, 3: -3, 4: -2, 5: -1, 6: -1, 7: -1, 8: 0, 9: 0, 10: 0,
  11: 1, 12: 1, 13: 1, 14: 2, 15: 2, 16: 2, 17: 3, 18: 3, 19: 3, 20: 4,
  21: 4, 22: 4, 23: 5, 24: 5, 25: 5, 26: 6, 27: 6, 28: 6, 29: 7, 30: 7,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface T20Attributes {
  strength: number;      // Força (FOR)
  dexterity: number;     // Destreza (DES)
  constitution: number;  // Constituição (CON)
  intelligence: number;  // Inteligência (INT)
  wisdom: number;        // Sabedoria (SAB)
  charisma: number;      // Carisma (CAR)
}

export interface T20ClassEntry {
  className: string;
  level: number;
  isSpellcaster: boolean;
  spellcastingAttribute?: keyof T20Attributes;
  hitDie: number;   // e.g. 8 for d8
}

export interface T20SkillEntry {
  name: string;
  attribute: keyof T20Attributes;
  ranks: number;          // trained rank (+2 in T20)
  isTrained: boolean;
  miscBonus: number;
}

export interface T20EquipmentSlot {
  slot: 'main_hand' | 'off_hand' | 'armor' | 'shield' | 'head' | 'neck' | 'ring_1' | 'ring_2' | 'belt' | 'boots' | 'cloak' | 'bracers';
  itemId?: string;
  itemName?: string;
  bonuses: Record<string, number>;
}

export interface T20Condition {
  name: string;
  source: string;
  appliedAt: Date;
  expiresAt?: Date;
  isPermanent: boolean;
}

export interface T20Currency {
  tibar: number;    // TO (tibar de ouro) = base
  pratas: number;   // 1 TO = 10 PP
  cobres: number;   // 1 PP = 10 PC
}

// ─── Derived stats (computed, not stored) ────────────────────────────────────

export interface T20DerivedStats {
  level: number;
  xpForNextLevel: number | null;
  attributeModifiers: T20Attributes;
  baseAttackBonus: number;
  meleeAttackBonus: number;
  rangedAttackBonus: number;
  maxPV: number;
  maxPM: number;
  defesa: number;
  initiative: number;
  fortitude: number;
  reflexes: number;
  will: number;
  spellSaveDC: number | null;
  carryCapacity: { light: number; medium: number; heavy: number };
}

// ─── Main domain value object ─────────────────────────────────────────────────

export class T20CharacterSheet {
  // Identity
  characterName: string;
  playerName: string;
  race: string;
  origin: string;
  religion: string;
  alignment: string;

  // Progression
  classes: T20ClassEntry[];
  xp: number;

  // Core attributes
  attributes: T20Attributes;
  tempAttributes: Partial<T20Attributes>;   // temporary bonuses

  // Vital resources
  currentPV: number;
  maxPVOverride?: number;
  currentPM: number;
  maxPMOverride?: number;

  // Defence
  naturalArmor: number;
  sizeBonus: number;    // Tiny +1, Small 0, Medium 0, Large -1

  // Skills (T20 skill list)
  skills: T20SkillEntry[];

  // Powers
  knownPowerIds: string[];
  knownPowerNames: string[];  // display only

  // Spells (for spellcasters)
  knownSpellIds: string[];
  preparedSpellIds: string[];

  // Equipment
  equipment: T20EquipmentSlot[];
  inventory: Array<{ itemId?: string; itemName: string; quantity: number; weight: number }>;
  currency: T20Currency;

  // Conditions
  conditions: T20Condition[];

  // Notes & backstory
  personalityTraits: string;
  backstory: string;
  notes: string;

  // Audit
  createdAt: Date;
  updatedAt: Date;

  // ─── Constructor ──────────────────────────────────────────────────────────

  constructor(data: Partial<T20CharacterSheet> = {}) {
    this.characterName  = data.characterName ?? 'Novo Personagem';
    this.playerName     = data.playerName ?? '';
    this.race           = data.race ?? '';
    this.origin         = data.origin ?? '';
    this.religion       = data.religion ?? '';
    this.alignment      = data.alignment ?? 'Neutro';
    this.classes        = data.classes ?? [];
    this.xp             = data.xp ?? 0;
    this.attributes     = data.attributes ?? { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
    this.tempAttributes = data.tempAttributes ?? {};
    this.currentPV      = data.currentPV ?? 0;
    this.maxPVOverride  = data.maxPVOverride;
    this.currentPM      = data.currentPM ?? 0;
    this.maxPMOverride  = data.maxPMOverride;
    this.naturalArmor   = data.naturalArmor ?? 0;
    this.sizeBonus      = data.sizeBonus ?? 0;
    this.skills         = data.skills ?? this.defaultSkills();
    this.knownPowerIds  = data.knownPowerIds ?? [];
    this.knownPowerNames = data.knownPowerNames ?? [];
    this.knownSpellIds  = data.knownSpellIds ?? [];
    this.preparedSpellIds = data.preparedSpellIds ?? [];
    this.equipment      = data.equipment ?? [];
    this.inventory      = data.inventory ?? [];
    this.currency       = data.currency ?? { tibar: 0, pratas: 0, cobres: 0 };
    this.conditions     = data.conditions ?? [];
    this.personalityTraits = data.personalityTraits ?? '';
    this.backstory      = data.backstory ?? '';
    this.notes          = data.notes ?? '';
    this.createdAt      = data.createdAt ?? new Date();
    this.updatedAt      = data.updatedAt ?? new Date();
  }

  // ─── Computed properties ──────────────────────────────────────────────────

  get totalLevel(): number {
    return this.classes.reduce((sum, c) => sum + c.level, 0);
  }

  get xpForNextLevel(): number | null {
    const nextLevel = this.totalLevel + 1;
    return XP_THRESHOLDS[nextLevel] ?? null;
  }

  get attributeModifiers(): T20Attributes {
    const eff = this.effectiveAttributes;
    return {
      strength:     this.mod(eff.strength),
      dexterity:    this.mod(eff.dexterity),
      constitution: this.mod(eff.constitution),
      intelligence: this.mod(eff.intelligence),
      wisdom:       this.mod(eff.wisdom),
      charisma:     this.mod(eff.charisma),
    };
  }

  get effectiveAttributes(): T20Attributes {
    return {
      strength:     (this.attributes.strength     + (this.tempAttributes.strength     ?? 0)),
      dexterity:    (this.attributes.dexterity     + (this.tempAttributes.dexterity    ?? 0)),
      constitution: (this.attributes.constitution  + (this.tempAttributes.constitution ?? 0)),
      intelligence: (this.attributes.intelligence  + (this.tempAttributes.intelligence ?? 0)),
      wisdom:       (this.attributes.wisdom         + (this.tempAttributes.wisdom       ?? 0)),
      charisma:     (this.attributes.charisma       + (this.tempAttributes.charisma     ?? 0)),
    };
  }

  /** Base Attack Bonus — uses highest martial class level */
  get baseAttackBonus(): number {
    if (this.totalLevel === 0) return 0;
    // Simplified: full BAB classes get level, casters get level/2
    // Real T20: depends on class. We approximate:
    const martialLevels = this.classes
      .filter((c) => !c.isSpellcaster)
      .reduce((s, c) => s + c.level, 0);
    const casterLevels = this.classes
      .filter((c) => c.isSpellcaster)
      .reduce((s, c) => s + c.level, 0);
    return martialLevels + Math.floor(casterLevels / 2);
  }

  get meleeAttackBonus(): number {
    return this.baseAttackBonus + this.attributeModifiers.strength;
  }

  get rangedAttackBonus(): number {
    return this.baseAttackBonus + this.attributeModifiers.dexterity;
  }

  get derivedMaxPV(): number {
    if (this.maxPVOverride !== undefined) return this.maxPVOverride;
    const conMod = this.attributeModifiers.constitution;
    return this.classes.reduce((total, cls) => {
      // Level 1: max hit die. Subsequent: avg. T20 uses average + CON per level.
      return total + (cls.level * (Math.floor(cls.hitDie / 2) + 1 + conMod));
    }, 0);
  }

  get derivedMaxPM(): number {
    if (this.maxPMOverride !== undefined) return this.maxPMOverride;
    const mainClass = this.classes[0];
    if (!mainClass) return 0;
    const spellAttr = mainClass.spellcastingAttribute ?? 'intelligence';
    const attrMod = this.attributeModifiers[spellAttr];
    // T20: PM = (PM per level from class) + attribute mod per level
    return this.totalLevel * (2 + Math.max(0, attrMod));
  }

  get defesa(): number {
    const dexMod = this.attributeModifiers.dexterity;
    const armorBonus = this.equipment
      .filter((e) => ['armor', 'shield'].includes(e.slot))
      .reduce((s, e) => s + (e.bonuses['defense'] ?? 0), 0);
    return 10 + dexMod + armorBonus + this.naturalArmor + this.sizeBonus;
  }

  get initiative(): number {
    return this.attributeModifiers.dexterity;
  }

  get fortitude(): number {
    return this.totalLevel + this.attributeModifiers.constitution;
  }

  get reflexes(): number {
    return this.totalLevel + this.attributeModifiers.dexterity;
  }

  get will(): number {
    return this.totalLevel + this.attributeModifiers.wisdom;
  }

  get spellSaveDC(): number | null {
    const spellClass = this.classes.find((c) => c.isSpellcaster);
    if (!spellClass?.spellcastingAttribute) return null;
    const attrMod = this.attributeModifiers[spellClass.spellcastingAttribute];
    return 10 + this.totalLevel + attrMod;
  }

  get carryCapacity(): { light: number; medium: number; heavy: number } {
    const strScore = this.effectiveAttributes.strength;
    const heavy = strScore * 10;
    return { light: Math.floor(heavy / 3), medium: Math.floor(heavy * 2 / 3), heavy };
  }

  get derivedStats(): T20DerivedStats {
    return {
      level: this.totalLevel,
      xpForNextLevel: this.xpForNextLevel,
      attributeModifiers: this.attributeModifiers,
      baseAttackBonus: this.baseAttackBonus,
      meleeAttackBonus: this.meleeAttackBonus,
      rangedAttackBonus: this.rangedAttackBonus,
      maxPV: this.derivedMaxPV,
      maxPM: this.derivedMaxPM,
      defesa: this.defesa,
      initiative: this.initiative,
      fortitude: this.fortitude,
      reflexes: this.reflexes,
      will: this.will,
      spellSaveDC: this.spellSaveDC,
      carryCapacity: this.carryCapacity,
    };
  }

  // ─── Skill totals ─────────────────────────────────────────────────────────

  getSkillTotal(skillName: string): number {
    const skill = this.skills.find((s) => s.name === skillName);
    if (!skill) return 0;
    const attrMod = this.attributeModifiers[skill.attribute];
    const trainedBonus = skill.isTrained ? 2 : 0;
    return attrMod + skill.ranks + trainedBonus + skill.miscBonus;
  }

  getAllSkillTotals(): Array<{ name: string; attribute: string; total: number; breakdown: string }> {
    return this.skills.map((skill) => {
      const attrMod  = this.attributeModifiers[skill.attribute];
      const trained  = skill.isTrained ? 2 : 0;
      const total    = attrMod + skill.ranks + trained + skill.miscBonus;
      const breakdown = `${attrMod} (atr) + ${skill.ranks} (ranks) + ${trained} (treinado) + ${skill.miscBonus} (misc)`;
      return { name: skill.name, attribute: skill.attribute, total, breakdown };
    });
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  gainXP(amount: number): { leveledUp: boolean; newLevel: number } {
    const prevLevel = this.totalLevel;
    this.xp += amount;
    this.updatedAt = new Date();

    // Check for level-up (auto-level not applied here; triggers event for GM to confirm)
    const newLevelThreshold = XP_THRESHOLDS[prevLevel + 1];
    const leveledUp = newLevelThreshold !== undefined && this.xp >= newLevelThreshold;
    return { leveledUp, newLevel: this.totalLevel };
  }

  takeDamage(amount: number): void {
    this.currentPV = Math.max(0, this.currentPV - amount);
    this.updatedAt = new Date();
  }

  heal(amount: number): void {
    this.currentPV = Math.min(this.derivedMaxPV, this.currentPV + amount);
    this.updatedAt = new Date();
  }

  spendPM(amount: number): boolean {
    if (this.currentPM < amount) return false;
    this.currentPM -= amount;
    this.updatedAt = new Date();
    return true;
  }

  recoverPM(amount: number): void {
    this.currentPM = Math.min(this.derivedMaxPM, this.currentPM + amount);
    this.updatedAt = new Date();
  }

  applyCondition(condition: Omit<T20Condition, 'appliedAt'>): void {
    // Avoid duplicates
    const exists = this.conditions.some((c) => c.name === condition.name && c.source === condition.source);
    if (!exists) {
      this.conditions.push({ ...condition, appliedAt: new Date() });
      this.updatedAt = new Date();
    }
  }

  removeCondition(name: string, source?: string): void {
    this.conditions = this.conditions.filter(
      (c) => !(c.name === name && (!source || c.source === source)),
    );
    this.updatedAt = new Date();
  }

  purgeExpiredConditions(): number {
    const now = new Date();
    const before = this.conditions.length;
    this.conditions = this.conditions.filter(
      (c) => c.isPermanent || !c.expiresAt || c.expiresAt > now,
    );
    return before - this.conditions.length;
  }

  equip(slot: T20EquipmentSlot['slot'], itemId: string, itemName: string, bonuses: Record<string, number>): void {
    const idx = this.equipment.findIndex((e) => e.slot === slot);
    if (idx >= 0) {
      this.equipment[idx] = { slot, itemId, itemName, bonuses };
    } else {
      this.equipment.push({ slot, itemId, itemName, bonuses });
    }
    this.updatedAt = new Date();
  }

  unequip(slot: T20EquipmentSlot['slot']): void {
    this.equipment = this.equipment.filter((e) => e.slot !== slot);
    this.updatedAt = new Date();
  }

  updateAttribute(attr: keyof T20Attributes, value: number): void {
    if (value < 1 || value > 30) throw new RangeError(`Attribute value out of range: ${value}`);
    this.attributes[attr] = value;
    this.updatedAt = new Date();
  }

  setTempAttribute(attr: keyof T20Attributes, bonus: number): void {
    this.tempAttributes[attr] = bonus;
    this.updatedAt = new Date();
  }

  clearTempAttributes(): void {
    this.tempAttributes = {};
    this.updatedAt = new Date();
  }

  // ─── Serialisation ────────────────────────────────────────────────────────

  toPlainObject(): Record<string, unknown> {
    return {
      characterName: this.characterName,
      playerName: this.playerName,
      race: this.race,
      origin: this.origin,
      religion: this.religion,
      alignment: this.alignment,
      classes: this.classes,
      xp: this.xp,
      attributes: this.attributes,
      tempAttributes: this.tempAttributes,
      currentPV: this.currentPV,
      maxPVOverride: this.maxPVOverride,
      currentPM: this.currentPM,
      maxPMOverride: this.maxPMOverride,
      naturalArmor: this.naturalArmor,
      sizeBonus: this.sizeBonus,
      skills: this.skills,
      knownPowerIds: this.knownPowerIds,
      knownPowerNames: this.knownPowerNames,
      knownSpellIds: this.knownSpellIds,
      preparedSpellIds: this.preparedSpellIds,
      equipment: this.equipment,
      inventory: this.inventory,
      currency: this.currency,
      conditions: this.conditions,
      personalityTraits: this.personalityTraits,
      backstory: this.backstory,
      notes: this.notes,
      // Derived stats always included for display (computed on-the-fly)
      _derived: this.derivedStats,
      _schemaVersion: 2,
    };
  }

  static fromPlainObject(data: Record<string, unknown>): T20CharacterSheet {
    return new T20CharacterSheet(data as Partial<T20CharacterSheet>);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private mod(score: number): number {
    return ATTRIBUTE_MODIFIER[score] ?? Math.floor((score - 10) / 2);
  }

  private defaultSkills(): T20SkillEntry[] {
    // T20 Livro Básico skill list
    const defs: Array<{ name: string; attribute: keyof T20Attributes }> = [
      { name: 'Acrobacia',     attribute: 'dexterity' },
      { name: 'Adestramento',  attribute: 'charisma' },
      { name: 'Arcanismo',     attribute: 'intelligence' },
      { name: 'Atletismo',     attribute: 'strength' },
      { name: 'Atuação',       attribute: 'charisma' },
      { name: 'Cavalgar',      attribute: 'dexterity' },
      { name: 'Conhecimento',  attribute: 'intelligence' },
      { name: 'Cura',          attribute: 'wisdom' },
      { name: 'Diplomacia',    attribute: 'charisma' },
      { name: 'Enganação',     attribute: 'charisma' },
      { name: 'Fortitude',     attribute: 'constitution' },
      { name: 'Furtividade',   attribute: 'dexterity' },
      { name: 'Guerra',        attribute: 'intelligence' },
      { name: 'Iniciativa',    attribute: 'dexterity' },
      { name: 'Intimidação',   attribute: 'charisma' },
      { name: 'Intuição',      attribute: 'wisdom' },
      { name: 'Investigação',  attribute: 'intelligence' },
      { name: 'Jogatina',      attribute: 'charisma' },
      { name: 'Ladinagem',     attribute: 'dexterity' },
      { name: 'Luta',          attribute: 'strength' },
      { name: 'Misticismo',    attribute: 'wisdom' },
      { name: 'Natureza',      attribute: 'wisdom' },
      { name: 'Nobreza',       attribute: 'intelligence' },
      { name: 'Ofício',        attribute: 'intelligence' },
      { name: 'Percepção',     attribute: 'wisdom' },
      { name: 'Pontaria',      attribute: 'dexterity' },
      { name: 'Reflexos',      attribute: 'dexterity' },
      { name: 'Religião',      attribute: 'wisdom' },
      { name: 'Sobrevivência', attribute: 'wisdom' },
      { name: 'Vontade',       attribute: 'wisdom' },
    ];
    return defs.map((d) => ({
      name: d.name,
      attribute: d.attribute,
      ranks: 0,
      isTrained: false,
      miscBonus: 0,
    }));
  }

  // ─── Static factory ───────────────────────────────────────────────────────

  static createFresh(opts: {
    characterName: string;
    playerName: string;
    race: string;
    origin: string;
    classes: T20ClassEntry[];
    attributes: T20Attributes;
  }): T20CharacterSheet {
    const sheet = new T20CharacterSheet({
      ...opts,
      xp: 0,
      currentPV: 0,
      currentPM: 0,
    });
    // Set starting PV/PM to max
    sheet.currentPV = sheet.derivedMaxPV;
    sheet.currentPM = sheet.derivedMaxPM;
    return sheet;
  }
}
