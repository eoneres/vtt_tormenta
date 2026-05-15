/**
 * D&D 5e Character Sheet Value Object
 *
 * Implementa todas as mecânicas de D&D 5e incluindo:
 * - Atributos (STR, DEX, CON, INT, WIS, CHA)
 * - Modificadores derivados
 * - 18 Perícias com proficiência
 * - Saving Throws
 * - Class Features
 * - Spell Casting
 * - Hit Dice and HP
 * - Proficiências de arma/armadura
 */

export interface D20Attribute {
  value: number; // 3-18
  modifier: number; // derivado automaticamente
}

export interface D20SkillProficiency {
  name: string;
  ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
  isProficient: boolean;
  bonus: number; // derivado
}

export interface D20SavingThrow {
  ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
  isProficient: boolean;
  bonus: number; // derivado
}

export interface D20SpellSlot {
  level: number; // 1-9
  total: number;
  used: number;
}

export interface D20ClassFeature {
  name: string;
  level: number;
  description: string;
  active: boolean;
}

export interface D20CharacterSheetData {
  // Identidade
  name: string;
  class: string;
  race: string;
  background: string;
  level: number;
  experience: number;
  alignment: string;

  // Atributos Base (3-18)
  attributes: {
    strength: D20Attribute;
    dexterity: D20Attribute;
    constitution: D20Attribute;
    intelligence: D20Attribute;
    wisdom: D20Attribute;
    charisma: D20Attribute;
  };

  // Combate
  proficiencyBonus: number; // +2 nível 1, +3 nível 5, etc
  armor: string;
  armorClass: number;
  initiative: number;
  speed: number; // em pés
  hitDice: string; // Ex: 5d8
  hitPoints: { current: number; maximum: number };
  temporaryHitPoints: number;

  // Perícias (18 em D&D 5e)
  skills: D20SkillProficiency[];

  // Saving Throws
  savingThrows: D20SavingThrow[];

  // Magia
  spellcasting: {
    ability: 'INT' | 'WIS' | 'CHA';
    spellSaveDC: number;
    spellAttackBonus: number;
    slots: D20SpellSlot[];
    cantrips: string[];
    spells: { level: number; name: string; prepared?: boolean }[];
  };

  // Class Features & Traits
  features: D20ClassFeature[];
  traits: string[];
  languages: string[];
  proficiencies: string[];

  // Inventário & Equipamento
  equipment: { slot: string; name: string; equipped: boolean }[];
  coins: { platinum: number; gold: number; silver: number; copper: number };
  weight: number; // em libras

  // Outros
  notes: string;
  backstory: string;
  personality: string;
  ideals: string;
  bonds: string;
  flaws: string;
  _schemaVersion: number;
}

export class D5eCharacterSheet {
  private data: D20CharacterSheetData;

  private constructor(data: D20CharacterSheetData) {
    this.data = data;
  }

  // ─── Factory Methods ────────────────────────────────────────────────────────

  static create(input: Partial<D20CharacterSheetData>): D5eCharacterSheet {
    const data: D20CharacterSheetData = {
      name: input.name || 'Novo Personagem',
      class: input.class || 'Barbarian',
      race: input.race || 'Human',
      background: input.background || 'Soldier',
      level: input.level || 1,
      experience: input.experience || 0,
      alignment: input.alignment || 'Neutral',

      attributes: {
        strength: { value: input.attributes?.strength?.value || 10, modifier: 0 },
        dexterity: { value: input.attributes?.dexterity?.value || 10, modifier: 0 },
        constitution: { value: input.attributes?.constitution?.value || 10, modifier: 0 },
        intelligence: { value: input.attributes?.intelligence?.value || 10, modifier: 0 },
        wisdom: { value: input.attributes?.wisdom?.value || 10, modifier: 0 },
        charisma: { value: input.attributes?.charisma?.value || 10, modifier: 0 },
      },

      proficiencyBonus: D5eCharacterSheet.calculateProficiencyBonus(input.level || 1),
      armor: input.armor || 'None',
      armorClass: 10,
      initiative: 0,
      speed: 30, // pés padrão
      hitDice: `${input.level || 1}d8`,
      hitPoints: { current: 8, maximum: 8 },
      temporaryHitPoints: 0,

      skills: D5eCharacterSheet.initializeSkills(),
      savingThrows: D5eCharacterSheet.initializeSavingThrows(),

      spellcasting: {
        ability: 'INT',
        spellSaveDC: 0,
        spellAttackBonus: 0,
        slots: [],
        cantrips: [],
        spells: [],
      },

      features: [],
      traits: [],
      languages: ['Common'],
      proficiencies: [],

      equipment: [],
      coins: { platinum: 0, gold: 0, silver: 0, copper: 0 },
      weight: 0,

      notes: '',
      backstory: '',
      personality: '',
      ideals: '',
      bonds: '',
      flaws: '',
      _schemaVersion: 1,
    };

    // Recalcular tudo
    const instance = new D5eCharacterSheet(data);
    instance.recalculateDerivedStats();

    return instance;
  }

