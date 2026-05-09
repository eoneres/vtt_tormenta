# 📊 FASE 02 — DATA MODELS

**Data**: 7 de Maio de 2026  
**Status**: 📋 **DESIGN PHASE**  
**Aplicação**: Tormenta20 Schema, Compendium DB, Automation Templates

---

## 📋 Overview

Este documento define os **modelos de dados** para Fase 02, incluindo:
- Schema completo Tormenta20
- Estrutura MongoDB para Compendium
- Templates de automação
- Integrações com sistemas existentes

---

## 🎲 Tormenta20 Data Model

### Core Entities

#### 1. Race (Raça)

```typescript
interface Tormenta20Race {
  id: string; // "tormenta20:race:humano"
  name: LocalizedString;
  description: LocalizedString;

  // Attributes
  attributeModifiers: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };

  // Racial traits
  traits: RacialTrait[];

  // Size & movement
  size: CreatureSize;
  movement: MovementSpeed;

  // Languages
  languages: Language[];
  bonusLanguages?: number;

  // Visual
  appearance: {
    height: DiceRange; // e.g., "1d10+150" cm
    weight: DiceRange; // e.g., "2d6+70" kg
    age: {
      adulthood: number;
      lifespan: number;
    };
  };

  // Metadata
  source: string; // "Tormenta20 Manual"
  tags: string[];
}
```

#### 2. Class (Classe)

```typescript
interface Tormenta20Class {
  id: string; // "tormenta20:class:guerreiro"
  name: LocalizedString;
  description: LocalizedString;

  // Progression
  hitDice: DiceType; // "d8", "d6", etc.
  proficiencies: Proficiency[];
  savingThrows: AbilityScore[];

  // Features by level
  features: {
    [level: number]: ClassFeature[];
  };

  // Spellcasting (if applicable)
  spellcasting?: {
    ability: AbilityScore;
    cantripsKnown?: number[];
    spellsKnown?: number[];
    spellSlots: {
      [level: number]: number[];
    };
  };

  // Equipment
  startingEquipment: EquipmentChoice[];
  equipmentProficiencies: EquipmentType[];

  // Subclasses
  subclasses: Tormenta20Subclass[];

  // Metadata
  source: string;
  tags: string[];
}
```

#### 3. Power (Poder)

```typescript
interface Tormenta20Power {
  id: string; // "tormenta20:power:ataque-poderoso"
  name: LocalizedString;
  description: LocalizedString;

  // Power mechanics
  type: PowerType; // "attack", "utility", "reaction"
  actionType: ActionType; // "standard", "move", "free", "reaction"

  // Requirements
  prerequisites?: PowerPrerequisite[];

  // Effects
  effects: PowerEffect[];

  // Range & area
  range: PowerRange;
  area?: AreaOfEffect;

  // Duration
  duration: PowerDuration;

  // Damage/Healing
  damage?: DamageFormula;
  healing?: HealingFormula;

  // Saving throws
  savingThrow?: {
    ability: AbilityScore;
    successEffect?: PowerEffect;
    failureEffect?: PowerEffect;
  };

  // Metadata
  source: string;
  tags: string[];
}
```

#### 4. Spell (Magia)

```typescript
interface Tormenta20Spell {
  id: string; // "tormenta20:spell:bola-de-fogo"
  name: LocalizedString;
  description: LocalizedString;

  // Spell level & school
  level: number;
  school: MagicSchool;

  // Casting
  castingTime: CastingTime;
  range: SpellRange;
  components: SpellComponents;
  duration: SpellDuration;

  // Effects
  effects: SpellEffect[];

  // Area of effect
  area?: AreaOfEffect;

  // Damage/Healing
  damage?: DamageFormula;
  healing?: HealingFormula;

  // Saving throws
  savingThrow?: {
    ability: AbilityScore;
    successEffect?: SpellEffect;
    failureEffect?: SpellEffect;
  };

  // Higher level casting
  higherLevel?: SpellScaling[];

  // Metadata
  source: string;
  tags: string[];
}
```

