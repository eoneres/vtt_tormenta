import { create } from 'zustand';
import type { RoomState, RoomToken, RoomChatMessage } from '../colyseus/game-room-client';
import { GameRoomClient } from '../colyseus/game-room-client';

export type ToolMode = 'select' | 'measure' | 'draw_wall' | 'ping';

interface TableState {
  // Room
  client: GameRoomClient | null;
  roomState: RoomState | null;
  connected: boolean;
  error: string | null;

  // UI
  selectedTokenId: string | null;
  toolMode: ToolMode;
  showSheet: boolean;
  showInitiative: boolean;
  showFog: boolean;

  // Actions
  connect: (options: {
    tableId: string;
    campaignId: string;
    mapId: string;
    userId: string;
    displayName: string;
    token: string;
  }) => Promise<void>;
  disconnect: () => void;
  setRoomState: (state: RoomState) => void;
  appendChat: (msg: RoomChatMessage) => void;
  selectToken: (id: string | null) => void;
  setToolMode: (mode: ToolMode) => void;
  toggleSheet: () => void;
  toggleInitiative: () => void;
  toggleFog: () => void;
  setError: (err: string | null) => void;
}

export const useTableStore = create<TableState>((set, get) => ({
  client: null,
  roomState: null,
  connected: false,
  error: null,
  selectedTokenId: null,
  toolMode: 'select',
  showSheet: false,
  showInitiative: false,
  showFog: true,

  connect: async (options) => {
    const client = new GameRoomClient();

    client.onState((state) => get().setRoomState(state));
    client.onErr((err) => set({ error: err }));
    client.onChat((msg) => get().appendChat(msg));

    await client.join(options);
    set({ client, connected: true, error: null });
  },

  disconnect: () => {
    get().client?.leave();
    set({ client: null, connected: false, roomState: null });
  },

  setRoomState: (roomState) => set({ roomState }),

  appendChat: (msg) =>
    set((s) => {
      if (!s.roomState) return s;
      const chatHistory = [...s.roomState.chatHistory, msg].slice(-100);
      return { roomState: { ...s.roomState, chatHistory } };
    }),

  selectToken: (selectedTokenId) => set({ selectedTokenId }),
  setToolMode: (toolMode) => set({ toolMode }),
  toggleSheet: () => set((s) => ({ showSheet: !s.showSheet })),
  toggleInitiative: () => set((s) => ({ showInitiative: !s.showInitiative })),
  toggleFog: () => set((s) => ({ showFog: !s.showFog })),
  setError: (error) => set({ error }),
}));
