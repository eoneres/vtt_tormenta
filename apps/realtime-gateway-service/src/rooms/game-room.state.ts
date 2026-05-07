import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';

export class PositionSchema extends Schema {
  @type('number') x: number = 0;
  @type('number') y: number = 0;
}

export class AuraSchema extends Schema {
  @type('string') id: string = '';
  @type('number') radius: number = 0;
  @type('string') color: string = '#ff0000';
  @type('boolean') visible: boolean = true;
}

export class TokenSchema extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('string') imageUrl: string = '';
  @type(PositionSchema) position: PositionSchema = new PositionSchema();
  @type('number') size: number = 1;
  @type('number') hp: number = 0;
  @type('number') maxHp: number = 0;
  @type('boolean') isVisible: boolean = true;
  @type(['string']) conditions: ArraySchema<string> = new ArraySchema<string>();
  @type(['string']) controlledBy: ArraySchema<string> = new ArraySchema<string>();
  @type(AuraSchema) aura: AuraSchema = new AuraSchema();
  @type('string') characterId: string = '';
  @type('string') npcId: string = '';
}

export class InitiativeEntrySchema extends Schema {
  @type('string') tokenId: string = '';
  @type('string') name: string = '';
  @type('number') initiative: number = 0;
  @type('boolean') hasActed: boolean = false;
}

export class ChatMessageSchema extends Schema {
  @type('string') id: string = '';
  @type('string') senderId: string = '';
  @type('string') senderName: string = '';
  @type('string') content: string = '';
  @type('string') type: string = 'text'; // 'text' | 'roll' | 'emote' | 'system'
  @type('number') timestamp: number = 0;
  // Roll result embedded as JSON string to avoid deep nesting
  @type('string') rollData: string = '';
}

export class RevealedAreaSchema extends Schema {
  @type('string') tokenId: string = '';
  // Polygon serialized as JSON string (array of {x,y})
  @type('string') polygon: string = '[]';
}

export class FogStateSchema extends Schema {
  @type('string') mode: string = 'global'; // 'global' | 'per_token' | 'disabled'
  @type([RevealedAreaSchema]) revealedAreas: ArraySchema<RevealedAreaSchema> =
    new ArraySchema<RevealedAreaSchema>();
}

export class MapStateSchema extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('string') imageUrl: string = '';
  @type('string') gridType: string = 'SQUARE';
  @type('number') gridSize: number = 70;
  @type('number') width: number = 1400;
  @type('number') height: number = 1400;
}

export class GameRoomState extends Schema {
  @type('string') tableId: string = '';
  @type('string') campaignId: string = '';
  @type('string') gmId: string = '';
  @type('string') phase: string = 'exploration'; // 'exploration' | 'combat' | 'paused'
  @type('number') round: number = 0;
  @type('number') turn: number = 0;

  @type(MapStateSchema) map: MapStateSchema = new MapStateSchema();
  @type({ map: TokenSchema }) tokens: MapSchema<TokenSchema> = new MapSchema<TokenSchema>();
  @type([InitiativeEntrySchema]) initiative: ArraySchema<InitiativeEntrySchema> =
    new ArraySchema<InitiativeEntrySchema>();
  @type([ChatMessageSchema]) chatHistory: ArraySchema<ChatMessageSchema> =
    new ArraySchema<ChatMessageSchema>();
  @type(FogStateSchema) fog: FogStateSchema = new FogStateSchema();

  // Connected player IDs → display names
  @type({ map: 'string' }) players: MapSchema<string> = new MapSchema<string>();
}