#### 5. Item (Item)

```typescript
interface Tormenta20Item {
  id: string; // "tormenta20:item:espada-longa"
  name: LocalizedString;
  description: LocalizedString;

  // Item type
  type: ItemType; // "weapon", "armor", "tool", "consumable", etc.
  rarity: ItemRarity;

  // Physical properties
  weight: number; // in kg
  cost: CurrencyAmount;

  // Weapon properties
  weapon?: {
    damage: DiceFormula;
    damageType: DamageType;
    properties: WeaponProperty[];
    proficiency: ProficiencyType;
  };

  // Armor properties
  armor?: {
    armorClass: ArmorClassFormula;
    strengthRequirement?: number;
    stealthDisadvantage: boolean;
    type: ArmorType;
  };

  // Magic properties
  magic?: {
    rarity: MagicRarity;
    attunement: boolean;
    charges?: number;
    properties: MagicProperty[];
  };

  // Metadata
  source: string;
  tags: string[];
}
```

#### 6. Monster (Criatura)

```typescript
interface Tormenta20Monster {
  id: string; // "tormenta20:monster:goblin"
  name: LocalizedString;
  description: LocalizedString;

  // Combat stats
  size: CreatureSize;
  type: CreatureType;
  alignment: Alignment;

  // Ability scores
  abilityScores: AbilityScores;

  // Combat
  armorClass: number;
  hitPoints: DiceFormula;
  movement: MovementSpeed;

  // Abilities
  savingThrows?: Partial<AbilityScores>;
  skills?: { [skill: string]: number };
  senses: Sense[];
  languages: Language[];

  // Challenge rating
  challengeRating: number;
  experiencePoints: number;

  // Traits & actions
  traits: MonsterTrait[];
  actions: MonsterAction[];
  legendaryActions?: LegendaryAction[];

  // Metadata
  source: string;
  tags: string[];
}
```

---

## 🗄️ Compendium Database Schema

### MongoDB Collections

#### entries Collection

```typescript
interface EntryDocument {
  _id: ObjectId;

  // Domain identifiers
  entryId: string; // e.g., "tormenta20:race:humano"
  system: string; // "tormenta20", "dnd5e"
  type: EntryType; // "race", "class", "power", "spell", "item", "monster"

  // Content
  name: LocalizedString;
  description: LocalizedString;
  content: any; // Type-specific content (race, class, etc.)

  // Search & filtering
  tags: string[];
  searchableText: string; // Concatenated searchable content

  // Metadata
  source: string; // "Tormenta20 Manual", "Homebrew"
  author?: string;
  version: number;
  isHomebrew: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;

  // Version control
  previousVersions?: ObjectId[];
  isActive: boolean;
}
```

#### search_index Collection

```typescript
interface SearchIndexDocument {
  _id: ObjectId;
  entryId: string;

  // Flattened search fields
  system: string;
  type: EntryType;
  name: string;
  description: string;
  tags: string[];
  searchableText: string;

  // Search weights
  nameWeight: number; // 10
  descriptionWeight: number; // 5
  tagsWeight: number; // 8

  // Facets for filtering
  facets: {
    system: string;
    type: EntryType;
    rarity?: string;
    level?: number;
    school?: string;
    damageType?: string;
  };

  // Vector embeddings (future)
  embedding?: number[];
}
```

#### user_collections Collection

```typescript
interface UserCollectionDocument {
  _id: ObjectId;
  userId: string;

  // Collection metadata
  name: string;
  description?: string;
  isPublic: boolean;

  // Entries
  entries: {
    entryId: string;
    addedAt: Date;
    notes?: string;
  }[];

  // Permissions
  collaborators: {
    userId: string;
    role: 'viewer' | 'editor' | 'admin';
  }[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🤖 Automation Templates Schema

### automation_templates Collection

```typescript
interface AutomationTemplateDocument {
  _id: ObjectId;

