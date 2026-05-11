import { generateId } from '@vtt/shared-utils';
import {
  createDefaultT20Sheet,
  Tormenta20Calculator,
  T20Attribute,
  T20SkillId,
} from './tormenta20-sheet.types';
import type {
  Tormenta20SheetData,
  T20Power,
  T20Spell,
  T20InventoryItem,
  T20Background,
} from './tormenta20-sheet.types';

// ─── Domain Events ────────────────────────────────────────────────────────────

export interface T20CharacterEvent {
  type: string;
  characterId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

// ─── Character Props ──────────────────────────────────────────────────────────

export interface T20CharacterProps {
  id: string;
  userId: string;
  campaignId: string;
  name: string;
  imageUrl?: string;
  sheet: Tormenta20SheetData;
  linkedTokenId?: string;
  isNPC: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateT20CharacterProps = Omit<
  T20CharacterProps,
  'id' | 'sheet' | 'createdAt' | 'updatedAt'
> & { initialSheet?: Partial<Tormenta20SheetData> };

/**
 * Tormenta20Character
 *
 * Full domain aggregate for a Tormenta20 character.
 * Encapsulates all sheet business logic:
 * - Derived stat calculation
 * - Level up / XP gain
 * - HP / MP modification with bounds checking
 * - Power and spell management
 * - Inventory with weight tracking
 *
 * All mutations are methods that enforce invariants.
 */
export class Tormenta20Character {
  readonly id: string;
  readonly userId: string;
  readonly campaignId: string;
  readonly isNPC: boolean;
  readonly createdAt: Date;

  name: string;
  imageUrl?: string;
  sheet: Tormenta20SheetData;
  linkedTokenId?: string;
  isActive: boolean;
  updatedAt: Date;

  // Domain events accumulated during this transaction
  private readonly _events: T20CharacterEvent[] = [];

