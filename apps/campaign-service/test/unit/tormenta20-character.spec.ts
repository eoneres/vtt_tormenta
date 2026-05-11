import { Tormenta20Character } from '../../src/domain/character/entities/tormenta20-character.entity';
import { Tormenta20Calculator } from '../../src/domain/character/entities/tormenta20-sheet.types';

// ─── Factory helper ───────────────────────────────────────────────────────────

function makeCharacter(overrides: Parameters<typeof Tormenta20Character.create>[0] = {} as any) {
  return Tormenta20Character.create({
    userId: 'user-1',
    campaignId: 'campaign-1',
    name: 'Aldric',
    isNPC: false,
    isActive: true,
    ...overrides,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Tormenta20Character', () => {

  // ─── Tormenta20Calculator ────────────────────────────────────────────────

  describe('Tormenta20Calculator', () => {
    describe('attrMod()', () => {
      it.each([
        [10, 0], [11, 0], [12, 1], [13, 1],
        [14, 2], [15, 2], [16, 3], [18, 4],
        [8, -1], [6, -2], [1, -5],
      ])('attrMod(%d) = %d', (value, expected) => {
        expect(Tormenta20Calculator.attrMod(value)).toBe(expected);
      });
    });

    describe('profBonus()', () => {
      it.each([
        [1, 2], [5, 2], [6, 4], [10, 4],
        [11, 6], [15, 6], [16, 8], [20, 8],
      ])('profBonus(level %d) = %d', (level, expected) => {
        expect(Tormenta20Calculator.profBonus(level)).toBe(expected);
      });
    });

    describe('skillTotal()', () => {
      it('untrained skill: only attribute mod', () => {
        const skill = { id: 'athletics' as any, trained: false, extraBonus: 0, hasExpertise: false };
        const attrs = { strength: 14, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
        expect(Tormenta20Calculator.skillTotal(skill, attrs, 1)).toBe(2); // attrMod(14)=2
      });

      it('trained skill: attribute mod + proficiency', () => {
        const skill = { id: 'athletics' as any, trained: true, extraBonus: 0, hasExpertise: false };
        const attrs = { strength: 14, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
        expect(Tormenta20Calculator.skillTotal(skill, attrs, 1)).toBe(4); // 2 + prof(2)
      });

      it('expertise doubles proficiency', () => {
        const skill = { id: 'stealth' as any, trained: true, extraBonus: 0, hasExpertise: true };
        const attrs = { strength: 10, dexterity: 16, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
        expect(Tormenta20Calculator.skillTotal(skill, attrs, 1)).toBe(7); // 3 + 2*2
      });

      it('extra bonus is added', () => {
        const skill = { id: 'perception' as any, trained: false, extraBonus: 3, hasExpertise: false };
        const attrs = { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 };
        expect(Tormenta20Calculator.skillTotal(skill, attrs, 1)).toBe(3); // 0 + 0 + 3
      });
    });

    describe('xpForLevel()', () => {
      it('level 1 requires 0 XP', () => expect(Tormenta20Calculator.xpForLevel(1)).toBe(0));
      it('level 2 requires 1000 XP', () => expect(Tormenta20Calculator.xpForLevel(2)).toBe(1000));
      it('level 5 requires 10000 XP', () => expect(Tormenta20Calculator.xpForLevel(5)).toBe(10000));
      it('level 20 requires 190000 XP', () => expect(Tormenta20Calculator.xpForLevel(20)).toBe(190000));
    });
  });

  // ─── Character creation ──────────────────────────────────────────────────

  describe('create()', () => {
    it('creates a character with default sheet', () => {
      const char = makeCharacter();
      expect(char.name).toBe('Aldric');
      expect(char.level).toBe(1);
      expect(char.sheet.background.xp).toBe(0);
    });

    it('generates a unique ID', () => {
      const a = makeCharacter();
      const b = makeCharacter();
      expect(a.id).not.toBe(b.id);
    });

    it('throws if name is empty', () => {
      expect(() => makeCharacter({ name: '  ' } as any)).toThrow('Character name is required');
    });

    it('initializes all 23 skills', () => {
      const char = makeCharacter();
      expect(char.sheet.skills).toHaveLength(23);
    });

    it('accepts initial sheet overrides', () => {
      const char = makeCharacter({
        initialSheet: { background: { level: 5 } as any },
      } as any);
      expect(char.level).toBe(5);
    });
  });

  // ─── HP management ────────────────────────────────────────────────────────

  describe('modifyHp()', () => {
    it('reduces HP by delta', () => {
      const char = makeCharacter();
      const maxHp = char.maxHp;
      char.modifyHp(-5);
      expect(char.currentHp).toBe(maxHp - 5);
    });

    it('never goes below 0', () => {
      const char = makeCharacter();
      char.modifyHp(-1000);
      expect(char.currentHp).toBe(0);
    });

    it('never exceeds maxHp', () => {
      const char = makeCharacter();
      char.modifyHp(+1000);
      expect(char.currentHp).toBe(char.maxHp);
    });

    it('applies Inconsciente and Caído when HP reaches 0', () => {
      const char = makeCharacter();
      char.modifyHp(-1000);
      expect(char.sheet.conditions).toContain('Inconsciente');
      expect(char.sheet.conditions).toContain('Caído');
    });

    it('emits knocked_out event when HP reaches 0', () => {
      const char = makeCharacter();
      char.modifyHp(-1000);
      const events = char.consumeEvents();
      expect(events.some((e) => e.type === 'character.knocked_out')).toBe(true);
    });
  });

  describe('heal()', () => {
    it('restores HP', () => {
      const char = makeCharacter();
      char.modifyHp(-10);
      const before = char.currentHp;
      char.heal(5);
      expect(char.currentHp).toBe(before + 5);
    });

    it('removes Inconsciente when healed from 0', () => {
      const char = makeCharacter();
      char.modifyHp(-1000);
      expect(char.sheet.conditions).toContain('Inconsciente');
      char.heal(1);
      expect(char.sheet.conditions).not.toContain('Inconsciente');
    });
  });

  describe('fullRest()', () => {
    it('restores HP, MP, and clears conditions', () => {
      const char = makeCharacter();
      char.modifyHp(-10);
      char.modifyMp(-3);
      char.addCondition('Abalado');
      char.fullRest();
      expect(char.currentHp).toBe(char.maxHp);
      expect(char.currentMp).toBe(char.sheet.combat.maxMp);
      expect(char.sheet.conditions).toHaveLength(0);
    });
  });

  // ─── Skills ───────────────────────────────────────────────────────────────

  describe('skill training', () => {
    it('trainSkill marks skill as trained', () => {
      const char = makeCharacter();
      char.trainSkill('athletics');
      const skill = char.sheet.skills.find((s) => s.id === 'athletics');
      expect(skill?.trained).toBe(true);
    });

    it('untrainSkill unmarks skill', () => {
      const char = makeCharacter();
      char.trainSkill('stealth');
      char.untrainSkill('stealth');
      const skill = char.sheet.skills.find((s) => s.id === 'stealth');
      expect(skill?.trained).toBe(false);
    });

    it('getSkillTotal returns higher value for trained skill', () => {
      const char = makeCharacter();
      char.setAttribute('dexterity', 14); // mod +2
      const untrained = char.getSkillTotal('stealth');
      char.trainSkill('stealth');
      const trained = char.getSkillTotal('stealth');
      expect(trained).toBeGreaterThan(untrained);
    });
  });

  // ─── XP / Level ──────────────────────────────────────────────────────────

  describe('gainXp()', () => {
    it('increments XP', () => {
      const char = makeCharacter();
      char.gainXp(500);
      expect(char.sheet.background.xp).toBe(500);
    });

    it('levels up when XP threshold reached', () => {
      const char = makeCharacter();
      char.gainXp(1000); // level 2 threshold
      expect(char.level).toBe(2);
    });

    it('emits level_up event on level up', () => {
      const char = makeCharacter();
      char.gainXp(1000);
      const events = char.consumeEvents();
      expect(events.some((e) => e.type === 'character.level_up')).toBe(true);
    });

    it('does not go above level 20', () => {
      const char = makeCharacter({ initialSheet: { background: { level: 20 } as any } } as any);
      char.gainXp(999999);
      expect(char.level).toBe(20);
    });

    it('throws on negative XP gain', () => {
      const char = makeCharacter();
      expect(() => char.gainXp(-100)).toThrow('XP gain must be positive');
    });
  });

  // ─── Powers ───────────────────────────────────────────────────────────────

  describe('addPower()', () => {
    it('adds a power to the character', () => {
      const char = makeCharacter();
      const power = char.addPower({
        name: 'Ataque Poderoso',
        type: 'combat',
        description: 'Sacrifica precisão por dano',
      });
      expect(char.sheet.powers).toHaveLength(1);
      expect(power.id).toBeDefined();
    });

    it('removePower removes it by ID', () => {
      const char = makeCharacter();
      const power = char.addPower({ name: 'Ataque Poderoso', type: 'combat' });
      char.removePower(power.id);
      expect(char.sheet.powers).toHaveLength(0);
    });
  });

  // ─── Spells ───────────────────────────────────────────────────────────────

  describe('learnSpell()', () => {
    it('adds a spell', () => {
      const char = makeCharacter();
      char.learnSpell({ name: 'Bola de Fogo', circle: 3, cost: 5 });
      expect(char.sheet.spells).toHaveLength(1);
    });

    it('throws if spell already known', () => {
      const char = makeCharacter();
      char.learnSpell({ name: 'Sono', circle: 1, cost: 1 });
      expect(() => char.learnSpell({ name: 'Sono', circle: 1, cost: 1 })).toThrow();
    });

    it('getSpellsByCircle filters correctly', () => {
      const char = makeCharacter();
      char.learnSpell({ name: 'Mísseis Mágicos', circle: 1, cost: 1 });
      char.learnSpell({ name: 'Sono', circle: 1, cost: 1 });
      char.learnSpell({ name: 'Bola de Fogo', circle: 3, cost: 5 });
      expect(char.getSpellsByCircle(1)).toHaveLength(2);
      expect(char.getSpellsByCircle(3)).toHaveLength(1);
    });
  });

  // ─── Inventory ────────────────────────────────────────────────────────────

  describe('addItem()', () => {
    it('adds an item to inventory', () => {
      const char = makeCharacter();
      char.addItem({ name: 'Espada Longa', quantity: 1, weight: 1.5, value: 30, equipped: false });
      expect(char.sheet.inventory).toHaveLength(1);
    });

    it('stacks identical unequipped items', () => {
      const char = makeCharacter();
      char.addItem({ name: 'Tocha', quantity: 5, weight: 0.5, value: 1, equipped: false });
      char.addItem({ name: 'Tocha', quantity: 3, weight: 0.5, value: 1, equipped: false });
      expect(char.sheet.inventory).toHaveLength(1);
      expect(char.sheet.inventory[0]!.quantity).toBe(8);
    });

    it('removeItem decrements quantity', () => {
      const char = makeCharacter();
      const item = char.addItem({ name: 'Tocha', quantity: 5, weight: 0.5, value: 1, equipped: false });
      char.removeItem(item.id, 2);
      expect(char.sheet.inventory[0]!.quantity).toBe(3);
    });

    it('removeItem deletes when quantity reaches 0', () => {
      const char = makeCharacter();
      const item = char.addItem({ name: 'Tocha', quantity: 1, weight: 0.5, value: 1, equipped: false });
      char.removeItem(item.id, 1);
      expect(char.sheet.inventory).toHaveLength(0);
    });

    it('getTotalWeight sums all items', () => {
      const char = makeCharacter();
      char.addItem({ name: 'Item A', quantity: 2, weight: 1.0, value: 0, equipped: false });
      char.addItem({ name: 'Item B', quantity: 3, weight: 0.5, value: 0, equipped: false });
      expect(char.getTotalWeight()).toBe(3.5); // 2*1 + 3*0.5
    });
  });

  // ─── Conditions ───────────────────────────────────────────────────────────

  describe('conditions', () => {
    it('addCondition adds unique conditions', () => {
      const char = makeCharacter();
      char.addCondition('Abalado');
      char.addCondition('Abalado'); // duplicate
      expect(char.sheet.conditions.filter((c) => c === 'Abalado')).toHaveLength(1);
    });

    it('removeCondition removes it', () => {
      const char = makeCharacter();
      char.addCondition('Caído');
      char.removeCondition('Caído');
      expect(char.sheet.conditions).not.toContain('Caído');
    });
  });

  // ─── Derived stats ────────────────────────────────────────────────────────

  describe('recalculateDerivedStats()', () => {
    it('defense reflects dexterity modifier', () => {
      const char = makeCharacter();
      char.setAttribute('dexterity', 14); // mod +2
      expect(char.sheet.combat.defense).toBe(12); // 10 + 2
    });

    it('defense includes equipped armor bonus', () => {
      const char = makeCharacter();
      char.setAttribute('dexterity', 10);
      char.addItem({ name: 'Cota de Malha', quantity: 1, weight: 15, value: 300, equipped: true, slot: 'body', bonuses: { defense: 5 } });
      char.equipItem(char.sheet.inventory[0]!.id);
      expect(char.sheet.combat.defense).toBe(15); // 10 + 0 (dex) + 5 (armor)
    });
  });

  // ─── Serialization ────────────────────────────────────────────────────────

  describe('toPlainObject()', () => {
    it('returns all required fields', () => {
      const char = makeCharacter();
      const plain = char.toPlainObject();
      expect(plain).toHaveProperty('id');
      expect(plain).toHaveProperty('userId');
      expect(plain).toHaveProperty('sheet');
      expect(plain).toHaveProperty('createdAt');
      expect(plain).toHaveProperty('updatedAt');
    });

    it('can be reconstituted via reconstitute()', () => {
      const char = makeCharacter();
      char.gainXp(500);
      const plain = char.toPlainObject();
      const reconstituted = Tormenta20Character.reconstitute(plain);
      expect(reconstituted.id).toBe(char.id);
      expect(reconstituted.sheet.background.xp).toBe(500);
    });
  });
});