  // Metadata
  templateId: string; // e.g., "initiative-tracker"
  name: LocalizedString;
  description: LocalizedString;
  category: AutomationCategory;

  // Template author
  author: string;
  isOfficial: boolean;
  version: string;

  // DSL definition
  dsl: string; // The automation DSL code

  // Configuration schema
  configSchema: AutomationConfigSchema;

  // Triggers
  triggers: AutomationTrigger[];

  // Permissions required
  requiredPermissions: string[];

  // Usage statistics
  usageCount: number;
  lastUsed?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### automation_instances Collection

```typescript
interface AutomationInstanceDocument {
  _id: ObjectId;

  // Instance metadata
  instanceId: string;
  templateId: string;
  campaignId: string;

  // Configuration
  config: any; // User-provided configuration

  // State
  isActive: boolean;
  lastExecuted?: Date;
  executionCount: number;

  // Execution history
  executions: {
    executedAt: Date;
    success: boolean;
    error?: string;
    context: any;
  }[];

  // Permissions
  createdBy: string;
  canExecute: string[]; // User IDs who can trigger

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🎮 Game State Extensions

### Enhanced Character Schema

```typescript
interface CharacterDocument {
  // Existing fields...
  automationInstances: string[]; // Automation instance IDs
  compendiumBookmarks: string[]; // Bookmarked entry IDs
  lightingPreferences: {
    preferredBrightness: number;
    colorBlindMode: boolean;
  };
}
```

### Campaign Extensions

```typescript
interface CampaignDocument {
  // Existing fields...
  compendiumSettings: {
    allowedSystems: string[];
    allowHomebrew: boolean;
    customEntries: string[];
  };

  automationSettings: {
    enabledTemplates: string[];
    customAutomations: string[];
  };

  lightingSettings: {
    globalBrightness: number;
    ambientColor: string;
    dynamicLighting: boolean;
  };
}
```

---

## 🔗 Integration Schemas

### Event Schemas

#### Compendium Events

```typescript
interface CompendiumEvents {
  'compendium.entry.created': {
    entryId: string;
    system: string;
    type: EntryType;
    name: string;
  };

  'compendium.entry.updated': {
    entryId: string;
    system: string;
    changes: string[];
  };

  'compendium.search.performed': {
    query: string;
    filters: any;
    resultCount: number;
    userId: string;
  };
}
```

#### Automation Events

```typescript
interface AutomationEvents {
  'automation.executed': {
    instanceId: string;
    templateId: string;
    campaignId: string;
    success: boolean;
    executionTime: number;
  };

  'automation.failed': {
    instanceId: string;
    templateId: string;
    error: string;
    context: any;
  };
}
```

#### Lighting Events

```typescript
interface LightingEvents {
  'lighting.updated': {
    mapId: string;
    lightSources: LightSource[];
    affectedTokens: string[];
  };