  private constructor(props: T20CharacterProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.campaignId = props.campaignId;
    this.name = props.name;
    this.imageUrl = props.imageUrl;
    this.sheet = props.sheet;
    this.linkedTokenId = props.linkedTokenId;
    this.isNPC = props.isNPC;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // ─── Factory ──────────────────────────────────────────────────────────────

  static create(props: CreateT20CharacterProps): Tormenta20Character {
    if (!props.name.trim()) throw new Error('Character name is required');

    const now = new Date();
    const defaultSheet = createDefaultT20Sheet();
    const sheet: Tormenta20SheetData = {
      ...defaultSheet,
      ...props.initialSheet,
      background: { ...defaultSheet.background, ...props.initialSheet?.background },
      attributes: { ...defaultSheet.attributes, ...props.initialSheet?.attributes },
      combat: { ...defaultSheet.combat, ...props.initialSheet?.combat },
    };

    const char = new Tormenta20Character({
      id: generateId(),
      userId: props.userId,
      campaignId: props.campaignId,
      name: props.name.trim(),
      imageUrl: props.imageUrl,
      sheet,
      linkedTokenId: props.linkedTokenId,
      isNPC: props.isNPC,
      isActive: props.isActive,
      createdAt: now,
      updatedAt: now,
    });

    // Recalculate derived stats from initial sheet
    char.recalculateDerivedStats();
    return char;
  }

  static reconstitute(props: T20CharacterProps): Tormenta20Character {
    return new Tormenta20Character(props);
  }

  // ─── Attributes ───────────────────────────────────────────────────────────

  setAttribute(attr: T20Attribute, value: number): void {
    if (value < 1 || value > 30) throw new Error(`Attribute value must be between 1 and 30`);
    this.sheet.attributes[attr] = value;
    this.recalculateDerivedStats();
    this.touch();
  }

  getAttributeModifier(attr: T20Attribute): number {
    return Tormenta20Calculator.attrMod(this.sheet.attributes[attr]);
  }

  // ─── HP / MP ──────────────────────────────────────────────────────────────

  modifyHp(delta: number): void {
    const prev = this.sheet.combat.currentHp;
    this.sheet.combat.currentHp = Math.max(
      0,
      Math.min(this.sheet.combat.maxHp + this.sheet.combat.tempHp, this.sheet.combat.currentHp + delta),
    );

    if (this.sheet.combat.currentHp === 0 && prev > 0) {
      this.addCondition('Inconsciente');
      this.addCondition('Caído');
      this._events.push({
        type: 'character.knocked_out',
        characterId: this.id,
        payload: { previousHp: prev },
        timestamp: new Date(),
      });
    }
    this.touch();
  }

  modifyMp(delta: number): void {
    this.sheet.combat.currentMp = Math.max(
      0,
      Math.min(this.sheet.combat.maxMp, this.sheet.combat.currentMp + delta),
    );
    this.touch();
  }

  heal(amount: number): void {
    const prev = this.sheet.combat.currentHp;
    this.modifyHp(amount);
    // Healing removes Inconsciente if HP > 0
    if (prev === 0 && this.sheet.combat.currentHp > 0) {
      this.removeCondition('Inconsciente');
    }
  }

  fullRest(): void {
    this.sheet.combat.currentHp = this.sheet.combat.maxHp;
    this.sheet.combat.currentMp = this.sheet.combat.maxMp;
    this.sheet.combat.tempHp = 0;
    this.sheet.conditions = [];
    this.touch();
  }

  // ─── Skills ───────────────────────────────────────────────────────────────

  trainSkill(skillId: T20SkillId): void {
    const skill = this.sheet.skills.find((s) => s.id === skillId);
    if (!skill) throw new Error(`Skill ${skillId} not found`);
    skill.trained = true;
    this.touch();
  }

  untrainSkill(skillId: T20SkillId): void {
    const skill = this.sheet.skills.find((s) => s.id === skillId);
    if (skill) skill.trained = false;
    this.touch();
  }

  getSkillTotal(skillId: T20SkillId): number {
    const skill = this.sheet.skills.find((s) => s.id === skillId);
    if (!skill) return 0;
    return Tormenta20Calculator.skillTotal(skill, this.sheet.attributes, this.sheet.background.level);
  }

  // ─── XP / Level ───────────────────────────────────────────────────────────

  gainXp(amount: number): boolean {
    if (amount <= 0) throw new Error('XP gain must be positive');
    this.sheet.background.xp += amount;
    const nextLevelXp = Tormenta20Calculator.xpForLevel(this.sheet.background.level + 1);

    if (this.sheet.background.xp >= nextLevelXp && this.sheet.background.level < 20) {
      this.levelUp();
      return true; // leveled up
    }
    this.touch();
    return false;
  }

  private levelUp(): void {
    const prevLevel = this.sheet.background.level;
    this.sheet.background.level = Math.min(20, this.sheet.background.level + 1);
    this.sheet.background.xpNextLevel = Tormenta20Calculator.xpForLevel(this.sheet.background.level + 1);

    this._events.push({
      type: 'character.level_up',
      characterId: this.id,
      payload: { previousLevel: prevLevel, newLevel: this.sheet.background.level },
      timestamp: new Date(),
    });

    this.recalculateDerivedStats();
    this.touch();
  }

  // ─── Powers ───────────────────────────────────────────────────────────────

  addPower(power: Omit<T20Power, 'id'>): T20Power {
    const newPower: T20Power = { ...power, id: generateId() };
    this.sheet.powers = [...this.sheet.powers, newPower];
    this.touch();
    return newPower;
  }

  removePower(powerId: string): void {
    this.sheet.powers = this.sheet.powers.filter((p) => p.id !== powerId);
    this.touch();
  }

  // ─── Spells ───────────────────────────────────────────────────────────────

  learnSpell(spell: Omit<T20Spell, 'id'>): T20Spell {
    const existing = this.sheet.spells.find(
      (s) => s.name.toLowerCase() === spell.name.toLowerCase(),
    );
    if (existing) throw new Error(`Already knows spell: ${spell.name}`);

    const newSpell: T20Spell = { ...spell, id: generateId() };
    this.sheet.spells = [...this.sheet.spells, newSpell];
    this.touch();
    return newSpell;
  }

  forgetSpell(spellId: string): void {
    this.sheet.spells = this.sheet.spells.filter((s) => s.id !== spellId);
    this.touch();
  }

  getSpellsByCircle(circle: number): T20Spell[] {
    return this.sheet.spells.filter((s) => s.circle === circle);
  }

  // ─── Inventory ────────────────────────────────────────────────────────────

  addItem(item: Omit<T20InventoryItem, 'id'>): T20InventoryItem {
    // Stack check
    const existing = this.sheet.inventory.find(
      (i) => i.name === item.name && !i.equipped,
    );
    if (existing) {
      existing.quantity += item.quantity;
      this.touch();
      return existing;
    }

    const newItem: T20InventoryItem = { ...item, id: generateId() };
    this.sheet.inventory = [...this.sheet.inventory, newItem];
    this.touch();
    return newItem;
  }

  removeItem(itemId: string, quantity = 1): void {
    const item = this.sheet.inventory.find((i) => i.id === itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);

    if (item.quantity <= quantity) {
      this.sheet.inventory = this.sheet.inventory.filter((i) => i.id !== itemId);
    } else {
      item.quantity -= quantity;
    }
    this.touch();
  }

  equipItem(itemId: string): void {
    const item = this.sheet.inventory.find((i) => i.id === itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);
    item.equipped = true;
    this.recalculateDerivedStats();
    this.touch();
  }

  unequipItem(itemId: string): void {
    const item = this.sheet.inventory.find((i) => i.id === itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);
    item.equipped = false;
    this.recalculateDerivedStats();
    this.touch();
  }

  getTotalWeight(): number {
    return this.sheet.inventory.reduce((sum, i) => sum + i.weight * i.quantity, 0);
  }

  // ─── Conditions ───────────────────────────────────────────────────────────

  addCondition(condition: string): void {
    if (!this.sheet.conditions.includes(condition)) {
      this.sheet.conditions = [...this.sheet.conditions, condition];
      this.touch();
    }
  }

  removeCondition(condition: string): void {
    this.sheet.conditions = this.sheet.conditions.filter((c) => c !== condition);
    this.touch();
  }

  // ─── Derived Stats Recalculation ──────────────────────────────────────────

  recalculateDerivedStats(): void {
    const { attributes, background } = this.sheet;
    const level = background.level;

    const strMod = this.getAttributeModifier('strength');
    const dexMod = this.getAttributeModifier('dexterity');
    const conMod = this.getAttributeModifier('constitution');
    const intMod = this.getAttributeModifier('intelligence');
    const wisMod = this.getAttributeModifier('wisdom');
    const chaMod = this.getAttributeModifier('charisma');

    // Calculate equipment bonuses
    const equippedItems = this.sheet.inventory.filter((i) => i.equipped);
    let armorBonus = 0;
    let shieldBonus = 0;
    let attackBonusFromItems = 0;

    for (const item of equippedItems) {
      if (item.bonuses?.defense) {
        if (item.slot === 'offhand') shieldBonus += item.bonuses.defense;
        else armorBonus += item.bonuses.defense;
      }
      if (item.bonuses?.attackBonus) attackBonusFromItems += item.bonuses.attackBonus;
    }

    // Update combat stats
    this.sheet.combat.defense = Tormenta20Calculator.calcDefense(dexMod, armorBonus, shieldBonus);
    this.sheet.combat.initiative = dexMod;
    this.sheet.combat.attackBonus = Math.max(strMod, dexMod) + level + attackBonusFromItems;

    // Recalculate skill totals are lazy (called via getSkillTotal)
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  get level(): number { return this.sheet.background.level; }
  get currentHp(): number { return this.sheet.combat.currentHp; }
  get maxHp(): number { return this.sheet.combat.maxHp; }
  get currentMp(): number { return this.sheet.combat.currentMp; }
  get hpPercentage(): number { return Math.round((this.currentHp / this.maxHp) * 100); }

  consumeEvents(): T20CharacterEvent[] {
    const events = [...this._events];
    this._events.length = 0;
    return events;
  }

  toPlainObject(): T20CharacterProps {
    return {
      id: this.id,
      userId: this.userId,
      campaignId: this.campaignId,
      name: this.name,
      imageUrl: this.imageUrl,
      sheet: this.sheet,
      linkedTokenId: this.linkedTokenId,
      isNPC: this.isNPC,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
