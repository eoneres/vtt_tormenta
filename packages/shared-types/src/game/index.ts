export enum GridType {
  SQUARE = 'SQUARE',
  HEX_FLAT = 'HEX_FLAT',
  HEX_POINTY = 'HEX_POINTY',
}

export enum LayerType {
  BACKGROUND = 'BACKGROUND',
  OBJECTS = 'OBJECTS',
  TOKENS = 'TOKENS',
  GM = 'GM',
  LIGHTING = 'LIGHTING',
}

export interface Position {
  x: number;
  y: number;
}

export interface MapConfig {
  id: string;
  name: string;
  imageUrl: string;
  gridType: GridType;
  gridSize: number;
  width: number;
  height: number;
  layers: LayerConfig[];
}

export interface LayerConfig {
  id: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

export interface Token {
  id: string;
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
}

export interface TokenAura {
  radius: number;
  color: string;
  opacity: number;
}

export interface FogOfWarState {
  mode: 'global' | 'per_token';
  revealedAreas: RevealedArea[];
}

export interface RevealedArea {
  tokenId: string | null;
  polygon: Position[];
}

export interface LightSource {
  id: string;
  tokenId: string | null;
  position: Position;
  radius: number;
  brightRadius: number;
  color: string;
  intensity: number;
}

export interface Wall {
  id: string;
  start: Position;
  end: Position;
  blocksLight: boolean;
  blocksMovement: boolean;
}

export interface InitiativeEntry {
  id: string;
  tokenId: string;
  name: string;
  initiative: number;
  isActive: boolean;
}

export interface TableGameState {
  tableId: string;
  map: MapConfig | null;
  tokens: Token[];
  fogOfWar: FogOfWarState;
  lights: LightSource[];
  walls: Wall[];
  initiative: InitiativeEntry[];
  round: number;
  turn: number;
}