  static fromPlainObject(obj: any): D5eCharacterSheet {
    return new D5eCharacterSheet(obj as D20CharacterSheetData);
  }

  // ─── Recálculos Automáticos ────────────────────────────────────────────────

  private recalculateDerivedStats(): void {
    // 1. Calcular modificadores de atributos
    Object.keys(this.data.attributes).forEach((key) => {
      const attr = this.data.attributes[key as keyof typeof this.data.attributes];
      attr.modifier = Math.floor((attr.value - 10) / 2);
    });

    // 2. Atualizar proficiência por nível
    this.data.proficiencyBonus = D5eCharacterSheet.calculateProficiencyBonus(this.data.level);

    // 3. Recalcular perícias (usa modificadores dos atributos)
    this.updateSkillBonuses();

    // 4. Recalcular saving throws
    this.updateSavingThrowBonuses();

    // 5. Recalcular AC
    this.updateArmorClass();

    // 6. Recalcular HP máximo (baseado em CON e classe)
    this.updateHitPoints();

    // 7. Recalcular iniciativa
    this.data.initiative = this.data.attributes.dexterity.modifier;

    // 8. Recalcular spell DC e attack bonus
    this.updateSpellcasting();
  }

  private updateSkillBonuses(): void {
    this.data.skills.forEach((skill) => {
      const attrKey = skill.ability.toLowerCase() as keyof typeof this.data.attributes;
      const attrModifier = this.data.attributes[attrKey].modifier;
      skill.bonus = attrModifier + (skill.isProficient ? this.data.proficiencyBonus : 0);
    });
  }

  private updateSavingThrowBonuses(): void {
    this.data.savingThrows.forEach((save) => {
      const attrKey = save.ability.toLowerCase() as keyof typeof this.data.attributes;
      const attrModifier = this.data.attributes[attrKey].modifier;
      save.bonus = attrModifier + (save.isProficient ? this.data.proficiencyBonus : 0);
    });
  }

  private updateArmorClass(): void {
    // AC = 10 + DEX modifier (sem armadura)
    // AC com armadura depende do tipo (varia por equipamento)
    this.data.armorClass = 10 + this.data.attributes.dexterity.modifier;

    // TODO: Aplicar AC de armadura equipada
    // TODO: Aplicar AC de escudo
  }

  private updateHitPoints(): void {
    const conModifier = this.data.attributes.constitution.modifier;
    const hpPerLevel = this.getHitDiceSize();

    // HP = (hit die + CON mod) * nível, mínimo 1 PV por nível
    const hpPerLevelTotal = Math.max(1, hpPerLevel + conModifier);
    const maxHP = hpPerLevelTotal * this.data.level;

    this.data.hitPoints.maximum = Math.max(1, maxHP);
    if (this.data.hitPoints.current > this.data.hitPoints.maximum) {
      this.data.hitPoints.current = this.data.hitPoints.maximum;
    }
  }

  private updateSpellcasting(): void {
    const ability = this.data.spellcasting.ability;
    const abilityKey = ability.toLowerCase() as keyof typeof this.data.attributes;
    const abilityModifier = this.data.attributes[abilityKey].modifier;

    this.data.spellcasting.spellSaveDC = 8 + this.data.proficiencyBonus + abilityModifier;
    this.data.spellcasting.spellAttackBonus = this.data.proficiencyBonus + abilityModifier;
  }

  // ─── Métodos Públicos ──────────────────────────────────────────────────────

  getAttribute(name: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'): D20Attribute {
    const key = `${name.toLowerCase()}` as keyof typeof this.data.attributes;
    return this.data.attributes[key];
  }

  setAttribute(name: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA', value: number): void {
    if (value < 1 || value > 20) throw new Error('Atributo deve estar entre 1-20');
    const key = `${name.toLowerCase()}` as keyof typeof this.data.attributes;
    this.data.attributes[key].value = value;
    this.recalculateDerivedStats();
  }

