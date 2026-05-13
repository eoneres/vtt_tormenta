import { EntryType } from '../../domain/entry/entry.entity';
import type { CreateEntryProps } from '../../domain/entry/entry.entity';

type SeedEntry = Omit<CreateEntryProps, 'isOfficial' | 'isHomebrew' | 'createdBy' | 'isPublic'>;

// ─── Helper ────────────────────────────────────────────────────────────────────

function magia(
  name: string,
  description: string,
  shortDescription: string,
  circle: number,
  school: string,
  extraAttrs: Array<{ key: string; value: string | number; label: string }>,
  page: number,
): SeedEntry {
  return {
    name,
    description,
    shortDescription,
    type: EntryType.SPELL,
    system: 'tormenta20',
    tags: ['magia', `${circle}º-círculo`, school.toLowerCase()],
    attributes: [
      { key: 'circle', value: circle, label: 'Círculo' },
      { key: 'school', value: school, label: 'Escola' },
      ...extraAttrs,
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page },
  };
}

// ─── 1º Círculo ───────────────────────────────────────────────────────────────

export const T20_MAGIAS_1_CIRCULO: SeedEntry[] = [
  magia(
    'Luz',
    'Faz um objeto ou criatura emanar luz equivalente a uma tocha em um raio de 6m por 1 hora. Pode ser lançada em inimigo (Reflexos nega). Anula Escuridão do mesmo círculo.',
    'Cria luz de tocha por 1 hora.',
    1, 'Evocação',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'duration', value: '1 hora', label: 'Duração' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    200,
  ),
  magia(
    'Detectar Magia',
    'Por 1 minuto, você pode sentir a presença de magia a até 18m. Ao se concentrar 1 rodada em uma área ou objeto, sabe a escola de magia e a intensidade da aura mágica.',
    'Detecta presença e escola de magia próxima.',
    1, 'Adivinhação',
    [
      { key: 'range', value: '18m', label: 'Alcance' },
      { key: 'duration', value: '1 minuto (concentração)', label: 'Duração' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    201,
  ),
  magia(
    'Escudo',
    'Cria um escudo mágico invisível que concede +4 em Defesa contra ataques de projéteis e ataques físicos. Dura até o fim da cena.',
    '+4 Defesa contra ataques físicos e projéteis.',
    1, 'Abjuração',
    [
      { key: 'range', value: 'Pessoal', label: 'Alcance' },
      { key: 'duration', value: 'Até fim da cena', label: 'Duração' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    202,
  ),
  magia(
    'Mãos Flamejantes',
    'Um jato de chamas em cone de 4,5m. Alvos na área sofrem 1d6 de dano de fogo por nível do lançador (máx. 5d6). Reflexos reduz à metade.',
    'Cone de fogo 1d6/nível (máx 5d6), Reflexos reduz.',
    1, 'Evocação',
    [
      { key: 'range', value: 'Cone de 4,5m', label: 'Alcance' },
      { key: 'damage', value: '1d6 fogo por nível (máx 5d6)', label: 'Dano' },
      { key: 'save', value: 'Reflexos reduz à metade', label: 'Resistência' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    203,
  ),
  magia(
    'Enredar',
    'Plantas e trepadeiras numa área de 6m de raio em um ponto dentro de 36m se animam e tentam prender criaturas. Criaturas na área fazem Reflexos (CD Sab) ou ficam Imobilizadas. A cada rodada, repetem o teste para escapar.',
    'Imobiliza criaturas com plantas animadas, área de 6m.',
    1, 'Transmutação',
    [
      { key: 'range', value: '36m', label: 'Alcance' },
      { key: 'area', value: '6m de raio', label: 'Área' },
      { key: 'save', value: 'Reflexos ou Imobilizado', label: 'Resistência' },
      { key: 'duration', value: '1 minuto (concentração)', label: 'Duração' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    204,
  ),
  magia(
    'Amigo dos Animais',
    'Uma criatura animal de até Grandes com ND ≤ metade do seu nível considera você amigo. Não ataca você e pode ser comandada com ordens simples por 1 hora.',
    'Encanta animal de até Grande para ser seu amigo.',
    1, 'Encantamento',
    [
      { key: 'range', value: '9m', label: 'Alcance' },
      { key: 'duration', value: '1 hora', label: 'Duração' },
      { key: 'save', value: 'Vontade anula', label: 'Resistência' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    205,
  ),
  magia(
    'Ventriloquismo',
    'Você faz sua voz parecer vir de qualquer ponto a até 18m. Outros podem fazer testes de Percepção (CD 20) para detectar a ilusão.',
    'Projeta sua voz a qualquer ponto em 18m.',
    1, 'Ilusão',
    [
      { key: 'range', value: '18m', label: 'Alcance' },
      { key: 'duration', value: '1 minuto', label: 'Duração' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    206,
  ),
  magia(
    'Raio de Gelo',
    'Um raio de gelo atinge um alvo a até 27m causando 1d6 de dano de frio + 1d6 por 2 níveis (máx. 4d6). Se causar dano, o alvo reduz seu deslocamento em 3m por 1 rodada.',
    'Raio de gelo 1d6+1d6/2níveis, reduz deslocamento.',
    1, 'Evocação',
    [
      { key: 'range', value: '27m', label: 'Alcance' },
      { key: 'damage', value: '1d6 + 1d6/2 níveis frio (máx 4d6)', label: 'Dano' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    207,
  ),
  magia(
    'Escuridão',
    'Cria escuridão sobrenatural em uma área de 9m de raio. Fontes de luz não-mágicas são apagadas. Visão no escuro normal não funciona, apenas Visão às Cegas.',
    'Cria escuridão sobrenatural em 9m de raio.',
    1, 'Evocação',
    [
      { key: 'range', value: '27m', label: 'Alcance' },
      { key: 'area', value: '9m de raio', label: 'Área' },
      { key: 'duration', value: '1 minuto', label: 'Duração' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    208,
  ),
  magia(
    'Armadura Mágica',
    'Veste o alvo com armadura mágica etérea que fornece +4 de bônus em Defesa. Não se acumula com armaduras físicas, mas funciona com escudos.',
    '+4 Defesa por armadura mágica, não requer armadura física.',
    1, 'Abjuração',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'defense_bonus', value: '+4 Defesa', label: 'Bônus de Defesa' },
      { key: 'duration', value: '1 hora', label: 'Duração' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    209,
  ),
];

// ─── 2º Círculo ───────────────────────────────────────────────────────────────

export const T20_MAGIAS_2_CIRCULO: SeedEntry[] = [
  magia(
    'Invisibilidade',
    'O alvo e tudo que carrega fica invisível por 1 minuto ou até atacar. Enquanto invisível, recebe +10 em testes de Furtividade e não pode ser alvo de ataques diretos.',
    'Torna o alvo invisível por 1 minuto.',
    2, 'Ilusão',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'duration', value: '1 minuto ou até atacar', label: 'Duração' },
      { key: 'pm_cost', value: 3, label: 'Custo PM' },
    ],
    210,
  ),
  magia(
    'Teia',
    'Cria uma massa pegajosa de teias mágicas em cubo de 6m. Criaturas na área fazem Força (CD Int) ou ficam Imobilizadas. A área é difícil mesmo para quem escapa.',
    'Teia que imobiliza em cubo de 6m.',
    2, 'Conjuração',
    [
      { key: 'range', value: '27m', label: 'Alcance' },
      { key: 'area', value: 'Cubo de 6m', label: 'Área' },
      { key: 'save', value: 'Força ou Imobilizado', label: 'Resistência' },
      { key: 'duration', value: '10 minutos', label: 'Duração' },
      { key: 'pm_cost', value: 3, label: 'Custo PM' },
    ],
    211,
  ),
  magia(
    'Força do Touro',
    'O alvo recebe +4 de bônus em Força por 1 minuto. Bônus em dano corpo a corpo, capacidade de carga e testes de Força.',
    '+4 Força por 1 minuto.',
    2, 'Transmutação',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'str_bonus', value: '+4 Força', label: 'Bônus Força' },
      { key: 'duration', value: '1 minuto', label: 'Duração' },
      { key: 'pm_cost', value: 3, label: 'Custo PM' },
    ],
    212,
  ),
  magia(
    'Raio Relampejante',
    'Um raio de eletricidade atinge um alvo causando 1d6 de dano elétrico por nível (máx. 10d6). Vítimas em armadura metálica recebem -2 no teste de Reflexos.',
    'Raio elétrico 1d6/nível (máx 10d6).',
    2, 'Evocação',
    [
      { key: 'range', value: '27m', label: 'Alcance' },
      { key: 'damage', value: '1d6 elétrico por nível (máx 10d6)', label: 'Dano' },
      { key: 'save', value: 'Reflexos reduz à metade', label: 'Resistência' },
      { key: 'pm_cost', value: 3, label: 'Custo PM' },
    ],
    213,
  ),
  magia(
    'Sugestão',
    'Você sussurra uma sugestão razoável para uma criatura inteligente. Ela deve fazer Vontade (CD Car) ou seguir a sugestão por 1 hora. Sugestões obviamente prejudiciais são anuladas automaticamente.',
    'Força criatura a seguir uma sugestão razoável.',
    2, 'Encantamento',
    [
      { key: 'range', value: '9m', label: 'Alcance' },
      { key: 'duration', value: '1 hora', label: 'Duração' },
      { key: 'save', value: 'Vontade anula', label: 'Resistência' },
      { key: 'pm_cost', value: 3, label: 'Custo PM' },
    ],
    214,
  ),
  magia(
    'Forma Elemental Menor',
    'Você assume a forma de um pequeno elemental (ar, terra, fogo ou água). Ganha traços elementais, movimento especial e imunidades por 1 minuto.',
    'Transforma-se em elemental menor por 1 minuto.',
    2, 'Transmutação',
    [
      { key: 'range', value: 'Pessoal', label: 'Alcance' },
      { key: 'duration', value: '1 minuto', label: 'Duração' },
      { key: 'pm_cost', value: 3, label: 'Custo PM' },
    ],
    215,
  ),
];

// ─── 3º Círculo ───────────────────────────────────────────────────────────────

export const T20_MAGIAS_3_CIRCULO: SeedEntry[] = [
  magia(
    'Relâmpago',
    'Um raio em linha de 27m atinge todos na linha. Criaturas na linha sofrem 1d6 por nível de dano elétrico (máx. 10d6). Reflexos reduz à metade.',
    'Raio em linha 1d6/nível elétrico, máx 10d6.',
    3, 'Evocação',
    [
      { key: 'range', value: 'Linha de 27m', label: 'Alcance' },
      { key: 'damage', value: '1d6 elétrico/nível (máx 10d6)', label: 'Dano' },
      { key: 'save', value: 'Reflexos reduz', label: 'Resistência' },
      { key: 'pm_cost', value: 5, label: 'Custo PM' },
    ],
    220,
  ),
  magia(
    'Dissipar Magia',
    'Cancela um efeito mágico de até 3º círculo em uma criatura ou área. Para efeitos de círculo maior, role 1d20 + nível ≥ 11 + 2 por círculo acima do 3º.',
    'Cancela efeito mágico de até 3º círculo.',
    3, 'Abjuração',
    [
      { key: 'range', value: '27m', label: 'Alcance' },
      { key: 'check', value: '1d20 + nível ≥ 11 + 2 por círculo extra', label: 'Teste para círculos maiores' },
      { key: 'pm_cost', value: 5, label: 'Custo PM' },
    ],
    221,
  ),
  magia(
    'Falar com os Mortos',
    'Você pode fazer até 3 perguntas ao espírito de um cadáver morto há menos de 1 semana. O espírito só responde o que sabia em vida e tem direito a teste de Vontade para mentir.',
    'Faz 3 perguntas ao espírito de um morto recente.',
    3, 'Necromancia',
    [
      { key: 'range', value: 'Toque (cadáver)', label: 'Alcance' },
      { key: 'duration', value: '10 minutos', label: 'Duração' },
      { key: 'pm_cost', value: 5, label: 'Custo PM' },
    ],
    222,
  ),
  magia(
    'Voo',
    'O alvo pode voar à velocidade de 18m com manobra III por 1 minuto por nível.',
    'Voa a 18m por 1 minuto/nível.',
    3, 'Transmutação',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'speed', value: '18m, manobra III', label: 'Velocidade de Voo' },
      { key: 'duration', value: '1 minuto por nível', label: 'Duração' },
      { key: 'pm_cost', value: 5, label: 'Custo PM' },
    ],
    223,
  ),
  magia(
    'Cura Moderada',
    'Cura 2d8 + nível de PV em uma criatura viva. Custa mais PM que Curar Ferimentos mas cura mais.',
    'Cura 2d8 + nível de PV.',
    3, 'Evocação',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'healing', value: '2d8 + nível', label: 'Cura' },
      { key: 'pm_cost', value: 5, label: 'Custo PM' },
    ],
    224,
  ),
];

// ─── 4º Círculo ───────────────────────────────────────────────────────────────

export const T20_MAGIAS_4_CIRCULO: SeedEntry[] = [
  magia(
    'Pedra para Carne',
    'Transforma até 1 metro cúbico de pedra em carne mole ou reverte a petrificação de uma criatura. Para criaturas petrificadas: Vontade anula.',
    'Reverte petrificação ou transforma pedra em carne.',
    4, 'Transmutação',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'save', value: 'Vontade anula (para criaturas)', label: 'Resistência' },
      { key: 'pm_cost', value: 7, label: 'Custo PM' },
    ],
    230,
  ),
  magia(
    'Banimento',
    'Envia uma criatura extraplanar de volta ao plano de origem. A criatura faz Vontade (CD Int ou Sab) ou é banida imediatamente. Criaturas com mais DV que seu nível recebem +4 no teste.',
    'Bane criatura extraplanar de volta ao plano de origem.',
    4, 'Abjuração',
    [
      { key: 'range', value: '27m', label: 'Alcance' },
      { key: 'save', value: 'Vontade anula', label: 'Resistência' },
      { key: 'pm_cost', value: 7, label: 'Custo PM' },
    ],
    231,
  ),
  magia(
    'Parede de Fogo',
    'Conjura uma parede de chamas de até 18m de comprimento e 4m de altura. Criaturas que atravessam sofrem 2d6 de dano de fogo. Criaturas no lado de trás sofrem 1d6/rodada.',
    'Parede de fogo de 18m, 2d6 ao atravessar.',
    4, 'Evocação',
    [
      { key: 'range', value: '27m', label: 'Alcance' },
      { key: 'damage', value: '2d6 fogo ao atravessar; 1d6/rodada no lado de trás', label: 'Dano' },
      { key: 'duration', value: '1 minuto (concentração)', label: 'Duração' },
      { key: 'pm_cost', value: 7, label: 'Custo PM' },
    ],
    232,
  ),
  magia(
    'Confusão',
    'Afeta criaturas num raio de 4,5m. Criaturas afetadas rolam 1d4 por rodada: 1=paradas, 2=movem aleatoriamente, 3=atacam aliado próximo, 4=agem normalmente. Vontade reduz duração.',
    'Criaturas em área agem aleatoriamente por rodadas.',
    4, 'Encantamento',
    [
      { key: 'range', value: '27m', label: 'Alcance' },
      { key: 'area', value: '4,5m de raio', label: 'Área' },
      { key: 'duration', value: '1 rodada/nível', label: 'Duração' },
      { key: 'save', value: 'Vontade reduz duração à metade', label: 'Resistência' },
      { key: 'pm_cost', value: 7, label: 'Custo PM' },
    ],
    233,
  ),
];

// ─── 5º Círculo ───────────────────────────────────────────────────────────────

export const T20_MAGIAS_5_CIRCULO: SeedEntry[] = [
  magia(
    'Comet',
    'Um cometa de energia mágica cai em um ponto a até 45m. Todos numa área de 9m de raio sofrem 1d6 por nível de dano de fogo (máx 15d6). Reflexos reduz à metade. Deixa crateras no terreno.',
    'Cometa de fogo em área, 1d6/nível (máx 15d6).',
    5, 'Evocação',
    [
      { key: 'range', value: '45m', label: 'Alcance' },
      { key: 'area', value: '9m de raio', label: 'Área' },
      { key: 'damage', value: '1d6 fogo/nível (máx 15d6)', label: 'Dano' },
      { key: 'save', value: 'Reflexos reduz', label: 'Resistência' },
      { key: 'pm_cost', value: 9, label: 'Custo PM' },
    ],
    240,
  ),
  magia(
    'Ressurreição',
    'Revive uma criatura morta há no máximo 10 anos. A criatura retorna com 1 PV e perde 1 ponto em um atributo à sua escolha (permanentemente). Requer o corpo intacto.',
    'Revive morto de até 10 anos, corpo necessário.',
    5, 'Necromancia',
    [
      { key: 'range', value: 'Toque (corpo)', label: 'Alcance' },
      { key: 'casting_time', value: '1 hora', label: 'Tempo de Conjuração' },
      { key: 'cost', value: '1000 TO em componentes + 9 PM', label: 'Custo' },
      { key: 'pm_cost', value: 9, label: 'Custo PM' },
    ],
    241,
  ),
  magia(
    'Teleporte',
    'Transporta você e até 8 criaturas voluntárias a qualquer local no mundo que você já visitou. Chance de precisão baseada em familiaridade com o destino.',
    'Teleporta grupo a local conhecido no mundo.',
    5, 'Conjuração',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'targets', value: 'Você + até 8 criaturas', label: 'Alvos' },
      { key: 'pm_cost', value: 9, label: 'Custo PM' },
    ],
    242,
  ),
  magia(
    'Praga',
    'Infecta o alvo com uma doença mágica virulenta. Ele deve fazer Fortitude (CD Int/Sab) diariamente ou perder 1d4 de um atributo físico. A doença cura-se com Curar Doenças.',
    'Infecta alvo com doença que drena atributos diariamente.',
    5, 'Necromancia',
    [
      { key: 'range', value: '9m', label: 'Alcance' },
      { key: 'save', value: 'Fortitude reduz/nega', label: 'Resistência' },
      { key: 'duration', value: 'Até curar', label: 'Duração' },
      { key: 'pm_cost', value: 9, label: 'Custo PM' },
    ],
    243,
  ),
  magia(
    'Dominar Monstro',
    'Domina completamente uma criatura de qualquer tipo. Ela age como você ordena mentalmente. Vontade anula. Podem refazer o teste a cada semana. Dura 1 dia/nível.',
    'Domina completamente qualquer criatura por 1 dia/nível.',
    5, 'Encantamento',
    [
      { key: 'range', value: '27m', label: 'Alcance' },
      { key: 'duration', value: '1 dia/nível', label: 'Duração' },
      { key: 'save', value: 'Vontade anula (repetir semanalmente)', label: 'Resistência' },
      { key: 'pm_cost', value: 9, label: 'Custo PM' },
    ],
    244,
  ),
];

// ─── Rituais ──────────────────────────────────────────────────────────────────

export const T20_RITUAIS: SeedEntry[] = [
  {
    name: 'Comunhão',
    description:
      'Ritual de 1 hora que permite ao lançador fazer 3 perguntas à sua divindade. As respostas são diretas mas concisas. Só pode ser realizado uma vez por semana. Requer altar dedicado à divindade.',
    shortDescription: 'Faz 3 perguntas à divindade, uma vez por semana.',
    type: EntryType.RITUAL,
    system: 'tormenta20',
    tags: ['ritual', 'divino', 'adivinhação', 'divindade'],
    attributes: [
      { key: 'casting_time', value: '1 hora', label: 'Tempo de Ritual' },
      { key: 'cooldown', value: '1 semana', label: 'Recarga' },
      { key: 'pm_cost', value: 6, label: 'Custo PM' },
      { key: 'components', value: 'Altar sagrado, oferendas (100TO)', label: 'Componentes' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 250 },
  },
  {
    name: 'Círculo de Proteção',
    description:
      'Ritual de 10 minutos que cria um círculo mágico de 6m de raio. Criaturas extraplanares não podem entrar voluntariamente. Criaturas dentro recebem +2 em testes contra magia extraplanar. Dura 1 hora.',
    shortDescription: 'Cria círculo que bloqueia entrada de seres extraplanares.',
    type: EntryType.RITUAL,
    system: 'tormenta20',
    tags: ['ritual', 'proteção', 'abjuração', 'extraplanar'],
    attributes: [
      { key: 'casting_time', value: '10 minutos', label: 'Tempo de Ritual' },
      { key: 'area', value: '6m de raio', label: 'Área' },
      { key: 'duration', value: '1 hora', label: 'Duração' },
      { key: 'pm_cost', value: 4, label: 'Custo PM' },
      { key: 'components', value: 'Pó de prata (25TO)', label: 'Componentes' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 251 },
  },
  {
    name: 'Consagrar',
    description:
      'Ritual de 1 hora que torna uma área de até 18m de raio sagrada a uma divindade. Mortos-vivos na área recebem -2 em testes. Criaturas da fé recebem +1 em testes. Dura até ser dissipado.',
    shortDescription: 'Consagra área a uma divindade, penalizando mortos-vivos.',
    type: EntryType.RITUAL,
    system: 'tormenta20',
    tags: ['ritual', 'sagrado', 'divino', 'área'],
    attributes: [
      { key: 'casting_time', value: '1 hora', label: 'Tempo de Ritual' },
      { key: 'area', value: '18m de raio', label: 'Área' },
      { key: 'duration', value: 'Permanente (até ser dissipado)', label: 'Duração' },
      { key: 'pm_cost', value: 8, label: 'Custo PM' },
      { key: 'components', value: 'Incenso sagrado (200TO)', label: 'Componentes' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 252 },
  },
  {
    name: 'Invocar Familiar',
    description:
      'Ritual de 1 hora que convoca um animal pequeno como familiar. O familiar tem INT 6, pode se comunicar telepaticamente com o lançador em 1,5km. Compartilha sentidos quando o lançador se concentra.',
    shortDescription: 'Invoca um familiar animal com comunicação telepática.',
    type: EntryType.RITUAL,
    system: 'tormenta20',
    tags: ['ritual', 'conjuração', 'familiar', 'animal'],
    attributes: [
      { key: 'casting_time', value: '1 hora', label: 'Tempo de Ritual' },
      { key: 'pm_cost', value: 5, label: 'Custo PM' },
      { key: 'components', value: 'Ingredientes raros (100TO)', label: 'Componentes' },
      { key: 'duration', value: 'Permanente (até familiar morrer)', label: 'Duração' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 253 },
  },
  {
    name: 'Fabricar',
    description:
      'Ritual de 8 horas que transforma matéria-prima em um objeto manufaturado. O lançador deve ter conhecimento sobre como o objeto é feito. Pode criar objetos de até 9kg de material por nível.',
    shortDescription: 'Transforma matéria-prima em objeto manufaturado em 8 horas.',
    type: EntryType.RITUAL,
    system: 'tormenta20',
    tags: ['ritual', 'transmutação', 'criação', 'artesanato'],
    attributes: [
      { key: 'casting_time', value: '8 horas', label: 'Tempo de Ritual' },
      { key: 'pm_cost', value: 6, label: 'Custo PM' },
      { key: 'limit', value: '9kg de material por nível do lançador', label: 'Limite' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 254 },
  },
];

// ─── Export combinado ─────────────────────────────────────────────────────────

export const T20_TODAS_MAGIAS: SeedEntry[] = [
  ...T20_MAGIAS_1_CIRCULO,
  ...T20_MAGIAS_2_CIRCULO,
  ...T20_MAGIAS_3_CIRCULO,
  ...T20_MAGIAS_4_CIRCULO,
  ...T20_MAGIAS_5_CIRCULO,
  ...T20_RITUAIS,
];
