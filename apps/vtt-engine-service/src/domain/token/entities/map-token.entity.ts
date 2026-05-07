import { generateId } from '@vtt/shared-utils';
import type { Position, TokenAura } from '@vtt/shared-types';

interface TokenProps {
  id: string;
  mapId: string;
  characterId: string | null;
  npcId: string | null;
  name: string;
  imageUrl: string;
  position: Position;
  size: number;
  hp: number | null;
  maxHp: number | null;
  conditions: string[];
  auras: TokenAura[];
  isVisible: boolean;
  controlledBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class MapToken {
  readonly id: string;
  readonly mapId: string;
  characterId: string | null;
  npcId: string | null;
  name: string;
  imageUrl: string;
  position: Position;
  size: number;
  hp: number | null;
  maxHp: number | null;
  conditions: string[];
  auras: TokenAura[];
  isVisible: boolean;
  controlledBy: string[];
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(props: TokenProps) {
    this.id = props.id;
    this.mapId = props.mapId;
    this.characterId = props.characterId;
    this.npcId = props.npcId;
    this.name = props.name;
    this.imageUrl = props.imageUrl;
    this.position = props.position;
    this.size = props.size;
    this.hp = props.hp;
    this.maxHp = props.maxHp;
    this.conditions = props.conditions;
    this.auras = props.auras;
    this.isVisible = props.isVisible;
    this.controlledBy = props.controlledBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: {
    mapId: string;
    name: string;
    imageUrl: string;
    position: Position;
    characterId?: string;
    npcId?: string;
    size?: number;
    hp?: number;
    maxHp?: number;
    controlledBy?: string[];
  }): MapToken {
    const now = new Date();
    return new MapToken({
      id: generateId(),
      mapId: props.mapId,
      characterId: props.characterId ?? null,
      npcId: props.npcId ?? null,
      name: props.name.trim(),
      imageUrl: props.imageUrl,
      position: props.position,
      size: props.size ?? 1,
      hp: props.hp ?? null,
      maxHp: props.maxHp ?? null,
      conditions: [],
      auras: [],
      isVisible: true,
      controlledBy: props.controlledBy ?? [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: TokenProps): MapToken {
    return new MapToken(props);
  }

  moveTo(position: Position): void {
    this.position = position;
    this.updatedAt = new Date();
  }

  applyCondition(conditionId: string): void {
    if (!this.conditions.includes(conditionId)) {
      this.conditions = [...this.conditions, conditionId];
      this.updatedAt = new Date();
    }
  }

  removeCondition(conditionId: string): void {
    this.conditions = this.conditions.filter((c) => c !== conditionId);
    this.updatedAt = new Date();
  }

  updateHp(hp: number): void {
    this.hp = this.maxHp !== null ? Math.min(Math.max(hp, 0), this.maxHp) : hp;
    this.updatedAt = new Date();
  }

  setVisibility(visible: boolean): void {
    this.isVisible = visible;
    this.updatedAt = new Date();
  }

  isControlledBy(userId: string): boolean {
    return this.controlledBy.includes(userId);
  }
}
