export type DiceNotation = string;
export interface DiceRollRequest {
    notation: DiceNotation;
    systemId: string;
    characterId?: string;
    context?: RollContext;
}
export interface DiceRollResult {
    id: string;
    notation: DiceNotation;
    rolls: number[];
    total: number;
    breakdown: string;
    seed: string;
    signature: string;
    timestamp: Date;
    rolledBy: string;
}
export interface RollContext {
    type: 'attack' | 'damage' | 'skill' | 'save' | 'initiative' | 'custom';
    advantage?: boolean;
    disadvantage?: boolean;
    modifiers?: RollModifier[];
}
export interface RollModifier {
    source: string;
    value: number;
    type: 'bonus' | 'penalty' | 'circumstance' | 'status';
}
export interface SystemDefinition {
    system: string;
    version: string;
    name: string;
    attributes: AttributeDefinition[];
    skills: SkillDefinition[];
    roll: Record<string, DiceNotation>;
    events: GameEventType[];
    conditions: ConditionDefinition[];
    resources: ResourceDefinition[];
}
export interface AttributeDefinition {
    id: string;
    name: string;
    abbreviation: string;
    min: number;
    max: number;
}
export interface SkillDefinition {
    id: string;
    name: string;
    attribute: string;
    trainedBonus: number;
}
export interface ConditionDefinition {
    id: string;
    name: string;
    effects: ConditionEffect[];
}
export interface ConditionEffect {
    target: string;
    modifier: number;
    type: string;
}
export interface ResourceDefinition {
    id: string;
    name: string;
    formula: string;
    recoveryType: 'short_rest' | 'long_rest' | 'daily' | 'manual';
}
export type GameEventType = 'ON_ATTACK' | 'ON_DAMAGE' | 'ON_HEAL' | 'ON_TURN_START' | 'ON_TURN_END' | 'ON_CONDITION_APPLY' | 'ON_CONDITION_REMOVE' | 'ON_DEATH' | 'ON_LEVEL_UP';
export interface BuffDebuff {
    id: string;
    name: string;
    source: string;
    target: string;
    modifier: number;
    attribute: string;
    duration: number | null;
    expiresAt: Date | null;
}
//# sourceMappingURL=index.d.ts.map