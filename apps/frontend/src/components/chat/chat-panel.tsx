'use client';

import { useEffect, useRef, useState } from 'react';
import { useTableStore } from '@/lib/store/table.store';
import { useAuthStore } from '@/lib/store/auth.store';
import { COMMANDS } from '@/lib/colyseus/commands';
import type { RoomChatMessage } from '@/lib/colyseus/game-room-client';
import { clsx } from 'clsx';

function RollResult({ data }: { data: RoomChatMessage['rollData'] }) {
  if (!data) return null;
  return (
    <div className="mt-1 bg-vtt-bg rounded p-2 font-mono text-xs">
      <div className="text-vtt-muted">{data.notation}</div>
      <div className="text-vtt-text">[{data.rolls.join(', ')}]</div>
      <div className="text-vtt-accent font-bold text-sm">= {data.total}</div>
    </div>
  );
}

function ChatBubble({ msg, isOwn }: { msg: RoomChatMessage; isOwn: boolean }) {
  const rollData = msg.rollData
    ? (JSON.parse(msg.rollData as any) as RoomChatMessage['rollData'])
    : undefined;

  if (msg.type === 'system') {
    return (
      <div className="text-center text-vtt-muted text-xs py-1 italic">{msg.content}</div>
    );
  }

  return (
    <div className={clsx('flex flex-col gap-0.5', isOwn && 'items-end')}>
      <span className="text-vtt-muted text-xs px-1">{msg.senderName}</span>
      <div
        className={clsx(
          'max-w-[85%] rounded-lg px-3 py-2 text-sm',
          msg.type === 'roll' && 'bg-vtt-accent/20 border border-vtt-accent/30',
          msg.type === 'emote' && 'italic text-vtt-muted bg-transparent',
          msg.type === 'text' && (isOwn ? 'bg-vtt-accent text-white' : 'bg-vtt-surface'),
        )}
      >
        {msg.type === 'roll' && (
          <span className="text-vtt-accent font-medium">🎲 {msg.content}</span>
        )}
        {msg.type !== 'roll' && <span>{msg.content}</span>}
        {rollData && <RollResult data={rollData} />}
      </div>
    </div>
  );
}

export function ChatPanel() {
  const { roomState, client } = useTableStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = roomState?.chatHistory ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = () => {
    const text = input.trim();
    if (!text || !client) return;

    // Inline roll: /r 1d20+5
    if (text.startsWith('/r ') || text.startsWith('/roll ')) {
      const notation = text.replace(/^\/r(oll)?\s+/, '');
      client.send({ type: COMMANDS.ROLL_DICE, notation });
    } else if (text.startsWith('/me ')) {
      client.send({ type: COMMANDS.CHAT_MESSAGE, content: text.slice(4), isEmote: true });
    } else {
      client.send({ type: COMMANDS.CHAT_MESSAGE, content: text, isEmote: false });
    }

    setInput('');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-vtt-border">
        <h3 className="text-sm font-semibold text-vtt-text">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.senderId === user?.id}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-2 border-t border-vtt-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="input-field text-sm py-1.5"
            placeholder="/r 1d20+5 ou mensagem..."
            maxLength={2000}
          />
          <button onClick={send} className="btn-primary text-sm py-1.5 px-3 shrink-0">
            ↵
          </button>
        </div>
        <p className="text-vtt-muted text-xs mt-1">/r [dado] para rolar • /me para emote</p>
      </div>
    </div>
  );
}