  'lighting.shadow.changed': {
    mapId: string;
    shadowCasterId: string;
    newGeometry: Polygon;
  };
}
```

---

## 📊 Data Migration Strategy

### From Fase 01 to Fase 02

#### Character Data Migration

```typescript
// Migration script
async function migrateCharacterData() {
  const characters = await CharacterModel.find({});

  for (const character of characters) {
    // Add new fields with defaults
    character.automationInstances = [];
    character.compendiumBookmarks = [];
    character.lightingPreferences = {
      preferredBrightness: 1.0,
      colorBlindMode: false
    };

    await character.save();
  }
}
```

#### Campaign Data Migration

```typescript
async function migrateCampaignData() {
  const campaigns = await CampaignModel.find({});

  for (const campaign of campaigns) {
    campaign.compendiumSettings = {
      allowedSystems: ['tormenta20'],
      allowHomebrew: false,
      customEntries: []
    };

    campaign.automationSettings = {
      enabledTemplates: [],
      customAutomations: []
    };

    campaign.lightingSettings = {
      globalBrightness: 1.0,
      ambientColor: '#ffffff',
      dynamicLighting: true
    };

    await campaign.save();
  }
}
```

---

## 🔍 Search & Indexing Strategy

### Elasticsearch Mappings

```json
{
  "mappings": {
    "properties": {
      "entryId": { "type": "keyword" },
      "system": { "type": "keyword" },
      "type": { "type": "keyword" },
      "name": {
        "type": "text",
        "analyzer": "portuguese",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "portuguese"
      },
      "tags": { "type": "keyword" },
      "searchableText": {
        "type": "text",
        "analyzer": "portuguese"
      },
      "facets": {
        "properties": {
          "system": { "type": "keyword" },
          "type": { "type": "keyword" },
          "rarity": { "type": "keyword" },
          "level": { "type": "integer" },
          "school": { "type": "keyword" }
        }
      }
    }
  }
}
```

### Query Examples

```typescript
// Simple search
const simpleQuery = {
  query: {
    multi_match: {
      query: "bola de fogo",
      fields: ["name^10", "description^5", "tags^8", "searchableText"]
    }
  }
};

// Filtered search
const filteredQuery = {
  query: {
    bool: {
      must: [
        { multi_match: { query: "mago", fields: ["name", "description"] } }
      ],
      filter: [
        { term: { "facets.system": "tormenta20" } },
        { term: { "facets.type": "class" } }
      ]
    }
  }
};
```

---

## 📈 Data Volume Estimates

### Tormenta20 Content

| Entity Type | Estimated Count | Avg Size (KB) | Total Size (MB) |
|-------------|-----------------|----------------|-----------------|
| Races | 12 | 5 | 0.06 |
| Classes | 15 | 25 | 0.375 |
| Powers | 200 | 3 | 0.6 |
| Spells | 150 | 4 | 0.6 |
| Items | 300 | 2 | 0.6 |
| Monsters | 100 | 8 | 0.8 |
| **Total** | **777** | - | **3.025** |

### User-Generated Content

| Content Type | Growth Estimate | Retention |
|--------------|-----------------|-----------|
| Homebrew Items | 50/month | 2 years |
| Custom Automations | 20/month | Indefinite |
| User Collections | 10/month | Indefinite |

### Performance Projections

- **Search Index Size**: ~50MB (with replicas)
- **Daily Searches**: 10,000
- **Cache Hit Rate**: >85%
- **Backup Size**: ~100MB compressed

---

## 🔒 Data Privacy & Security

### PII Handling

```typescript
interface DataClassification {
  public: string[];     // Name, description, tags
  internal: string[];   // Entry IDs, timestamps
  sensitive: string[];  // User bookmarks, custom content
  restricted: string[]; // Author information, edit history
}
```

### Retention Policies

```typescript
const retentionPolicies = {
  searchLogs: '30 days',
  automationLogs: '90 days',
  userCollections: 'indefinite',
  homebrewContent: 'indefinite',
  cacheEntries: '24 hours'
};
```

### Backup Strategy

- **Daily Backups**: Full MongoDB dumps
- **Hourly Backups**: Incremental changes
- **Offsite Storage**: Encrypted S3 buckets
- **Retention**: 30 days rolling

---

## 📚 References

- [Tormenta20 Rulebook](https://www.jamboeditora.com.br/produto/tormenta20/)
- [MongoDB Schema Design](https://www.mongodb.com/developer/products/mongodb/schema-design/)
- [Elasticsearch Mappings](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)

---

**Document Status**: 📋 **DRAFT FOR REVIEW**  
**Review Date**: 14 de Maio de 2026  
**Approval Required**: Data Architect + Tech Lead  
**Next Update**: Post-data import validation
