import { fetch } from 'undici';

export interface RollResult {
  id: string;
  notation: string;
  rolls: number[];
  total: number;
  breakdown: string;
  seed: string;
  signature: string;
}

export interface TableStateResponse {
  tableId: string;
  map: {
    id: string;
    name: string;
    imageUrl: string;
    gridType: string;
    gridSize: number;
    width: number;
    height: number;
  };
  tokens: Array<{
    id: string;
    name: string;
    imageUrl: string;
    position: { x: number; y: number };
    size: number;
    hp: number;
    maxHp: number;
    conditions: string[];
    controlledBy: string[];
    characterId: string | null;
    npcId: string | null;
    isVisible: boolean;
  }>;
}

export class ServiceClient {
  constructor(
    private readonly vttEngineUrl: string,
    private readonly rulesEngineUrl: string,
  ) {}

  async roll(notation: string, userId: string, systemId = 'tormenta20'): Promise<RollResult> {
    const res = await fetch(`${this.rulesEngineUrl}/v1/rolls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ notation, systemId }),
    });
    if (!res.ok) throw new Error(`Rules engine error: ${res.status}`);
    return res.json() as Promise<RollResult>;
  }

  async getTableState(tableId: string, mapId: string): Promise<TableStateResponse> {
    const res = await fetch(
      `${this.vttEngineUrl}/v1/tables/${tableId}/state?mapId=${mapId}`,
    );
    if (!res.ok) throw new Error(`VTT engine error: ${res.status}`);
    return res.json() as Promise<TableStateResponse>;
  }

  async moveToken(tokenId: string, tableId: string, x: number, y: number, requesterId: string): Promise<void> {
    const res = await fetch(`${this.vttEngineUrl}/v1/tokens/${tokenId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-id': requesterId },
      body: JSON.stringify({ tableId, position: { x, y } }),
    });
    if (!res.ok) throw new Error(`VTT engine move error: ${res.status}`);
  }
}
