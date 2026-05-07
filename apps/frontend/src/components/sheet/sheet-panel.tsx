'use client';

import { useTableStore } from '@/lib/store/table.store';
import { useCharacter, useUpdateSheet } from '@/lib/hooks/use-queries';
import { Tormenta20Sheet } from './tormenta20-sheet';
import { DnD5eSheet } from './dnd5e-sheet';

export function SheetPanel() {
  const { selectedTokenId, roomState } = useTableStore();
  const token = selectedTokenId ? roomState?.tokens.get(selectedTokenId) : null;
  const characterId = token?.characterId;

  const { data: character, isLoading } = useCharacter(characterId ?? '');
  const { mutate: updateSheet } = useUpdateSheet();

  if (!token) {
    return (
      <div className="flex items-center justify-center h-full text-vtt-muted text-sm">
        Selecione um token para ver a ficha
      </div>
    );
  }

  if (!characterId) {
    return (
      <div className="flex items-center justify-center h-full text-vtt-muted text-sm">
        Token sem personagem vinculado
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 bg-vtt-border/20 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!character) return null;

  const handleUpdate = (sheetData: Record<string, unknown>) => {
    updateSheet({ id: character.id, sheetData });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-vtt-border">
        <h3 className="text-sm font-semibold text-vtt-text truncate">{character.name}</h3>
        <p className="text-vtt-muted text-xs">{character.systemId}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {character.systemId === 'tormenta20' && (
          <Tormenta20Sheet
            characterId={character.id}
            sheetData={character.sheetData as never}
            systemId={character.systemId}
            onUpdate={handleUpdate}
          />
        )}
        {character.systemId === 'dnd5e' && (
          <DnD5eSheet
            characterId={character.id}
            sheetData={character.sheetData as never}
            onUpdate={handleUpdate}
          />
        )}
        {!['tormenta20', 'dnd5e'].includes(character.systemId) && (
          <div className="text-vtt-muted text-sm text-center py-8">
            Sistema {character.systemId} não suportado ainda
          </div>
        )}
      </div>
    </div>
  );
}
