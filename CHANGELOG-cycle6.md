# VTT Platform — Ciclo 6: Tormenta20

**Data:** 2026-05-23  
**Foco:** Suporte completo a Tormenta20 — ficha visual, mecânicas corretas, integração ao sistema.

---

## Problema resolvido

Antes do Ciclo 6, o sistema `tormenta20` caía no editor JSON genérico.  
Após o Ciclo 6, `tormenta20` tem ficha visual completa, com todas as mecânicas corretas do T20.

---

## Arquivos entregues

```
vtt-cycle6/
├── frontend/src/components/sheet/
│   ├── tormenta20-types.ts          # Tipos, dados de referência, fórmulas
│   ├── Tormenta20Sheet.tsx          # Ficha visual completa (7 abas)
│   ├── CharacterSheet.tsx           # Roteador atualizado: T20 → D&D5e → genérico
│   └── Dnd5eSheetEditor.ts          # Barrel para lazy import do D&D5e
├── frontend/src/lib/
│   └── systems.ts                   # Constante centralizada de sistemas
├── frontend/src/components/dashboard/
│   └── NewCampaignModal.tsx         # Modal de nova campanha com T20 pré-selecionado
└── campaign-service/src/infrastructure/postgres/migrations/
    └── 1716480000000-AddTormenta20SystemId.ts  # Migration (só se system_id for ENUM)
```

---

## Ficha Tormenta20 — mecânicas implementadas

### Fórmulas corretas T20

| Mecânica | Fórmula implementada |
|----------|---------------------|
| Modificador de atributo | `floor(valor / 3) − 2` (não é `/2 − 5` como D&D) |
| Bônus de perícia | `mod(atributo) + graduação + outros − penalidade` |
| Teste de resistência | `mod(atributo base) + bônus de classe + override opcional` |

### Aba Atributos
- 6 atributos (FOR/DES/CON/INT/SAB/CAR) com modificadores calculados automaticamente pela fórmula T20
- Seletores de raça (12 raças do T20), classe (18 classes), origem (27 origens)
- Divindade, alinhamento, nível, XP, deslocamento em metros, tamanho
- Testes de Resistência: Fortitude (CON), Reflexos (DES), Vontade (SAB) com bônus de classe editável + campo de override

### Aba Perícias
- **30 perícias** do T20 completas com atributo governante correto
- Marcação **Somente Treinado** (ST) — perícia bloqueada se graduação = 0
- Graduação numérica: 0 / 2 / 4 / 6 / 8 / 10 (dropdown com label Destreinado/Treinado/Veterano/Épico)
- Campo de bônus extras e penalidade de armadura por perícia
- Total calculado automaticamente, realçado em âmbar quando ≥ +10

### Aba Combate
- PV máximo / atual / temporário
- Defesa com override manual (10 + DES + armadura + outros)
- Redução de Dano (RD)
- PM máximo / atual
- Dado de vida + dados restantes
- Tabela de ataques: nome, tipo (C/C / distância / magia), bônus, dano, tipo de dano, crítico (`20/×2`), alcance

### Aba Magias
- PM máximo / atual / círculo máximo
- Magias por círculo (1º–5º arcano, 1º–4º divino)
- Por magia: nome, escola, execução, alcance, alvo, duração, resistência, custo em PM, descrição
- Flag de "preparada" (âmbar = preparada)

### Aba Poderes
- Tipos: combate, magia, destino, tormenta, origem, classe, outro
- Por poder: nome, tipo, pré-requisito, descrição
- Cards em grid 2 colunas com cor por tipo

### Aba Equipamento
- **Tinacoins**: TP / TO / TPrata / Touro / TL
- Lista de itens com quantidade, bônus (ex: "+2 Defesa"), notas

### Aba História
- Aparência física (idade, altura, peso, olhos, cabelo, pele)
- Personalidade, descrição física, histórico/backstory, anotações

---

## CharacterSheet.tsx — roteamento por systemId

```
systemId === 'tormenta20' → Tormenta20Sheet   (novo, Ciclo 6)
systemId === 'dnd5e'      → Dnd5eSheetEditor  (Ciclo 5, lazy import)
qualquer outro            → GenericSheetEditor (JSON bruto)
```

O D&D 5e agora é carregado via `dynamic import` — não aumenta o bundle de usuários T20.

---

## sistemas.ts — constante centralizada

`/frontend/src/lib/systems.ts` — importar em qualquer select de sistema:

```ts
import { SYSTEMS, systemLabel } from '@/lib/systems';
```

Sistemas com `hasSheet: true` (ficha visual): `tormenta20`, `dnd5e`.  
Sistemas com `hasSheet: false`: Pathfinder 2e, Call of Cthulhu, Vampire 5e, Outros.

---

## NewCampaignModal.tsx — Tormenta20 pré-selecionado

Modal de criação de campanha com:
- Grid de seleção de sistema — T20 marcado por padrão
- Badge "✓ Ficha visual" nos sistemas com ficha dedicada
- Seletor rápido de max players (3/4/5/6/8) + campo livre
- Integra com `POST /campaigns`

**Instrução de integração no dashboard:**  
Substituir o form inline atual por `<NewCampaignModal open={...} onClose={...} onCreated={...} />`.

---

## Como aplicar

```bash
# 1. Copiar arquivos
cp -r vtt-cycle6/* .

# 2. Migration (só se system_id for ENUM no banco — provavelmente não é)
cd campaign-service
npx typeorm migration:run -d src/data-source.ts

# 3. Ao criar campanha, selecionar "Tormenta20" no modal (já pré-selecionado)
# 4. Ao criar personagem, systemId será herdado da campanha automaticamente
```

---

## Estado após Ciclo 6 — T20 100% jogável

| Feature | Status |
|---------|--------|
| Mesa de jogo (tokens, iniciativa, turnos, dados, fog of war) | ✅ |
| Chat com dice roller | ✅ |
| Upload de mapas e avatares | ✅ |
| Ficha T20 com mecânicas corretas | ✅ **NOVO** |
| 30 perícias T20 com graduação | ✅ **NOVO** |
| PM (pontos de mana) | ✅ **NOVO** |
| Magias por círculo | ✅ **NOVO** |
| Poderes T20 | ✅ **NOVO** |
| Tinacoins | ✅ **NOVO** |
| Fort/Ref/Von com fórmula correta | ✅ **NOVO** |
| Modificadores T20 (floor/3 − 2) | ✅ **NOVO** |
| Criação de campanha com T20 pré-selecionado | ✅ **NOVO** |
