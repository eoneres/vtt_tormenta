/**
 * Tormenta20 Built-in Automation Templates
 *
 * These are pre-built automations for common T20 mechanics.
 * Loaded as templates that GMs can clone and customize.
 */

import type { CreateAutomationProps } from '../domain/automation/entities/automation.aggregate';

export const T20_AUTOMATION_TEMPLATES: Omit<CreateAutomationProps, 'createdBy'>[] = [
  // ─── Combate ───────────────────────────────────────────────────────────────

  {
    name: 'Bárbaro — Fúria (Aplicar)',
    description: 'Quando o bárbaro usa Fúria, aplica bônus de For/Con e anuncia no chat.',
    system: 'tormenta20',
    scope: 'global',
    isTemplate: true,
    trigger: { type: 'ON_ABILITY_USED', abilityId: 'furia' },
    actions: [
      {
        type: 'APPLY_CONDITION',
        target: { type: 'self' },
        conditionName: 'Em Fúria',
        label: 'Aplica condição Em Fúria',
      },
      {
        type: 'SEND_CHAT_MESSAGE',
        target: { type: 'self' },
        message: '💢 {{sourceTokenId}} entra em FÚRIA! +4 Força e Constituição.',
        flavor: 'A raiva primitiva toma conta do guerreiro...',
      },
    ],
    tags: ['bárbaro', 'fúria', 'combate', 'tormenta20'],
    maxFiresPerRound: 1,
  },

  {
    name: 'Ataque Furtivo — Verificar e Anunciar',
    description: 'Verifica condições para ataque furtivo e anuncia o dano extra.',
    system: 'tormenta20',
    scope: 'global',
    isTemplate: true,
    trigger: { type: 'ON_DAMAGE_DEALT' },
    condition: {
      type: 'and',
      conditions: [
        {
          type: 'simple',
          field: 'eventData.isFurtive',
          operator: 'is_true',
        },
        {
          type: 'simple',
          field: 'eventData.attackerClass',
          operator: 'eq',
          value: 'ladino',
        },
      ],
    },
    actions: [
      {
        type: 'ROLL_DICE',
        target: { type: 'self' },
        notation: '{{eventData.sneakAttackDice}}d8',
        storeAs: 'sneakDamage',
        announce: false,
      },
      {
        type: 'APPLY_DAMAGE',
        target: { type: 'target' },
        amount: '{{sneakDamage}}',
        label: 'Dano de ataque furtivo',
      },
      {
        type: 'SEND_CHAT_MESSAGE',
        target: { type: 'self' },
        message: '🗡️ Ataque Furtivo! +{{sneakDamage}} de dano extra. ({{sneakDamage_breakdown}})',
      },
    ],
    tags: ['ladino', 'ataque furtivo', 'combate'],
    maxFiresPerRound: 1,
  },

  {
    name: 'Paladino — Detecção do Mal',
    description: 'O paladino detecta criaturas malignas no alcance e anuncia.',
    system: 'tormenta20',
    scope: 'global',
    isTemplate: true,
    trigger: { type: 'ON_ABILITY_USED', abilityId: 'deteccao_do_mal' },
    actions: [
      {
        type: 'SEND_CHAT_MESSAGE',
        target: { type: 'self' },
        message: '✨ {{sourceTokenId}} usa Detecção do Mal. O GM revela criaturas malignas em 9m.',
        flavor: 'A luz divina revela as trevas...',
      },
    ],
    tags: ['paladino', 'divino', 'detecção'],
  },

  // ─── HP / Dano ─────────────────────────────────────────────────────────────

  {
    name: 'HP Crítico — Alerta',
    description: 'Envia mensagem no chat quando um token cai abaixo de 25% de HP.',
    system: 'tormenta20',
    scope: 'global',
    isTemplate: true,
    trigger: { type: 'ON_HP_BELOW_THRESHOLD', hpThreshold: 25 },
    condition: {
      type: 'simple',
      field: 'eventData.hpPercent',
      operator: 'lte',
      value: 25,
    },
    actions: [
      {
        type: 'SEND_CHAT_MESSAGE',
        target: { type: 'self' },
        message: '⚠️ {{sourceTokenId}} está em estado crítico! HP: {{eventData.currentHp}}/{{eventData.maxHp}}',
        flavor: 'A batalha está indo mal...',
      },
    ],
    tags: ['hp', 'alerta', 'combate'],
  },

  {
    name: 'Personagem Morto — Inconsciente',
    description: 'Aplica condição Inconsciente quando HP chega a 0.',
    system: 'tormenta20',
    scope: 'global',
    isTemplate: true,
    trigger: { type: 'ON_HP_CHANGE' },
    condition: {
      type: 'simple',
      field: 'eventData.newHp',
      operator: 'lte',
      value: 0,
    },
    actions: [
      {
        type: 'APPLY_CONDITION',
        target: { type: 'self' },
        conditionName: 'Inconsciente',
      },
      {
        type: 'APPLY_CONDITION',
        target: { type: 'self' },
        conditionName: 'Caído',
      },
      {
        type: 'SEND_CHAT_MESSAGE',
        target: { type: 'self' },
        message: '💀 {{sourceTokenId}} caiu! HP chegou a 0. Aplicando condições: Inconsciente e Caído.',
      },
    ],
    tags: ['hp', 'morte', 'condição'],
    maxFiresPerRound: 1,
  },

  // ─── Magias ────────────────────────────────────────────────────────────────

  {
    name: 'Bola de Fogo — Dano em Área',
    description: 'Rola dano de Bola de Fogo e aplica a todos os alvos marcados.',
    system: 'tormenta20',
    scope: 'global',
    isTemplate: true,
    trigger: { type: 'ON_SPELL_CAST', abilityId: 'bola_de_fogo' },
    actions: [
      {
        type: 'ROLL_DICE',
        target: { type: 'self' },
        notation: '5d6',
        storeAs: 'fireDamage',
        announce: true,
      },
      {
        type: 'SEND_CHAT_MESSAGE',
        target: { type: 'self' },
        message: '🔥 Bola de Fogo! Dano: {{fireDamage}} ({{fireDamage_breakdown}}). Reflexos CD Int para metade.',
        flavor: 'Uma esfera de fogo explode no ponto alvo!',
      },
    ],
    tags: ['magia', 'fogo', 'área', 'mago'],
  },

  {
    name: 'Curar Ferimentos — Cura Automática',
    description: 'Rola cura de Curar Ferimentos e aplica no alvo.',
    system: 'tormenta20',
    scope: 'global',
    isTemplate: true,
    trigger: { type: 'ON_SPELL_CAST', abilityId: 'curar_ferimentos' },
    actions: [
      {
        type: 'ROLL_DICE',
        target: { type: 'self' },
        notation: '1d8',
        storeAs: 'healAmount',
        announce: false,
      },
      {
        type: 'HEAL',
        target: { type: 'target' },
        amount: '{{healAmount}} + {{eventData.wisdomMod}}',
        isHealing: true,
      },
      {
        type: 'SEND_CHAT_MESSAGE',
        target: { type: 'self' },
        message: '💚 Curar Ferimentos! {{targetTokenId}} recupera {{healAmount}} PV. ({{healAmount_breakdown}} + {{eventData.wisdomMod}} Sab)',
      },
    ],
    tags: ['magia', 'cura', 'clérigo'],
  },

  // ─── Turno ────────────────────────────────────────────────────────────────

  {
    name: 'Regeneração — Cura por Turno',
    description: 'Personagem com regeneração recupera PV no início de cada turno.',
    system: 'tormenta20',
    scope: 'global',
    isTemplate: true,
    trigger: { type: 'ON_TURN_START' },
    condition: {
      type: 'simple',
      field: 'eventData.conditions',
      operator: 'contains',
      value: 'Regeneração',
    },
    actions: [
      {
        type: 'HEAL',
        target: { type: 'self' },
        amount: '{{eventData.regenAmount}}',
        isHealing: true,
      },
      {
        type: 'SEND_CHAT_MESSAGE',
        target: { type: 'self' },
        message: '💚 {{sourceTokenId}} regenera {{eventData.regenAmount}} PV.',
      },
    ],
    tags: ['regeneração', 'turno', 'cura'],
  },

  {
    name: 'Veneno — Dano por Turno',
    description: 'Personagem envenenado sofre dano no início do turno.',
    system: 'tormenta20',
    scope: 'global',
    isTemplate: true,
    trigger: { type: 'ON_TURN_START' },
    condition: {
      type: 'simple',
      field: 'eventData.conditions',
      operator: 'contains',
      value: 'Envenenado',
    },
    actions: [
      {
        type: 'ROLL_DICE',
        target: { type: 'self' },
        notation: '1d6',
        storeAs: 'poisonDamage',
        announce: false,
      },
      {
        type: 'MODIFY_HP',
        target: { type: 'self' },
        amount: '-{{poisonDamage}}',
      },
      {
        type: 'SEND_CHAT_MESSAGE',
        target: { type: 'self' },
        message: '☠️ {{sourceTokenId}} sofre {{poisonDamage}} de dano de veneno! ({{poisonDamage_breakdown}})',
      },
    ],
    tags: ['veneno', 'condição', 'dano por turno'],
  },

  {
    name: 'Duração de Condição — Reduzir por Turno',
    description: 'Reduz duração de condições temporárias no início de cada turno.',
    system: 'tormenta20',
    scope: 'global',
    isTemplate: true,
    trigger: { type: 'ON_TURN_END' },
    actions: [
      {
        type: 'SEND_CHAT_MESSAGE',
        target: { type: 'self' },
        message: '⏱️ Fim do turno de {{sourceTokenId}}. Verifique duração de efeitos temporários.',
      },
    ],
    tags: ['duração', 'condição', 'turno'],
  },
];
