'use client';

import { useCallback } from 'react';
import { useTableStore } from '@/lib/store/table.store';
import { useCharacter, useUpdateSheet, useDamageCharacter, useHealCharacter } from '@/lib/hooks/use-queries';
import { Tormenta20Sheet } from './tormenta20-sheet-v2';
import DnD5eSheet from './dnd5e-sheet';
import ShadowrunSheet from './shadowrun-sheet';
import { COMMANDS } from '@/lib/colyseus/commands';

const SYSTEM_LABELS: Record<string, string> = {
  tormenta20: '🐉 Tormenta20',
  dnd5e: '⚔️ D&D 5e',
  shadowrun: '🤖 Shadowrun 6e',
};

export function SheetPanel() {
  const { selectedTokenId, roomState, client } = useTableStore();
  const token = selectedTokenId ? roomState?.tokens.get(selectedTokenId) : null;
  const characterId = token?.characterId;

  const { data: character, isLoading } = useCharacter(characterId ?? '');
  const { mutate: updateSheet } = useUpdateSheet();
  const { mutate: damageChar } = useDamageCharacter();
  const { mutate: healChar } = useHealCharacter();

  const handleUpdate = useCallback((changes: Record<string, unknown>) => {
    if (!character) return;
    updateSheet({ id: character.id, sheetData: changes });
  }, [character, updateSheet]);

  const handleDamage = useCallback((amount: number) => {
    if (!character) return;
    damageChar({ id: character.id, amount });
    // Sync HP bar to token in realtime
    client?.send(COMMANDS.UPDATE_TOKEN_HP, {
      tokenId: selectedTokenId,
      delta: -amount,
    });
  }, [character, damageChar, client, selectedTokenId]);

  const handleHeal = useCallback((amount: number) => {
    if (!character) return;
    healChar({ id: character.id, amount });
    client?.send(COMMANDS.UPDATE_TOKEN_HP, {
      tokenId: selectedTokenId,
      delta: amount,
    });
  }, [character, healChar, client, selectedTokenId]);

  const handleSRRoll = useCallback((pool: number, limit: number | null, label: string) => {
    client?.send(COMMANDS.ROLL_DICE, {
      expression: `${pool}d6sr`,
      limit,
      label,
    });
  }, [client]);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500 px-4 text-center">
        <span className="text-3xl">↖</span>
        <p className="text-sm">Selecione um token para ver a ficha</p>
      </div>
    );
  }

  if (!characterId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500 px-4 text-center">
        <span className="text-3xl">🎭</span>
        <p className="text-sm">Token NPC — sem ficha vinculada</p>
        <p className="text-xs">{token.name}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 bg-slate-800/40 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!character) return null;

  const isOwner = character.userId === roomState?.players?.get('self');
  const isGm = roomState?.gmId === roomState?.players?.get('self');
  const canEdit = isOwner || isGm;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* System badge */}
      <div className="px-3 py-1.5 bg-slate-800/60 border-b border-slate-700 flex items-center justify-between shrink-0">
        <span className="text-xs text-slate-400">
          {SYSTEM_LABELS[character.systemId] ?? character.systemId}
        </span>
        {!canEdit && <span className="text-xs text-slate-600 italic">read-only</span>}
      </div>

      <div className="flex-1 overflow-hidden">
        {character.systemId === 'tormenta20' && (
          <Tormenta20Sheet
            characterId={character.id}
            sheetData={character.sheetData as any}
            canEdit={canEdit}
            onUpdate={handleUpdate as any}
          />
        )}
        {character.systemId === 'dnd5e' && (
          <DnD5eSheet
            characterId={character.id}
            sheetData={character.sheetData as any}
            canEdit={canEdit}
            onUpdate={handleUpdate as any}
            onDamage={handleDamage}
            onHeal={handleHeal}
          />
        )}
        {character.systemId === 'shadowrun' && (
          <ShadowrunSheet
            characterId={character.id}
            sheetData={character.sheetData as any}
            canEdit={canEdit}
            onUpdate={handleUpdate as any}
            onRollPool={handleSRRoll}
          />
        )}
        {!['tormenta20', 'dnd5e', 'shadowrun'].includes(character.systemId) && (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm text-center px-4">
            Sistema <strong className="text-slate-300 mx-1">{character.systemId}</strong> não suportado
          </div>
        )}
      </div>
    </div>
  );
}
