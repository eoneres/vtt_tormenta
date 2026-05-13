/**
 * Unit Tests — T20CharacterSheet domain value object
 *
 * Tests cover:
 *   - Attribute modifiers
 *   - Derived stats (PV, PM, Defesa, saves, BAB)
 *   - Skill totals
 *   - Damage / healing
 *   - PM spending
 *   - XP / level-up detection
 *   - Conditions (apply, remove, expire)
 *   - Equipment bonuses (defense stack)
 *   - Serialisation round-trip
 */

import {
  T20CharacterSheet,
  type T20ClassEntry,
  type T20Attributes,
} from '../../src/domain/character/entities/t20-character-sheet';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const guerreiroClass: T20ClassEntry = {
  className: 'Guerreiro',
  level: 5,
  isSpellcaster: false,
  hitDie: 10,
};

const magoClass: T20ClassEntry = {
  className: 'Mago',
  level: 3,
  isSpellcaster: true,
  spellcastingAttribute: 'intelligence',
  hitDie: 4,
};

const standardAttributes: T20Attributes = {
  strength:     16,   // mod +3
  dexterity:    14,   // mod +2
  constitution: 14,   // mod +2
  intelligence: 12,   // mod +1
  wisdom:       10,   // mod 0
  charisma:     8,    // mod -1 (actually 0 in T20)
};

function makeGuerreiro(): T20CharacterSheet {
  return T20CharacterSheet.createFresh({
    characterName: 'Thorin',
    playerName:   'Player1',
    race:         'Anão',
    origin:       'Soldado',
    classes:      [guerreiroClass],
    attributes:   standardAttributes,
  });
}

function makeMulticlass(): T20CharacterSheet {
  return T20CharacterSheet.createFresh({
    characterName: 'Marduk',
    playerName:   'Player2',
    race:         'Humano',
    origin:       'Estudante',
    classes:      [guerreiroClass, magoClass],
    attributes:   standardAttributes,
  });
}

// ─── Attribute Modifiers ──────────────────────────────────────────────────────

describe('T20CharacterSheet — Attribute Modifiers', () => {
  it('computes modifiers correctly for standard array', () => {
    const sheet = makeGuerreiro();
    const mods = sheet.attributeModifiers;
    expect(mods.strength).toBe(3);
    expect(mods.dexterity).toBe(2);
    expect(mods.constitution).toBe(2);
    expect(mods.intelligence).toBe(1);
    expect(mods.wisdom).toBe(0);
  });

  it('applies temp attribute bonuses to effective attributes', () => {
    const sheet = makeGuerreiro();
    sheet.setTempAttribute('strength', 4);  // Fúria Bárbara
    expect(sheet.effectiveAttributes.strength).toBe(20);
    expect(sheet.attributeModifiers.strength).toBe(4);
  });

  it('clears temp attributes', () => {
    const sheet = makeGuerreiro();
    sheet.setTempAttribute('strength', 4);
    sheet.clearTempAttributes();
    expect(sheet.effectiveAttributes.strength).toBe(16);
  });

  it('throws RangeError for out-of-range attribute values', () => {
    const sheet = makeGuerreiro();
    expect(() => sheet.updateAttribute('strength', 0)).toThrow(RangeError);
    expect(() => sheet.updateAttribute('strength', 31)).toThrow(RangeError);
  });
});

// ─── Derived Stats ────────────────────────────────────────────────────────────

