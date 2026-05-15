import { EntryType } from '../../domain/entry/entry.entity';
import type { CreateEntryProps } from '../../domain/entry/entry.entity';

type SeedEntry = Omit<CreateEntryProps, 'isOfficial' | 'isHomebrew' | 'createdBy' | 'isPublic'>;

// ─── Condições Tormenta20 (Expandidas) ─────────────────────────────────────────

export const T20_CONDICOES_EXPANDIDAS: SeedEntry[] = [
  {
    name: 'Abalado',
    description:
      'Uma criatura abalada sofre -2 em testes de ataque, perícia e resistência enquanto abalada. Abalado termina ao fim de seu próximo turno a menos que a condição seja renovada.',
    shortDescription: '-2 em testes de ataque, perícia e resistência.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'debilitante', 'mental'],
    attributes: [
      { key: 'effect', value: '-2 testes', label: 'Efeito' },
      { key: 'duration', value: 'Até fim do próximo turno', label: 'Duração' },
      { key: 'saves', value: 'Vontade reduz', label: 'Resistência' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 350 },
  },
  {
    name: 'Agarrado',
    description:
      'Uma criatura agarrada sua velocidade é reduzida a 0. A criatura pode tentar escapar como ação livre fazendo teste de Força ou Destreza contra o teste de quem a agarrou.',
    shortDescription: 'Velocidade 0. Pode escapar com teste Força/Destreza.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'movimento', 'combate'],
    attributes: [
      { key: 'effect', value: 'Velocidade 0', label: 'Efeito' },
      { key: 'escape', value: 'Teste Força vs agarrador', label: 'Escape' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 351 },
  },
  {
    name: 'Apavorado',
    description:
      'Uma criatura apavorada tem desvantagem em testes de Força enquanto conseguir ver a fonte do medo. A criatura não consegue se aproximar voluntariamente da fonte do medo.',
    shortDescription: 'Desvantagem Força, não se aproxima da fonte.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'mental', 'medo'],
    attributes: [
      { key: 'effect', value: 'Desvantagem Força', label: 'Efeito' },
      { key: 'movement', value: 'Não se aproxima da fonte', label: 'Movimento' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 352 },
  },
  {
    name: 'Atordoado',
    description:
      'Uma criatura atordoada não consegue realizar ações ou reações. Sua velocidade é 0. A criatura recebe desvantagem em testes de Defesa.',
    shortDescription: 'Sem ações, sem reações, desvantagem Defesa.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'incapacitação'],
    attributes: [
      { key: 'effect', value: 'Sem ações/reações, desvantagem Defesa', label: 'Efeito' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 353 },
  },
  {
    name: 'Caído',
    description:
      'Uma criatura caída fica deitada. Para ficar de pé, ela usa sua ação de movimento. Enquanto caída, sofre desvantagem em testes de ataque à distância.',
    shortDescription: 'Deitado. Levanta com ação de movimento, desvantagem à distância.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'movimento'],
    attributes: [
      { key: 'effect', value: 'Deitado, desvantagem ataque à distância', label: 'Efeito' },
      { key: 'standing', value: 'Levanta com ação de movimento', label: 'Levantamento' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 354 },
  },
  {
    name: 'Inconsciente',
    description:
      'Uma criatura inconsciente está inerte. Quando inconsciente, o PV da criatura não pode cair abaixo de 0. A criatura fica Desprevenida e não consegue se mover ou falar.',
    shortDescription: 'Inerte, indefeso, PV não cai abaixo de 0.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'incapacitação'],
    attributes: [
      { key: 'effect', value: 'Inerte, desprevenido', label: 'Efeito' },
      { key: 'stability', value: 'PV não cai abaixo de 0', label: 'Estabilidade' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 355 },
  },
  {
    name: 'Imobilizado',
    description:
      'Uma criatura imobilizada sua velocidade é reduzida a 0. Criaturas que a deixaram imobilizada precisam usar uma ação padrão para libertar ou manter a imobilização.',
    shortDescription: 'Velocidade 0. Precisa ação padrão para manter ou libertar.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'movimento', 'combate'],
    attributes: [
      { key: 'effect', value: 'Velocidade 0', label: 'Efeito' },
      { key: 'release', value: 'Ação padrão para manter/libertar', label: 'Liberação' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 356 },
  },
  {
    name: 'Cego',
    description:
      'Uma criatura cega sofre desvantagem em testes de ataque e seus ataques têm desvantagem contra ela. A criatura não consegue ver, portanto seus testes de Percepção que dependem de visão automaticamente falham.',
    shortDescription: 'Desvantagem ataque, ataques contra têm vantagem.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'sentidos'],
    attributes: [
      { key: 'effect', value: 'Desvantagem ataque, ataques contra vantagem', label: 'Efeito' },
      { key: 'vision', value: 'Não consegue ver', label: 'Sentidos' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 357 },
  },
  {
    name: 'Debilitado',
    description:
      'Uma criatura debilitada sofre redução de dano de 50%. Seu dano causado também é reduzido em 50%. Esta condição dura até o fim da próxima cena.',
    shortDescription: '-50% dano recebido e causado.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'fraqueza', 'dano'],
    attributes: [
      { key: 'effect', value: '-50% dano recebido e causado', label: 'Efeito' },
      { key: 'duration', value: 'Até fim da próxima cena', label: 'Duração' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 358 },
  },
  {
    name: 'Desprevenido',
    description:
      'Uma criatura desprevenida não consegue se defender adequadamente. Ataques contra ela têm vantagem. Ela sofre desvantagem em testes de Defesa.',
    shortDescription: 'Ataques têm vantagem, desvantagem Defesa.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'defesa'],
    attributes: [
      { key: 'effect', value: 'Vantagem ataques, desvantagem Defesa', label: 'Efeito' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 359 },
  },
  {
    name: 'Envenenado',
    description:
      'Uma criatura envenenada sofre -1 em testes de ataque e resistência. A condição termina se remover o veneno ou passar em teste de Fortitude (CD da fonte).',
    shortDescription: '-1 testes de ataque e resistência.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'veneno', 'debilitante'],
    attributes: [
      { key: 'effect', value: '-1 ataque e resistência', label: 'Efeito' },
      { key: 'cure', value: 'Remover veneno ou Fortitude', label: 'Cura' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 360 },
  },
  {
    name: 'Exaurido',
    description:
      'A exaustão tem 6 níveis. Quando você ganha exaustão, você sofre um nível. A maioria das condições que causam exaustão duram até você terminar um repouso longo. No 6º nível, você morre.',
    shortDescription: '6 níveis de exaustão. Nível 6 = morte.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'exaustão', 'severo'],
    attributes: [
      { key: 'levels', value: '6 níveis acumuláveis', label: 'Níveis' },
      { key: 'effect_1', value: 'Nível 1: Desvantagem testes de perícia', label: 'Nível 1' },
      { key: 'effect_2', value: 'Nível 2: Velocidade reduzida 50%', label: 'Nível 2' },
      { key: 'effect_3', value: 'Nível 3: Desvantagem testes de ataque/resistência', label: 'Nível 3' },
      { key: 'effect_4', value: 'Nível 4: PV máximo reduzido 50%', label: 'Nível 4' },
      { key: 'effect_5', value: 'Nível 5: Velocidade 0', label: 'Nível 5' },
      { key: 'effect_6', value: 'Nível 6: Morte', label: 'Nível 6' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 361 },
  },
  {
    name: 'Invisível',
    description:
      'Uma criatura invisível não consegue ser vista sem magia ou sentidos especiais. Ataques contra ela têm desvantagem, e seus ataques têm vantagem. A invisibilidade se dissipa quando atacar ou lançar magia.',
    shortDescription: 'Invisível. Ataques contra têm desvantagem.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'invisibilidade', 'sentidos'],
    attributes: [
      { key: 'effect', value: 'Não visível, ataques contra desvantagem', label: 'Efeito' },
      { key: 'break', value: 'Dissipa ao atacar/lançar magia', label: 'Rompimento' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 362 },
  },
  {
    name: 'Maldito',
    description:
      'Uma criatura maldita sofre -2 em todos os testes de ataque, resistência e perícia. A maldição também reduz o dano que o alvo causa em 2. Pode ser removida com magia de remoção de maldição.',
    shortDescription: '-2 em todos os testes, -2 dano causado.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'maldição', 'magia'],
    attributes: [
      { key: 'effect', value: '-2 testes, -2 dano causado', label: 'Efeito' },
      { key: 'cure', value: 'Magia de remoção de maldição', label: 'Cura' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 363 },
  },
  {
    name: 'Paralisado',
    description:
      'Uma criatura paralisada fica praticamente imóvel. Seus testes de resistência recebem -3. Ataques contra ela têm vantagem. Se paralisada por magia, pode fazer teste de Fortitude ao fim de cada turno para terminar.',
    shortDescription: 'Quase imóvel, ataques têm vantagem, -3 resistência.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'paralisia', 'movimento'],
    attributes: [
      { key: 'effect', value: '-3 resistência, vantagem ataques contra', label: 'Efeito' },
      { key: 'save', value: 'Fortitude ao fim do turno (se magia)', label: 'Salvação' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 364 },
  },
  {
    name: 'Reduzido',
    description:
      'Uma criatura reduzida diminui de tamanho pela metade em todas as dimensões. Seu peso é reduzido a 1/8. Seus dados de ataque e dano são reduzidos em um passo.',
    shortDescription: 'Metade do tamanho, -1 passo dano/ataque.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'tamanho', 'magia'],
    attributes: [
      { key: 'effect', value: 'Metade tamanho, -1 passo dano', label: 'Efeito' },
      { key: 'carrying', value: 'Carrego reduzido para 1/8', label: 'Carrego' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 365 },
  },
  {
    name: 'Silenciado',
    description:
      'Uma criatura silenciada não consegue falar ou lançar magias que requerem componentes vocais. A criatura sofre -2 em testes de Carisma relacionados a persuasão.',
    shortDescription: 'Sem voz. Não lança magias vocais, -2 Carisma (persuasão).',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'silência', 'magia'],
    attributes: [
      { key: 'effect', value: 'Sem voz, sem magia vocal, -2 Carisma', label: 'Efeito' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 366 },
  },
];

export const T20_CONDICOES_TOTAL = T20_CONDICOES_EXPANDIDAS;
