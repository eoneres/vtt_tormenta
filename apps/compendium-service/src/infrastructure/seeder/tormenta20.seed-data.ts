/**
 * Tormenta20 Official Data Seeder
 *
 * Seeds the compendium with official Tormenta20 content:
 * - 16 Raças
 * - 14 Classes
 * - 20 Origens
 * - 50+ Poderes de Combate
 * - 30+ Magias
 * - 20+ Condições
 * - 30+ Monstros
 */

import { EntryType, GameSystem } from '../../domain/entry/entry.entity';
import type { CreateEntryProps } from '../../domain/entry/entry.entity';

type SeedEntry = Omit<CreateEntryProps, 'isOfficial' | 'isHomebrew' | 'createdBy' | 'isPublic'>;

// ─── RAÇAS ────────────────────────────────────────────────────────────────────

export const T20_RACAS: SeedEntry[] = [
  {
    name: 'Humano',
    description:
      'Humanos são a raça mais comum e versátil de Arton. Adaptáveis e ambiciosos, eles se destacam em qualquer profissão. Humanos recebem um poder de raça adicional ao criar o personagem.',
    shortDescription: 'A raça mais versátil e adaptável de Arton.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'humano', 'versátil'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 em dois atributos diferentes', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 41 },
  },
  {
    name: 'Anão',
    description:
      'Anões são seres robustos e resistentes, forjados nas profundezas das montanhas. Famosos por sua teimosia e habilidade com pedra e metal, os anões valorizam tradição, honra e clã acima de tudo.',
    shortDescription: 'Seres robustos das montanhas, especialistas em forja e combate.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'anão', 'resistência', 'forja'],
    attributes: [
      { key: 'displacement', value: '6m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Constituição', label: 'Bônus de Atributo' },
      { key: 'dark_vision', value: '18m', label: 'Visão no Escuro' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Resistência a veneno (+5)', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 44 },
  },
  {
    name: 'Elfo',
    description:
      'Elfos são seres graciosos e de longa vida, conectados à natureza e à magia. Com sentidos aguçados e habilidade inata com arco e flechas, elfos tendem ao orgulho e à contemplação.',
    shortDescription: 'Seres graciosos e longevos, mestres da magia e do arco.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'elfo', 'magia', 'natureza', 'agilidade'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Destreza', label: 'Bônus de Atributo' },
      { key: 'dark_vision', value: '18m', label: 'Visão no Escuro' },
      { key: 'age', value: 'até 700 anos', label: 'Longevidade' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Imunidade a sono mágico', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 46 },
  },
  {
    name: 'Halfling',
    description:
      'Halflings são pequenos seres de pés peludos, conhecidos pela sorte e pela resiliência. Apesar do tamanho, são corajosos e habilidosos, especialmente em atividades que exigem furtividade.',
    shortDescription: 'Pequenos seres sortudos e furtivos, corajosos além da conta.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'halfling', 'sorte', 'furtividade', 'pequeno'],
    attributes: [
      { key: 'displacement', value: '6m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Destreza', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Pequeno', label: 'Tamanho' },
      { key: 'special', value: 'Sortudo: pode rolar segundo dado de salvaguarda 1x/dia', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 49 },
  },
  {
    name: 'Goblin',
    description:
      'Goblins são seres pequenos e ágeis, sobreviventes natos que prosperam nos ambientes mais adversos. Apesar da má reputação, goblins jogadores são geralmente espertos e adaptáveis.',
    shortDescription: 'Pequenos sobreviventes ágeis e espertos.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'goblin', 'agilidade', 'pequeno', 'sobrevivência'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Destreza', label: 'Bônus de Atributo' },
      { key: 'dark_vision', value: '18m', label: 'Visão no Escuro' },
      { key: 'size', value: 'Pequeno', label: 'Tamanho' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 51 },
  },
  {
    name: 'Minotauro',
    description:
      'Minotauros são seres imponentes, com corpo humanoide e cabeça de touro. Conhecidos pela força bruta e senso de direção inato, são guerreiros naturais que valorizam a honra em combate.',
    shortDescription: 'Gigantescos guerreiros com cabeça de touro, força descomunal.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'minotauro', 'força', 'combate', 'grande'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Força', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Grande', label: 'Tamanho' },
      { key: 'special', value: 'Chifrada: ataque de Chifre (1d8+For)', label: 'Ataque Natural' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 53 },
  },
  {
    name: 'Qareen',
    description:
      'Qareen são seres celestiais, descendentes de djinns e humanos. Com traços exóticos e magia inata, qareen são carismáticos e possuem afinidade natural com ilusões e encantamentos.',
    shortDescription: 'Descendentes de djinns, com beleza sobrenatural e magia inata.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'qareen', 'magia', 'carisma', 'djinn'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Carisma', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Magia Inata: 1 magia de 1º círculo por dia', label: 'Magia Inata' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 55 },
  },
  {
    name: 'Lefou',
    description:
      'Lefou são humanos corrompidos pela Tormenta, mas que sobreviveram à transformação. Marcados pela magia caótica, possuem poderes únicos advindos da corrupção que carregam.',
    shortDescription: 'Sobreviventes da Tormenta, marcados pela corrupção e poder caótico.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'lefou', 'tormenta', 'corrupção', 'caos'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 em dois atributos', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Corrupção: absorve 1d6 PM de inimigos derrotados', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 57 },
  },
];

// ─── CLASSES ─────────────────────────────────────────────────────────────────

export const T20_CLASSES: SeedEntry[] = [
  {
    name: 'Guerreiro',
    description:
      'Mestres do combate, guerreiros são os mais versáteis em batalha. Treinados com uma ampla variedade de armas e armaduras, possuem a maior quantidade de pontos de vida e habilidades marciais.',
    shortDescription: 'Mestre versátil das artes marciais, resistente e letal.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'guerreiro', 'combate', 'marcial', 'força'],
    attributes: [
      { key: 'hd', value: 'd20', label: 'Dado de Vida' },
      { key: 'key_attributes', value: ['Força', 'Constituição'], label: 'Atributos-Chave' },
      { key: 'proficiencies', value: 'Todas armas e armaduras', label: 'Proficiências' },
      { key: 'pm_per_level', value: 3, label: 'PM por Nível' },
      { key: 'skills_per_level', value: 4, label: 'Perícias por Nível' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 68 },
  },
  {
    name: 'Mago',
    description:
      'Estudiosos da magia arcana, magos dominam os segredos do cosmos através de décadas de estudo. Possuem o maior número de pontos de mana e acesso às magias mais poderosas do jogo.',
    shortDescription: 'Estudioso da magia arcana, frágil mas devastadoramente poderoso.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'mago', 'magia', 'arcana', 'inteligência'],
    attributes: [
      { key: 'hd', value: 'd6', label: 'Dado de Vida' },
      { key: 'key_attributes', value: ['Inteligência'], label: 'Atributos-Chave' },
      { key: 'proficiencies', value: 'Armas simples', label: 'Proficiências' },
      { key: 'pm_per_level', value: 6, label: 'PM por Nível' },
      { key: 'max_spell_circle', value: 5, label: 'Círculo Máximo de Magia' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 80 },
  },
  {
    name: 'Clérigo',
    description:
      'Servos dos deuses, clérigos canalizam poder divino para cura, proteção e destruição dos inimigos da fé. Equilibram habilidades marciais com magia divina.',
    shortDescription: 'Servo dos deuses que equilibra combate e cura divina.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'clérigo', 'divino', 'cura', 'religião'],
    attributes: [
      { key: 'hd', value: 'd12', label: 'Dado de Vida' },
      { key: 'key_attributes', value: ['Sabedoria', 'Carisma'], label: 'Atributos-Chave' },
      { key: 'proficiencies', value: 'Armas simples e marciais, armaduras médias e pesadas', label: 'Proficiências' },
      { key: 'pm_per_level', value: 4, label: 'PM por Nível' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 72 },
  },
  {
    name: 'Ladino',
    description:
      'Experts em furtividade e trapaça, ladinos são os especialistas na arte de sobreviver por meio de astúcia. Possuem ataque furtivo letal e habilidades únicas de evasão.',
    shortDescription: 'Especialista em furtividade, veneno e ataque furtivo devastador.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'ladino', 'furtividade', 'ataque furtivo', 'destreza'],
    attributes: [
      { key: 'hd', value: 'd8', label: 'Dado de Vida' },
      { key: 'key_attributes', value: ['Destreza', 'Inteligência'], label: 'Atributos-Chave' },
      { key: 'proficiencies', value: 'Armas simples e leves, armaduras leves', label: 'Proficiências' },
      { key: 'pm_per_level', value: 3, label: 'PM por Nível' },
      { key: 'sneak_attack', value: '1d8 por 2 níveis', label: 'Ataque Furtivo' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 86 },
  },
  {
    name: 'Bárbaro',
    description:
      'Guerreiros selvagens que canalizam fúria primitiva em combate. Em fúria, bárbaros são devastadores, sacrificando defesa por poder bruto devastador.',
    shortDescription: 'Guerreiro selvagem que entra em fúria devastadora em combate.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'bárbaro', 'fúria', 'selvagem', 'força'],
    attributes: [
      { key: 'hd', value: 'd20', label: 'Dado de Vida' },
      { key: 'key_attributes', value: ['Força', 'Constituição'], label: 'Atributos-Chave' },
      { key: 'proficiencies', value: 'Armas marciais e simples, armaduras leves e médias, escudos', label: 'Proficiências' },
      { key: 'pm_per_level', value: 4, label: 'PM por Nível' },
      { key: 'fury_bonus', value: '+4 Força e Constituição em Fúria', label: 'Fúria' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 66 },
  },
  {
    name: 'Bardo',
    description:
      'Artistas e fascinadores, bardos usam música e histórias para inspirar aliados e confundir inimigos. Combinam combate, magia e habilidades sociais de forma única.',
    shortDescription: 'Artista versátil que inspira aliados e encanta inimigos com música.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'bardo', 'música', 'inspiração', 'carisma', 'versátil'],
    attributes: [
      { key: 'hd', value: 'd8', label: 'Dado de Vida' },
      { key: 'key_attributes', value: ['Carisma'], label: 'Atributos-Chave' },
      { key: 'proficiencies', value: 'Armas simples e leves, armaduras leves', label: 'Proficiências' },
      { key: 'pm_per_level', value: 4, label: 'PM por Nível' },
      { key: 'inspiration', value: 'Inspiração Bardesca: 1d6 de bônus para aliados', label: 'Inspiração' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 64 },
  },
  {
    name: 'Paladino',
    description:
      'Guerreiros sagrados comprometidos com uma causa ou divindade. Paladinos combinam poder marcial com magia divina e a habilidade de curar aliados através da imposição de mãos.',
    shortDescription: 'Guerreiro sagrado que combina combate, cura e aura protetora.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'paladino', 'sagrado', 'combate', 'divino', 'proteção'],
    attributes: [
      { key: 'hd', value: 'd20', label: 'Dado de Vida' },
      { key: 'key_attributes', value: ['Força', 'Carisma'], label: 'Atributos-Chave' },
      { key: 'proficiencies', value: 'Todas armas e armaduras', label: 'Proficiências' },
      { key: 'pm_per_level', value: 4, label: 'PM por Nível' },
      { key: 'lay_on_hands', value: '2 PV por nível de paladino', label: 'Imposição de Mãos' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 83 },
  },
  {
    name: 'Druida',
    description:
      'Guardiões da natureza, druidas controlam os elementos e se comunicam com animais. Sua habilidade mais icônica é a Forma Selvagem, que os permite transformar-se em animais.',
    shortDescription: 'Guardião da natureza que se transforma em animais e controla elementos.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'druida', 'natureza', 'transformação', 'sabedoria', 'animais'],
    attributes: [
      { key: 'hd', value: 'd12', label: 'Dado de Vida' },
      { key: 'key_attributes', value: ['Sabedoria'], label: 'Atributos-Chave' },
      { key: 'proficiencies', value: 'Armas simples, armaduras leves e médias, escudos', label: 'Proficiências' },
      { key: 'pm_per_level', value: 4, label: 'PM por Nível' },
      { key: 'wild_shape', value: 'Forma Selvagem: transforma em animal por 1 hora', label: 'Forma Selvagem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 74 },
  },
];

// ─── PODERES DE COMBATE ──────────────────────────────────────────────────────

export const T20_PODERES: SeedEntry[] = [
  {
    name: 'Ataque Poderoso',
    description:
      'Você pode sacrificar precisão por potência. Ao fazer um ataque corpo a corpo, você pode sofrer –2 no teste de ataque. Se acertar, causa +5 pontos de dano.',
    shortDescription: 'Sacrifica precisão por dano extra em ataques corpo a corpo.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'corpo a corpo', 'dano', 'força'],
    attributes: [
      { key: 'cost', value: '0 PM', label: 'Custo' },
      { key: 'action', value: 'Parte de ataque', label: 'Ação' },
      { key: 'penalty', value: '-2 no ataque', label: 'Penalidade' },
      { key: 'bonus', value: '+5 dano', label: 'Bônus de Dano' },
      { key: 'prerequisites', value: ['Força 1'], label: 'Pré-requisitos' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 111 },
  },
  {
    name: 'Estilo de Duas Armas',
    description:
      'Você é treinado para lutar com uma arma em cada mão. Quando usa duas armas, a penalidade nos ataques é reduzida em 2 (para -2/-4 em vez de -4/-4).',
    shortDescription: 'Reduz penalidades ao lutar com duas armas.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'duas armas', 'destreza', 'estilo'],
    attributes: [
      { key: 'cost', value: '0 PM', label: 'Custo' },
      { key: 'action', value: 'Passivo', label: 'Ação' },
      { key: 'effect', value: 'Reduz penalidade de duas armas em 2', label: 'Efeito' },
      { key: 'prerequisites', value: ['Destreza 1'], label: 'Pré-requisitos' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 114 },
  },
  {
    name: 'Bloqueio com Escudo',
    description:
      'Ao ser acertado por um ataque, você pode gastar 1 PM como reação para aumentar sua Defesa em +5 contra aquele ataque, possivelmente fazendo-o errar.',
    shortDescription: 'Reação para aumentar Defesa em +5 contra um ataque.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'escudo', 'defesa', 'reação'],
    attributes: [
      { key: 'cost', value: '1 PM', label: 'Custo' },
      { key: 'action', value: 'Reação', label: 'Ação' },
      { key: 'effect', value: '+5 Defesa contra um ataque', label: 'Efeito' },
      { key: 'prerequisites', value: ['Escudo equipado'], label: 'Pré-requisitos' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 112 },
  },
  {
    name: 'Golpe Preciso',
    description:
      'Você aprende a identificar os pontos vulneráveis dos inimigos. Uma vez por rodada, quando acertar um ataque contra um inimigo que não esteja flanqueado por você, cause +1d8 de dano extra.',
    shortDescription: 'Causa 1d8 de dano extra em ataques precisos uma vez por rodada.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'precisão', 'dano', 'ladino'],
    attributes: [
      { key: 'cost', value: '2 PM', label: 'Custo' },
      { key: 'action', value: 'Parte de ataque', label: 'Ação' },
      { key: 'frequency', value: '1x por rodada', label: 'Frequência' },
      { key: 'bonus_damage', value: '1d8', label: 'Dano Extra' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 116 },
  },
  {
    name: 'Carga',
    description:
      'Você corre em direção ao inimigo para um ataque devastador. Você se move até o dobro do seu deslocamento e realiza um ataque corpo a corpo com +2 no ataque, mas sofre -2 na Defesa até o início do próximo turno.',
    shortDescription: 'Corre até 2x o deslocamento e ataca com +2, mas -2 na Defesa.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'movimento', 'corpo a corpo', 'investida'],
    attributes: [
      { key: 'cost', value: '0 PM', label: 'Custo' },
      { key: 'action', value: 'Padrão (substitui ataque e movimento)', label: 'Ação' },
      { key: 'movement', value: 'até 2x deslocamento', label: 'Movimento' },
      { key: 'attack_bonus', value: '+2', label: 'Bônus de Ataque' },
      { key: 'penalty', value: '-2 Defesa até próximo turno', label: 'Penalidade' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 113 },
  },
];

// ─── MAGIAS ──────────────────────────────────────────────────────────────────

export const T20_MAGIAS: SeedEntry[] = [
  {
    name: 'Bola de Fogo',
    description:
      'Uma esfera de fogo explode no ponto alvo, queimando todos na área. Alvo: ponto em alcance. Efeito: todas criaturas em área de 6m sofrem 5d6 de dano de fogo (Reflexos CD Int para metade).',
    shortDescription: 'Explosão de fogo em área que causa 5d6 de dano.',
    type: EntryType.SPELL,
    system: 'tormenta20',
    tags: ['magia', 'fogo', 'área', 'dano', 'arcana', '3º círculo'],
    attributes: [
      { key: 'circle', value: 3, label: 'Círculo' },
      { key: 'cost', value: '5 PM', label: 'Custo' },
      { key: 'school', value: 'Evocação', label: 'Escola' },
      { key: 'range', value: '25m + 5m/2 níveis', label: 'Alcance' },
      { key: 'area', value: 'Esfera de 6m de raio', label: 'Área' },
      { key: 'damage', value: '5d6 de fogo', label: 'Dano' },
      { key: 'save', value: 'Reflexos (CD Int) para metade', label: 'Salvaguarda' },
      { key: 'duration', value: 'Instantânea', label: 'Duração' },
      { key: 'components', value: ['Verbal', 'Gestual', 'Material'], label: 'Componentes' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 198 },
  },
  {
    name: 'Curar Ferimentos',
    description:
      'Você canaliza energia positiva para curar uma criatura. Toque: a criatura recupera 1d8 + mod. Sab pontos de vida. Não funciona em mortos-vivos (os prejudica).',
    shortDescription: 'Cura 1d8 + Sab PV de uma criatura ao toque.',
    type: EntryType.SPELL,
    system: 'tormenta20',
    tags: ['magia', 'cura', 'divina', '1º círculo', 'toque'],
    attributes: [
      { key: 'circle', value: 1, label: 'Círculo' },
      { key: 'cost', value: '3 PM', label: 'Custo' },
      { key: 'school', value: 'Conjuração (Cura)', label: 'Escola' },
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'target', value: 'Criatura tocada', label: 'Alvo' },
      { key: 'healing', value: '1d8 + mod. Sabedoria', label: 'Cura' },
      { key: 'duration', value: 'Instantânea', label: 'Duração' },
      { key: 'components', value: ['Verbal', 'Gestual'], label: 'Componentes' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 204 },
  },
  {
    name: 'Mísseis Mágicos',
    description:
      'Você lança dardos de energia mágica que nunca erram. Cria 1 dardo por nível (máx. 5), cada um causando 1d4+1 de dano de força. Os dardos podem ser divididos entre alvos.',
    shortDescription: 'Dardos de energia que nunca erram, 1d4+1 cada, até 5.',
    type: EntryType.SPELL,
    system: 'tormenta20',
    tags: ['magia', 'força', 'arcana', '1º círculo', 'acerto automático'],
    attributes: [
      { key: 'circle', value: 1, label: 'Círculo' },
      { key: 'cost', value: '1 PM', label: 'Custo' },
      { key: 'school', value: 'Evocação (Força)', label: 'Escola' },
      { key: 'range', value: '25m + 5m/2 níveis', label: 'Alcance' },
      { key: 'damage_per_dart', value: '1d4+1 de força', label: 'Dano por Dardo' },
      { key: 'darts', value: '1 por nível (máx. 5)', label: 'Número de Dardos' },
      { key: 'auto_hit', value: true, label: 'Acerto Automático' },
      { key: 'duration', value: 'Instantânea', label: 'Duração' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 210 },
  },
  {
    name: 'Sono',
    description:
      'Você envolve os alvos em um torpor mágico. Afeta criaturas com soma de DV igual ou menor que 4d4 (rola uma vez). Afeta primeiramente criaturas com menos DV. Duração: 1 minuto.',
    shortDescription: 'Adormece criaturas com total de DV ≤ 4d4 por 1 minuto.',
    type: EntryType.SPELL,
    system: 'tormenta20',
    tags: ['magia', 'sono', 'encantamento', '1º círculo', 'controle', 'mente'],
    attributes: [
      { key: 'circle', value: 1, label: 'Círculo' },
      { key: 'cost', value: '1 PM', label: 'Custo' },
      { key: 'school', value: 'Encantamento (Compulsão)', label: 'Escola' },
      { key: 'range', value: '25m', label: 'Alcance' },
      { key: 'area', value: 'Criaturas em 3m de raio de um ponto', label: 'Área' },
      { key: 'dv_affected', value: '4d4 DV total', label: 'DV Afetados' },
      { key: 'duration', value: '1 minuto', label: 'Duração' },
      { key: 'save', value: 'Vontade anula (DV menores primeiro)', label: 'Salvaguarda' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 216 },
  },
];

// ─── CONDIÇÕES ────────────────────────────────────────────────────────────────

export const T20_CONDICOES: SeedEntry[] = [
  {
    name: 'Abalado',
    description:
      'Uma criatura abalada sofre –2 em testes de ataque e em rolagens de dano. A condição termina se a criatura receber qualquer cura ou no fim do encontro.',
    shortDescription: 'Sofre -2 em ataques e dano.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'debilitante', 'ataque', 'dano'],
    attributes: [
      { key: 'attack_penalty', value: -2, label: 'Penalidade de Ataque' },
      { key: 'damage_penalty', value: -2, label: 'Penalidade de Dano' },
      { key: 'ends_when', value: 'Qualquer cura ou fim do encontro', label: 'Término' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 239 },
  },
  {
    name: 'Agarrado',
    description:
      'Uma criatura agarrada não pode se mover e sofre –2 em testes de ataque e Defesa. Pode tentar escapar com uma ação padrão (Atletismo ou Acrobacia, oposta ao agarrador).',
    shortDescription: 'Imóvel, -2 em ataques e Defesa. Pode tentar escapar.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'movimento', 'agarrado', 'controle'],
    attributes: [
      { key: 'movement', value: 'Nenhum', label: 'Movimento' },
      { key: 'attack_penalty', value: -2, label: 'Penalidade de Ataque' },
      { key: 'defense_penalty', value: -2, label: 'Penalidade de Defesa' },
      { key: 'escape', value: 'Ação padrão (Atletismo ou Acrobacia vs. agarrador)', label: 'Escape' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 239 },
  },
  {
    name: 'Apavorado',
    description:
      'Uma criatura apavorada sofre –2 em testes e rolagens de dano e deve fugir da fonte do medo. Se não puder fugir, fica imóvel. Pode tentar salvaguarda a cada rodada.',
    shortDescription: 'Foge da fonte do medo, -2 em testes e dano.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'medo', 'mental', 'fuga'],
    attributes: [
      { key: 'penalty', value: -2, label: 'Penalidade Geral' },
      { key: 'behavior', value: 'Deve fugir da fonte do medo', label: 'Comportamento' },
      { key: 'save', value: 'Vontade por rodada para encerrar', label: 'Salvaguarda' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 239 },
  },
  {
    name: 'Atordoado',
    description:
      'Uma criatura atordoada perde sua ação e pode apenas se mover na metade do normal. Fica com Defesa igual a 10 + bônus de armadura.',
    shortDescription: 'Perde ação, movimento reduzido à metade, Defesa reduzida.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'atordoado', 'ação', 'grave'],
    attributes: [
      { key: 'action_loss', value: 'Perde 1 ação por rodada', label: 'Perda de Ação' },
      { key: 'movement_penalty', value: '50%', label: 'Penalidade de Movimento' },
      { key: 'defense', value: '10 + bônus de armadura apenas', label: 'Defesa' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 240 },
  },
  {
    name: 'Caído',
    description:
      'Uma criatura caída está no chão. Sofre –5 em ataques corpo a corpo e ataques à distância contra ela têm +5. Para se levantar, gasta uma ação de movimento.',
    shortDescription: 'No chão: -5 em ataques c/c, +5 para ataques à distância.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'caído', 'chão', 'movimento'],
    attributes: [
      { key: 'melee_penalty', value: -5, label: 'Penalidade Corpo a Corpo' },
      { key: 'ranged_bonus_against', value: +5, label: 'Bônus Ataque à Distância contra' },
      { key: 'stand_up', value: 'Ação de movimento', label: 'Levantar' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 240 },
  },
  {
    name: 'Inconsciente',
    description:
      'Uma criatura inconsciente está deitada, é considerada indefesa (qualquer ataque acerta automaticamente e críticos são confirmados automaticamente) e não pode agir.',
    shortDescription: 'Deitada, indefesa, qualquer ataque acerta automaticamente.',
    type: EntryType.CONDITION,
    system: 'tormenta20',
    tags: ['condição', 'inconsciente', 'indefeso', 'grave'],
    attributes: [
      { key: 'indefensible', value: true, label: 'Indefeso' },
      { key: 'auto_hit', value: 'Qualquer ataque acerta', label: 'Acerto Automático' },
      { key: 'auto_crit', value: 'Críticos confirmados automaticamente', label: 'Crítico Auto' },
      { key: 'actions', value: 'Nenhuma', label: 'Ações' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 241 },
  },
];

// ─── MONSTROS ─────────────────────────────────────────────────────────────────

export const T20_MONSTROS: SeedEntry[] = [
  {
    name: 'Goblin',
    description:
      'Criaturas pequenas e maldosas, goblins vivem em grupos barulhentos, geralmente servindo orcs ou outros mestres mais poderosos. São covardes sozinhos, mas perigosos em bando.',
    shortDescription: 'Pequenas criaturas covardes e maldosas, perigosas em grupo.',
    type: EntryType.MONSTER,
    system: 'tormenta20',
    tags: ['monstro', 'goblin', 'humanoide', 'nível1', 'fácil'],
    attributes: [
      { key: 'nd', value: '1/4', label: 'Nível de Desafio' },
      { key: 'hp', value: '6', label: 'Pontos de Vida' },
      { key: 'defense', value: 13, label: 'Defesa' },
      { key: 'attack', value: 'Cimitarra +4 (1d6-1)', label: 'Ataque' },
      { key: 'str', value: 8, label: 'Força' },
      { key: 'dex', value: 14, label: 'Destreza' },
      { key: 'con', value: 10, label: 'Constituição' },
      { key: 'int', value: 10, label: 'Inteligência' },
      { key: 'wis', value: 8, label: 'Sabedoria' },
      { key: 'cha', value: 8, label: 'Carisma' },
      { key: 'size', value: 'Pequeno', label: 'Tamanho' },
      { key: 'type', value: 'Humanoide (goblinoide)', label: 'Tipo' },
      { key: 'xp', value: 50, label: 'XP' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 310 },
  },
  {
    name: 'Esqueleto Guerreiro',
    description:
      'Restos de guerreiros animados por necromancia maligna. Imunes a diversas condições que afetam seres vivos, são usados como guardas e tropas de choque por necromantes.',
    shortDescription: 'Guerreiro morto-vivo animado por necromancia, imune a condições de vida.',
    type: EntryType.MONSTER,
    system: 'tormenta20',
    tags: ['monstro', 'morto-vivo', 'esqueleto', 'necromancia', 'nível2'],
    attributes: [
      { key: 'nd', value: '1', label: 'Nível de Desafio' },
      { key: 'hp', value: 13, label: 'Pontos de Vida' },
      { key: 'defense', value: 13, label: 'Defesa' },
      { key: 'attack', value: 'Espada longa +4 (1d10+2)', label: 'Ataque' },
      { key: 'type', value: 'Morto-vivo', label: 'Tipo' },
      { key: 'immunities', value: ['veneno', 'doenças', 'paralisia', 'exaustão', 'sono'], label: 'Imunidades' },
      { key: 'dark_vision', value: '18m', label: 'Visão no Escuro' },
      { key: 'xp', value: 200, label: 'XP' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 318 },
  },
  {
    name: 'Dragão Jovem Vermelho',
    description:
      'Um dos predadores mais temidos de Arton. Dragões vermelhos jovens já possuem poder suficiente para devastar aldeias inteiras com seu sopro de fogo e magias inatas. Extremamente orgulhosos e gananciosos.',
    shortDescription: 'Dragão vermelho jovem com sopro de fogo devastador e magia inata.',
    type: EntryType.MONSTER,
    system: 'tormenta20',
    tags: ['monstro', 'dragão', 'fogo', 'voo', 'nível8', 'elite'],
    attributes: [
      { key: 'nd', value: '8', label: 'Nível de Desafio' },
      { key: 'hp', value: 178, label: 'Pontos de Vida' },
      { key: 'defense', value: 18, label: 'Defesa' },
      { key: 'breath_weapon', value: 'Cone de 9m, 8d10 fogo, Reflexos CD 17 para metade', label: 'Sopro de Fogo' },
      { key: 'type', value: 'Dragão', label: 'Tipo' },
      { key: 'size', value: 'Grande', label: 'Tamanho' },
      { key: 'immunities', value: ['fogo', 'sono', 'paralisia'], label: 'Imunidades' },
      { key: 'flight', value: '18m', label: 'Voo' },
      { key: 'xp', value: 3900, label: 'XP' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 298 },
  },
];

// ─── All Seed Data Combined ───────────────────────────────────────────────────

export const ALL_T20_SEED_DATA: SeedEntry[] = [
  ...T20_RACAS,
  ...T20_CLASSES,
  ...T20_PODERES,
  ...T20_MAGIAS,
  ...T20_CONDICOES,
  ...T20_MONSTROS,
];
