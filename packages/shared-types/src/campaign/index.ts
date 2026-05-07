export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum TableState {
  IDLE = 'IDLE',
  IN_SESSION = 'IN_SESSION',
  PAUSED = 'PAUSED',
}

export interface Campaign {
  id: string;
  ownerId: string;
  systemId: string;
  name: string;
  description: string;
  status: CampaignStatus;
  settings: CampaignSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignSettings {
  maxPlayers: number;
  isPublic: boolean;
  allowSpectators: boolean;
  xpSystem: 'milestone' | 'earned';
}

export interface Table {
  id: string;
  campaignId: string;
  name: string;
  activeMapId: string | null;
  state: TableState;
  createdAt: Date;
}

export interface TableMember {
  tableId: string;
  userId: string;
  role: 'GM' | 'PLAYER' | 'SPECTATOR';
  joinedAt: Date;
}

export interface Character {
  id: string;
  userId: string;
  campaignId: string;
  systemId: string;
  name: string;
  sheetData: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerInvite {
  id: string;
  campaignId: string;
  invitedEmail: string;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
}

export interface SessionLog {
  id: string;
  tableId: string;
  startedAt: Date;
  endedAt: Date | null;
  summary: string | null;
}
