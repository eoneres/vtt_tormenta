import { EntryType } from '../../domain/entry/entry.entity';
import type { CreateEntryProps } from '../../domain/entry/entry.entity';

type SeedEntry = Omit<CreateEntryProps, 'isOfficial' | 'isHomebrew' | 'createdBy' | 'isPublic'>;

// ─── Shadowrun Qualities (Positive) ────────────────────────────────────────────

export const SHADOWRUN_QUALITIES_POSITIVE: SeedEntry[] = [
  {
    name: 'Aptitude',
    description: 'You have a natural ability with a particular skill. Choose one skill. Reduce the cost of improving this skill by 5%.',
    shortDescription: 'Natural ability in one skill, 5% cheaper improvements.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'positive', 'skill'],
    attributes: [
      { key: 'type', value: 'Positive', label: 'Tipo' },
      { key: 'cost', value: '6 karma', label: 'Custo' },
      { key: 'benefit', value: '-5% skill improvement cost', label: 'Benefício' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 75 },
  },
  {
    name: 'Bilingual',
    description: 'You are fluent in two languages instead of one. If you speak a third language, you speak it poorly.',
    shortDescription: 'Speak two languages fluently.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'positive', 'language'],
    attributes: [
      { key: 'type', value: 'Positive', label: 'Tipo' },
      { key: 'cost', value: '5 karma', label: 'Custo' },
      { key: 'benefit', value: '+1 language', label: 'Benefício' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 76 },
  },
  {
    name: 'Combat Sense',
    description:
      'Your intuition and sixth sense help you in combat. You gain +1d6 to Initiative rolls and your initiative pass count is increased by +1.',
    shortDescription: '+1d6 Initiative, +1 pass count.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'positive', 'combat'],
    attributes: [
      { key: 'type', value: 'Positive', label: 'Tipo' },
      { key: 'cost', value: '10 karma', label: 'Custo' },
      { key: 'benefit', value: '+1d6 Initiative, +1 pass', label: 'Benefício' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 77 },
  },
  {
    name: 'Dead Calm',
    description: 'You never panic. You gain +2 to Composure tests and you never take the Astral Haunt condition.',
    shortDescription: '+2 Composure, immune to panic.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'positive', 'mental'],
    attributes: [
      { key: 'type', value: 'Positive', label: 'Tipo' },
      { key: 'cost', value: '8 karma', label: 'Custo' },
      { key: 'benefit', value: '+2 Composure', label: 'Benefício' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 78 },
  },
  {
    name: 'Enhanced Immune System',
    description: 'Your immune system is stronger than normal. You gain +2 to resistance tests against diseases and toxins.',
    shortDescription: '+2 resistance to disease/toxins.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'positive', 'physical'],
    attributes: [
      { key: 'type', value: 'Positive', label: 'Tipo' },
      { key: 'cost', value: '4 karma', label: 'Custo' },
      { key: 'benefit', value: '+2 disease/toxin resistance', label: 'Benefício' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 79 },
  },
  {
    name: 'Natural Athlete',
    description: 'You are naturally good at physical activities. Reduce the cost of Athletics and Climbing skills by 5%.',
    shortDescription: 'Athletic skills 5% cheaper.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'positive', 'physical'],
    attributes: [
      { key: 'type', value: 'Positive', label: 'Tipo' },
      { key: 'cost', value: '6 karma', label: 'Custo' },
      { key: 'benefit', value: '-5% athletic skills', label: 'Benefício' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 80 },
  },
  {
    name: 'Quick Healer',
    description: 'Your body heals faster than normal. Reduce your recovery time from damage by half.',
    shortDescription: 'Recover from damage in half time.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'positive', 'healing'],
    attributes: [
      { key: 'type', value: 'Positive', label: 'Tipo' },
      { key: 'cost', value: '5 karma', label: 'Custo' },
      { key: 'benefit', value: 'Recovery time -50%', label: 'Benefício' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 81 },
  },
  {
    name: 'Run Faster',
    description: 'You are a natural sprinter. Increase your running speed by 20% and your sprint distance by 30%.',
    shortDescription: 'Running speed +20%, sprint +30%.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'positive', 'speed'],
    attributes: [
      { key: 'type', value: 'Positive', label: 'Tipo' },
      { key: 'cost', value: '7 karma', label: 'Custo' },
      { key: 'benefit', value: '+20% run, +30% sprint', label: 'Benefício' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 82 },
  },
  {
    name: 'Mentor Spirit',
    description:
      'You have a mentor spirit that guides you. Choose a mentor spirit. You gain +2 to tests related to your mentor\'s domain once per session.',
    shortDescription: '+2 to mentor-related tests, 1/session.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'positive', 'magic', 'guidance'],
    attributes: [
      { key: 'type', value: 'Positive', label: 'Tipo' },
      { key: 'cost', value: '5 karma', label: 'Custo' },
      { key: 'benefit', value: '+2 mentor tests', label: 'Benefício' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 83 },
  },
  {
    name: 'Uncouth',
    description: 'You are socially awkward but mechanically skilled. +1 to technical skills, -1 to social skills.',
    shortDescription: '+1 tech, -1 social.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'positive', 'tech'],
    attributes: [
      { key: 'type', value: 'Positive', label: 'Tipo' },
      { key: 'cost', value: '4 karma', label: 'Custo' },
      { key: 'benefit', value: '+1 technical, -1 social', label: 'Benefício' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 84 },
  },
];

// ─── Shadowrun Qualities (Negative) ───────────────────────────────────────────

export const SHADOWRUN_QUALITIES_NEGATIVE: SeedEntry[] = [
  {
    name: 'Ork Tusk',
    description: 'Your ork tusks make you look intimidating but also make eating difficult. -1 to eating/drinking tests.',
    shortDescription: '-1 to eating/drinking tests.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'negative', 'racial'],
    attributes: [
      { key: 'type', value: 'Negative', label: 'Tipo' },
      { key: 'reward', value: '2 karma', label: 'Recompensa' },
      { key: 'drawback', value: '-1 social tests in formal settings', label: 'Desvantagem' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 85 },
  },
  {
    name: 'Low Pain Tolerance',
    description: 'You are sensitive to pain. Increase the damage taken from pain-based attacks by 1.',
    shortDescription: '+1 damage from pain attacks.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'negative', 'physical'],
    attributes: [
      { key: 'type', value: 'Negative', label: 'Tipo' },
      { key: 'reward', value: '3 karma', label: 'Recompensa' },
      { key: 'drawback', value: '+1 pain damage', label: 'Desvantagem' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 86 },
  },
  {
    name: 'Paranoid',
    description: 'You are naturally suspicious. You cannot be surprised, but you take -1 to social tests.',
    shortDescription: '-1 social, cannot be surprised.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'negative', 'mental'],
    attributes: [
      { key: 'type', value: 'Negative', label: 'Tipo' },
      { key: 'reward', value: '4 karma', label: 'Recompensa' },
      { key: 'drawback', value: '-1 social tests', label: 'Desvantagem' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 87 },
  },
  {
    name: 'Bad Luck',
    description: 'Lady luck is not on your side. Once per session, reroll a failed test as a success, or a success as a failure.',
    shortDescription: 'Game master can flip one test result 1/session.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'negative', 'curse'],
    attributes: [
      { key: 'type', value: 'Negative', label: 'Tipo' },
      { key: 'reward', value: '6 karma', label: 'Recompensa' },
      { key: 'drawback', value: 'GM flips one test 1/session', label: 'Desvantagem' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 88 },
  },
  {
    name: 'Code of Honor',
    description:
      'You live by a strict code of honor. You must follow your code or suffer moral consequences. Common codes: Samurai, Street Samurai, Corporate, Fixer.',
    shortDescription: 'Must follow personal code of honor.',
    type: EntryType.QUALITY,
    system: 'shadowrun',
    tags: ['quality', 'negative', 'roleplay'],
    attributes: [
      { key: 'type', value: 'Negative', label: 'Tipo' },
      { key: 'reward', value: '5 karma', label: 'Recompensa' },
      { key: 'code', value: 'Choose your code at creation', label: 'Código' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 89 },
  },
];

// ─── Shadowrun Archetypes ────────────────────────────────────────────────────

export const SHADOWRUN_ARCHETYPES: SeedEntry[] = [
  {
    name: 'Street Samurai',
    description:
      'A combat specialist with exceptional martial arts and weapon skills. Street Samurai are often adepts or augmented with chrome, making them deadly in close quarters.',
    shortDescription: 'Combat-focused melee expert.',
    type: EntryType.ARCHETYPE,
    system: 'shadowrun',
    tags: ['archetype', 'combat', 'street-samurai'],
    attributes: [
      { key: 'role', value: 'Combat/Defense', label: 'Função' },
      { key: 'skills', value: 'Blades, Unarmed Combat, Dodge', label: 'Perícias' },
      { key: 'attributes', value: 'Agility 4, Strength 3, Reaction 4', label: 'Atributos Sugeridos' },
      { key: 'augmentation', value: 'Cybernetics for combat enhancement', label: 'Aumentação' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 100 },
  },
  {
    name: 'Decker',
    description:
      'A hacker who specializes in matrix operations. Deckers use sophisticated deck rigs to hack, infiltrate, and control computer systems.',
    shortDescription: 'Matrix hacker and cyber-specialist.',
    type: EntryType.ARCHETYPE,
    system: 'shadowrun',
    tags: ['archetype', 'tech', 'hacker'],
    attributes: [
      { key: 'role', value: 'Tech/Infiltration', label: 'Função' },
      { key: 'skills', value: 'Computer, Hacking, Program', label: 'Perícias' },
      { key: 'attributes', value: 'Logic 4, Intuition 3, Reaction 3', label: 'Atributos Sugeridos' },
      { key: 'equipment', value: 'Cyberdeck, Programs', label: 'Equipamento' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 101 },
  },
  {
    name: 'Mage',
    description: 'A spellcaster who channels magical energy through spells and summonings. Mages can heal, attack, or control situations through magic.',
    shortDescription: 'Spellcaster with summons.',
    type: EntryType.ARCHETYPE,
    system: 'shadowrun',
    tags: ['archetype', 'magic', 'caster'],
    attributes: [
      { key: 'role', value: 'Magic/Support', label: 'Função' },
      { key: 'skills', value: 'Spellcasting, Conjuring, Counterspelling', label: 'Perícias' },
      { key: 'attributes', value: 'Magic 4, Willpower 3, Logic 2', label: 'Atributos Sugeridos' },
      { key: 'magic', value: 'Spells, Summons', label: 'Magia' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 102 },
  },
  {
    name: 'Shaman',
    description:
      'A nature-based spellcaster who works with spirits rather than pure magic. Shamans can summon and control spirits for various tasks.',
    shortDescription: 'Spirit-summoning nature caster.',
    type: EntryType.ARCHETYPE,
    system: 'shadowrun',
    tags: ['archetype', 'magic', 'spirits'],
    attributes: [
      { key: 'role', value: 'Magic/Support', label: 'Função' },
      { key: 'skills', value: 'Conjuring, Counterspelling, Perception', label: 'Perícias' },
      { key: 'attributes', value: 'Magic 4, Charisma 3, Willpower 3', label: 'Atributos Sugeridos' },
      { key: 'magic', value: 'Spirits, Nature Magic', label: 'Magia' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 103 },
  },
  {
    name: 'Rigger',
    description:
      'A specialist in drones and vehicles. Riggers control multiple drones simultaneously through wireless connections, making them valuable for reconnaissance and support.',
    shortDescription: 'Drone and vehicle specialist.',
    type: EntryType.ARCHETYPE,
    system: 'shadowrun',
    tags: ['archetype', 'tech', 'vehicles'],
    attributes: [
      { key: 'role', value: 'Tech/Support', label: 'Função' },
      { key: 'skills', value: 'Pilot Vehicle, Pilot Drone, Gunnery', label: 'Perícias' },
      { key: 'attributes', value: 'Reaction 4, Logic 3, Intuition 3', label: 'Atributos Sugeridos' },
      { key: 'equipment', value: 'Control Rig, Drones', label: 'Equipamento' },
    ],
    relations: [],
    source: { book: 'Shadowrun Core Rulebook', page: 104 },
  },
];

export const SHADOWRUN_DATA_ALL = [
  ...SHADOWRUN_QUALITIES_POSITIVE,
  ...SHADOWRUN_QUALITIES_NEGATIVE,
  ...SHADOWRUN_ARCHETYPES,
];