describe('T20CharacterSheet — Derived Stats', () => {
  it('total level matches sum of class levels', () => {
    const single = makeGuerreiro();
    expect(single.totalLevel).toBe(5);

    const multi = makeMulticlass();
    expect(multi.totalLevel).toBe(8);
  });

  it('BAB for pure martial class = level', () => {
    const sheet = makeGuerreiro();
    expect(sheet.baseAttackBonus).toBe(5);
  });

  it('BAB for multiclass = martial + floor(caster/2)', () => {
    const sheet = makeMulticlass();
    expect(sheet.baseAttackBonus).toBe(5 + Math.floor(3 / 2));  // 6
  });

  it('melee attack bonus = BAB + STR mod', () => {
    const sheet = makeGuerreiro();
    expect(sheet.meleeAttackBonus).toBe(sheet.baseAttackBonus + 3);
  });

  it('ranged attack bonus = BAB + DEX mod', () => {
    const sheet = makeGuerreiro();
    expect(sheet.rangedAttackBonus).toBe(sheet.baseAttackBonus + 2);
  });

  it('derive maxPV includes CON mod', () => {
    const sheet = makeGuerreiro();
    const expectedPV = guerreiroClass.level * (Math.floor(guerreiroClass.hitDie / 2) + 1 + 2);
    expect(sheet.derivedMaxPV).toBe(expectedPV);
  });

  it('maxPVOverride bypasses calculation', () => {
    const sheet = makeGuerreiro();
    sheet.maxPVOverride = 100;
    expect(sheet.derivedMaxPV).toBe(100);
  });

  it('defesa = 10 + DEX + armor/shield bonuses', () => {
    const sheet = makeGuerreiro();
    // No armor equipped: defesa = 10 + 2 = 12
    expect(sheet.defesa).toBe(12);

    // Equip cota de malha (+4)
    sheet.equip('armor', 'item-1', 'Cota de Malha', { defense: 4 });
    expect(sheet.defesa).toBe(16);

    // Add shield (+2)
    sheet.equip('shield', 'item-2', 'Escudo', { defense: 2 });
    expect(sheet.defesa).toBe(18);
  });

  it('saves use level + relevant modifier', () => {
    const sheet = makeGuerreiro();
    expect(sheet.fortitude).toBe(5 + 2);   // level + CON mod
    expect(sheet.reflexes).toBe(5 + 2);    // level + DEX mod
    expect(sheet.will).toBe(5 + 0);        // level + WIS mod
  });

  it('spellSaveDC is null for non-spellcasters', () => {
    const sheet = makeGuerreiro();
    expect(sheet.spellSaveDC).toBeNull();
  });

  it('spellSaveDC = 10 + level + spellcasting attr mod', () => {
    const sheet = makeMulticlass();
    // Main class is guerreiro (index 0), second is mago
    // With current logic, first spellcaster class determines DC
    expect(sheet.spellSaveDC).toBe(10 + 8 + 1);  // 10 + totalLevel + INT mod
  });

  it('carry capacity scales with strength', () => {
    const sheet = makeGuerreiro();
    const { heavy } = sheet.carryCapacity;
    expect(heavy).toBe(16 * 10);
    expect(sheet.carryCapacity.light).toBe(Math.floor(heavy / 3));
  });
});

// ─── Skills ───────────────────────────────────────────────────────────────────

describe('T20CharacterSheet — Skills', () => {
  it('has all 30 T20 skills by default', () => {
    const sheet = makeGuerreiro();
    expect(sheet.skills.length).toBe(30);
  });

  it('Luta total = FOR mod + ranks + trained bonus', () => {
    const sheet = makeGuerreiro();
    const lutaSkill = sheet.skills.find((s) => s.name === 'Luta')!;
    lutaSkill.isTrained = true;
    lutaSkill.ranks = 5;

    const total = sheet.getSkillTotal('Luta');
    expect(total).toBe(3 + 5 + 2);  // FOR mod + ranks + trained
  });

  it('untrained skill only uses attribute mod', () => {
    const sheet = makeGuerreiro();
    const total = sheet.getSkillTotal('Percepção');
    expect(total).toBe(0);  // WIS mod = 0, no ranks, not trained
  });
});

// ─── Damage & Healing ─────────────────────────────────────────────────────────

describe('T20CharacterSheet — Damage & Healing', () => {
  it('starts at max PV', () => {
    const sheet = makeGuerreiro();
    expect(sheet.currentPV).toBe(sheet.derivedMaxPV);
  });

  it('takeDamage reduces currentPV', () => {
    const sheet = makeGuerreiro();
    const maxPV = sheet.derivedMaxPV;
    sheet.takeDamage(10);
    expect(sheet.currentPV).toBe(maxPV - 10);
  });

  it('currentPV cannot go below 0', () => {
    const sheet = makeGuerreiro();
    sheet.takeDamage(9999);
    expect(sheet.currentPV).toBe(0);
  });

  it('heal restores PV up to max', () => {
    const sheet = makeGuerreiro();
    sheet.takeDamage(20);
    sheet.heal(10);
    expect(sheet.currentPV).toBe(sheet.derivedMaxPV - 10);

    sheet.heal(9999);
    expect(sheet.currentPV).toBe(sheet.derivedMaxPV);
  });
});

// ─── PM ───────────────────────────────────────────────────────────────────────

describe('T20CharacterSheet — PM', () => {
  it('spendPM returns false when insufficient PM', () => {
    const sheet = makeGuerreiro();
    sheet.currentPM = 2;
    expect(sheet.spendPM(5)).toBe(false);
    expect(sheet.currentPM).toBe(2);
  });

  it('spendPM deducts correctly', () => {
    const sheet = makeMulticlass();
    sheet.currentPM = 10;
    const result = sheet.spendPM(3);
    expect(result).toBe(true);
    expect(sheet.currentPM).toBe(7);
  });

  it('recoverPM does not exceed max', () => {
    const sheet = makeMulticlass();
    const max = sheet.derivedMaxPM;
    sheet.currentPM = 0;
    sheet.recoverPM(9999);
    expect(sheet.currentPM).toBe(max);
  });
});