  damage(amount: number, type: string = 'regular'): void {
    this.data.hitPoints.current = Math.max(0, this.data.hitPoints.current - amount);
  }

  heal(amount: number): void {
    this.data.hitPoints.current = Math.min(this.data.hitPoints.maximum, this.data.hitPoints.current + amount);
  }

  addTemporaryHitPoints(amount: number): void {
    this.data.temporaryHitPoints = Math.max(this.data.temporaryHitPoints, amount);
  }

  levelUp(): void {
    this.data.level++;
    this.data.experience = 0;

    // Recalcular proficiência e HP
    this.recalculateDerivedStats();
  }

    grantExperience(amount: number): void {
    this.data.experience += amount;

    // Verificar level-up (D&D 5e: 300 XP per level)
    const requiredXP = this.data.level * 1000;
    if (this.data.experience >= requiredXP) {
      this.levelUp();
    }
  }

  spendSpellSlot(level: number): void {
    const slot = this.data.spellcasting.slots.find((s) => s.level === level);
    if (!slot) throw new Error(`Nenhum slot de magia nível ${level} disponível`);
    if (slot.used >= slot.total) throw new Error(`Nenhum slot de magia nível ${level} disponível`);
    slot.used++;
  }

  addSkillProficiency(skillName: string): void {
    const skill = this.data.skills.find((s) => s.name === skillName);
    if (skill) {
      skill.isProficient = true;
      this.updateSkillBonuses();
    }
  }

  getSerialized(): D20CharacterSheetData {
    return JSON.parse(JSON.stringify(this.data));
  }

  // ─── Helpers Privados ──────────────────────────────────────────────────────

  private static calculateProficiencyBonus(level: number): number {
    if (level <= 4) return 2;
    if (level <= 8) return 3;
    if (level <= 12) return 4;
    if (level <= 16) return 5;
    return 6;
  }

  private getHitDiceSize(): number {
    // Variar por classe: Barbarian 12, Fighter 10, Rogue 8, Wizard 6, etc
    // Por agora, padrão é 8
    return 8;
  }

  private static initializeSkills(): D20SkillProficiency[] {
    return [
      { name: 'Acrobatics', ability: 'DEX', isProficient: false, bonus: 0 },
      { name: 'Animal Handling', ability: 'WIS', isProficient: false, bonus: 0 },
      { name: 'Arcana', ability: 'INT', isProficient: false, bonus: 0 },
      { name: 'Athletics', ability: 'STR', isProficient: false, bonus: 0 },
      { name: 'Deception', ability: 'CHA', isProficient: false, bonus: 0 },
      { name: 'History', ability: 'INT', isProficient: false, bonus: 0 },
      { name: 'Insight', ability: 'WIS', isProficient: false, bonus: 0 },
      { name: 'Intimidation', ability: 'CHA', isProficient: false, bonus: 0 },
      { name: 'Investigation', ability: 'INT', isProficient: false, bonus: 0 },
      { name: 'Medicine', ability: 'WIS', isProficient: false, bonus: 0 },
      { name: 'Nature', ability: 'INT', isProficient: false, bonus: 0 },
      { name: 'Perception', ability: 'WIS', isProficient: false, bonus: 0 },
      { name: 'Performance', ability: 'CHA', isProficient: false, bonus: 0 },
      { name: 'Persuasion', ability: 'CHA', isProficient: false, bonus: 0 },
      { name: 'Religion', ability: 'INT', isProficient: false, bonus: 0 },
      { name: 'Sleight of Hand', ability: 'DEX', isProficient: false, bonus: 0 },
      { name: 'Stealth', ability: 'DEX', isProficient: false, bonus: 0 },
      { name: 'Survival', ability: 'WIS', isProficient: false, bonus: 0 },
    ];
  }

  private static initializeSavingThrows(): D20SavingThrow[] {
    return [
      { ability: 'STR', isProficient: false, bonus: 0 },
      { ability: 'DEX', isProficient: false, bonus: 0 },
      { ability: 'CON', isProficient: false, bonus: 0 },
      { ability: 'INT', isProficient: false, bonus: 0 },
      { ability: 'WIS', isProficient: false, bonus: 0 },
      { ability: 'CHA', isProficient: false, bonus: 0 },
    ];
  }
}
