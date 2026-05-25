'use client';

/**
 * D&D 5e Sheet Editor — extraído do CharacterSheet.tsx do Ciclo 5
 * para permitir dynamic import (lazy loading quando systemId !== 'dnd5e').
 *
 * INSTRUÇÃO DE APLICAÇÃO:
 * Mova o conteúdo da função Dnd5eSheetEditor e todos os seus sub-componentes
 * do CharacterSheet.tsx do Ciclo 5 para este arquivo.
 * O CharacterSheet.tsx do Ciclo 6 já faz `import('./Dnd5eSheetEditor')`.
 *
 * Se preferir não refatorar agora, o CharacterSheet.tsx do Ciclo 5 continua
 * funcionando para D&D 5e — apenas o roteamento para T20 é o que está novo.
 *
 * Este arquivo serve como ponto de entrada explícito para o lazy import.
 */

export { default as Dnd5eSheetEditor } from './CharacterSheetDnd5e';

// Se não existir CharacterSheetDnd5e.tsx separado, use este barrel:
// export { Dnd5eSheetEditor } from './CharacterSheet.legacy';
//
// Na prática, o mais simples é renomear o componente interno do Ciclo 5
// de `Dnd5eSheetEditor` para export nomeado neste arquivo.