// ─── XP & Level-up ───────────────────────────────────────────────────────────

describe('T20CharacterSheet — XP & Level-up', () => {
  it('gainXP accumulates correctly', () => {
    const sheet = makeGuerreiro();
    sheet.xp = 0;
    sheet.gainXP(500);
    expect(sheet.xp).toBe(500);
  });

  it('detects level-up when crossing threshold', () => {
    const sheet = T20CharacterSheet.createFresh({
      characterName: 'Test', playerName: '', race: 'Humano', origin: 'Soldado',
      classes: [{ className: 'Guerreiro', level: 1, isSpellcaster: false, hitDie: 10 }],
      attributes: standardAttributes,
    });
    sheet.xp = 0;
    const { leveledUp } = sheet.gainXP(1000);  // threshold for level 2
    expect(leveledUp).toBe(true);
  });

  it('does not signal level-up when below threshold', () => {
    const sheet = makeGuerreiro();
    sheet.xp = 0;
    const { leveledUp } = sheet.gainXP(100);
    expect(leveledUp).toBe(false);
  });

  it('xpForNextLevel is null at level 20', () => {
    const sheet = T20CharacterSheet.createFresh({
      characterName: 'Max', playerName: '', race: 'Humano', origin: 'Soldado',
      classes: [{ className: 'Guerreiro', level: 20, isSpellcaster: false, hitDie: 10 }],
      attributes: standardAttributes,
    });
    expect(sheet.xpForNextLevel).toBeNull();
  });
});

// ─── Conditions ───────────────────────────────────────────────────────────────

describe('T20CharacterSheet — Conditions', () => {
  it('applies conditions without duplicates', () => {
    const sheet = makeGuerreiro();
    sheet.applyCondition({ name: 'Abalado', source: 'medo', isPermanent: false });
    sheet.applyCondition({ name: 'Abalado', source: 'medo', isPermanent: false });
    expect(sheet.conditions.filter((c) => c.name === 'Abalado')).toHaveLength(1);
  });

  it('removes conditions by name', () => {
    const sheet = makeGuerreiro();
    sheet.applyCondition({ name: 'Agarrado', source: 'teia', isPermanent: false });
    sheet.removeCondition('Agarrado');
    expect(sheet.conditions.some((c) => c.name === 'Agarrado')).toBe(false);
  });

  it('purgeExpiredConditions removes past-expiry entries', () => {
    const sheet = makeGuerreiro();
    const expired = new Date(Date.now() - 1000);  // 1 second ago
    sheet.conditions.push({
      name: 'Abalado', source: 'teste', appliedAt: new Date(),
      expiresAt: expired, isPermanent: false,
    });
    const removed = sheet.purgeExpiredConditions();
    expect(removed).toBe(1);
    expect(sheet.conditions).toHaveLength(0);
  });

  it('does not purge permanent conditions', () => {
    const sheet = makeGuerreiro();
    sheet.applyCondition({ name: 'Cego', source: 'maldição', isPermanent: true });
    sheet.purgeExpiredConditions();
    expect(sheet.conditions.some((c) => c.name === 'Cego')).toBe(true);
  });
});

// ─── Serialisation ────────────────────────────────────────────────────────────

describe('T20CharacterSheet — Serialisation', () => {
  it('round-trips through toPlainObject / fromPlainObject', () => {
    const original = makeGuerreiro();
    original.takeDamage(5);
    original.applyCondition({ name: 'Abalado', source: 'teste', isPermanent: false });
    original.equip('armor', 'arm-1', 'Cota de Malha', { defense: 4 });

    const plain = original.toPlainObject();
    const restored = T20CharacterSheet.fromPlainObject(plain);

    expect(restored.currentPV).toBe(original.currentPV);
    expect(restored.conditions).toHaveLength(original.conditions.length);
    expect(restored.equipment).toHaveLength(original.equipment.length);
    expect(restored.defesa).toBe(original.defesa);
  });

  it('serialised object includes _derived and _schemaVersion', () => {
    const sheet = makeGuerreiro();
    const plain = sheet.toPlainObject();
    expect(plain['_derived']).toBeDefined();
    expect(plain['_schemaVersion']).toBe(2);
  });
});
