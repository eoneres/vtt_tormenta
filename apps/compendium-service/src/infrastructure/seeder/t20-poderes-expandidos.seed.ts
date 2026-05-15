import { EntryType } from '../../domain/entry/entry.entity';
import type { CreateEntryProps } from '../../domain/entry/entry.entity';

type SeedEntry = Omit<CreateEntryProps, 'isOfficial' | 'isHomebrew' | 'createdBy' | 'isPublic'>;

// ─── Poderes de Destino (Novos) ────────────────────────────────────────────────

export const T20_PODERES_DESTINO: SeedEntry[] = [
  {
    name: 'Golpe Fulminante',
    description:
      'Uma vez por combate, você pode executar um ataque especial que causa dano dobrado. Se acertar, o alvo fica Atordoado até o fim do próximo turno dele.',
    shortDescription: 'Ataque fulminante causando dano dobrado.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'combate', 'dano'],
    attributes: [
      { key: 'prerequisite', value: 'Nível 5+', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Padrão', label: 'Tipo de Ação' },
      { key: 'frequency', value: '1/combate', label: 'Frequência' },
      { key: 'effect', value: 'Dano dobrado, alvo Atordoado', label: 'Efeito' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 180 },
  },
  {
    name: 'Reflexos de Gato',
    description:
      'Você ganha +5 em testes de Reflexos contra quedas. Você nunca fica Caído involuntariamente (você sempre consegue se manter de pé).',
    shortDescription: 'Nunca cai involuntariamente, +5 Reflexos contra quedas.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'reflexos', 'defesa'],
    attributes: [
      { key: 'prerequisite', value: 'Destreza 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 181 },
  },
  {
    name: 'Visão Aguçada',
    description:
      'Você pode enxergar em penumbra como se fosse luz plena. Recebe +3 em testes de Percepção que dependem de visão.',
    shortDescription: 'Enxerga em penumbra, +3 Percepção visual.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'visão', 'percepção'],
    attributes: [
      { key: 'prerequisite', value: 'Sabedoria 2', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 182 },
  },
  {
    name: 'Força de Gigante',
    description:
      'Uma vez por dia, você pode gastar 5 PM para multiplicar sua Força por 1,5 até o fim da cena. Isso afeta dano, teste de empurrão e carrego de itens.',
    shortDescription: 'Multiplica Força por 1,5 (5 PM, 1/dia).',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'força', 'aumento'],
    attributes: [
      { key: 'prerequisite', value: 'Força 4, Nível 7+', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Livre', label: 'Tipo de Ação' },
      { key: 'frequency', value: '1/dia', label: 'Frequência' },
      { key: 'pm_cost', value: 5, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 183 },
  },
  {
    name: 'Mestre da Magia',
    description:
      'Suas magias sofrem -2 na CD para resistência (aqueles que quiserem resistir têm -2 no teste). Funciona apenas com suas magias lançadas.',
    shortDescription: 'Reduz CD de resistência às suas magias em 2.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'magia', 'lançamento'],
    attributes: [
      { key: 'prerequisite', value: 'Inteligência 3, classe arcana', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 184 },
  },
  {
    name: 'Toque Mortal',
    description:
      'Seu toque causa +2d6 de dano necrótico. Você pode gastar 3 PM para deixar o alvo com a condição Debilitado até o fim do próximo turno dele.',
    shortDescription: 'Toque causa +2d6 necrótico, pode Debilitar.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'necromancia', 'dano'],
    attributes: [
      { key: 'prerequisite', value: 'Nível 9+, classe com magia de necromancia', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Toque', label: 'Tipo de Ação' },
      { key: 'damage', value: '+2d6 necrótico', label: 'Dano' },
      { key: 'pm_cost', value: 3, label: 'Custo PM (opcional)' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 185 },
  },
  {
    name: 'Aura Protetora',
    description:
      'Você irrradia uma aura mágica de 9m que concede +2 em testes de resistência a todos os aliados na área (incluindo você). Requer concentração.',
    shortDescription: 'Aura de 9m: +2 testes de resistência para aliados.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'aura', 'defesa', 'aliados'],
    attributes: [
      { key: 'prerequisite', value: 'Sabedoria 3, Carisma 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Padrão (iniciar concentração)', label: 'Tipo de Ação' },
      { key: 'range', value: '9m de raio', label: 'Alcance' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 186 },
  },
  {
    name: 'Resistência Elementar',
    description:
      'Escolha um tipo de elemento (fogo, frio, eletricidade ou ácido). Você recebe resistência 10 contra esse elemento. Pode ser alterada após 1 hora de meditação.',
    shortDescription: 'Resistência 10 contra 1 elemento (escolhível).',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'resistência', 'elemento'],
    attributes: [
      { key: 'prerequisite', value: 'Constituição 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'effect', value: 'Resistência 10 vs 1 elemento', label: 'Efeito' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 187 },
  },
  {
    name: 'Movimento Relâmpago',
    description:
      'Sua velocidade de movimento é aumentada em 6m durante combate. Você pode gastar 2 PM para, uma vez por rodada, se mover um espaço extra sem provocar ataques de oportunidade.',
    shortDescription: 'Velocidade +6m, movimento extra 1/rodada (2 PM).',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'movimento', 'velocidade'],
    attributes: [
      { key: 'prerequisite', value: 'Destreza 3, Nível 5+', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 2, label: 'Custo PM (opcional)' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 188 },
  },
];

// ─── Poderes de Classe Específicos ─────────────────────────────────────────────

export const T20_PODERES_CLASSE: SeedEntry[] = [
  // Guerreiro
  {
    name: 'Contra-Ataque',
    description:
      'Quando um inimigo erra um ataque contra você em seu turno, você pode usar sua reação para fazer um ataque contra esse inimigo. Esse ataque tem desvantagem.',
    shortDescription: 'Contra-ataque (reação) quando inimigo erra.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'guerreiro', 'reação', 'combate'],
    attributes: [
      { key: 'prerequisite', value: 'Guerreiro 1', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Reação', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 189 },
  },
  {
    name: 'Defender Aliado',
    description:
      'Você se posiciona entre um aliado e ataques inimigos. Você pode gastar uma reação para conceder +4 em Defesa a um aliado próximo até o fim da rodada.',
    shortDescription: '+4 Defesa para aliado próximo (reação).',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'guerreiro', 'defesa', 'proteção'],
    attributes: [
      { key: 'prerequisite', value: 'Guerreiro 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Reação', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 190 },
  },
  // Mago
  {
    name: 'Explosão Arcana',
    description:
      'Quando uma criatura entra em um espaço de 1,5m de você, você pode usar sua reação para lançar um míssil mágico. Funciona uma vez por turno.',
    shortDescription: 'Míssil mágico automático quando criatura se aproxima.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'mago', 'magia', 'reação'],
    attributes: [
      { key: 'prerequisite', value: 'Mago 1, Inteligência 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Reação', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 191 },
  },
  {
    name: 'Arcano Amplificado',
    description:
      'Suas magias de 1º círculo causam +1 de dano (ou +2 com CD se aplicável). Você pode gastar 1 PM para amplificar uma magia lançada.',
    shortDescription: 'Magias 1º círculo +1 dano/CD (1 PM).',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'mago', 'magia', 'amplificação'],
    attributes: [
      { key: 'prerequisite', value: 'Mago 5', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Livre (ao lançar)', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 1, label: 'Custo PM (opcional)' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 192 },
  },
  // Clérigo
  {
    name: 'Cura Radiante',
    description:
      'Você pode curar um aliado próximo em sua ação de bônus. Cura 1d8 + modificador de Sabedoria. Funcionário uma vez por turno.',
    shortDescription: 'Cura aliado (ação de bônus) 1d8 + Sab.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'clérigo', 'cura', 'ação bônus'],
    attributes: [
      { key: 'prerequisite', value: 'Clérigo 1', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Ação de Bônus', label: 'Tipo de Ação' },
      { key: 'healing', value: '1d8 + Sab', label: 'Cura' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 193 },
  },
  {
    name: 'Retribuição Divina',
    description:
      'Quando você reduz o HP de um criatura maligna para 0, você ganha 1 PM temporário. Esse PM dura até o fim da cena.',
    shortDescription: '+1 PM temporário ao derrotar criatura maligna.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'clérigo', 'bem', 'mal'],
    attributes: [
      { key: 'prerequisite', value: 'Clérigo 5', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 194 },
  },
  // Ladino
  {
    name: 'Desaparecimento Sombrio',
    description:
      'Quando você se move em penumbra ou escuridão, você recebe +5 em testes de Furtividade. Você pode gastar 2 PM para ficar invisível por 1 rodada.',
    shortDescription: '+5 Furtividade em escuridão, invisibilidade (2 PM).',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'ladino', 'furtividade', 'invisibilidade'],
    attributes: [
      { key: 'prerequisite', value: 'Ladino 1, Destreza 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 2, label: 'Custo PM (opcional)' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 195 },
  },
  {
    name: 'Ataque Preciso',
    description:
      'Quando você ataca um alvo Surpreso ou Desprevenido, você pode adicionar um dado de ataque extra ao seu teste. Se acertar, causa +1d8 de dano.',
    shortDescription: 'Ataque contra surpreso ganha +1d8 dano.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'ladino', 'ataque', 'surpresa'],
    attributes: [
      { key: 'prerequisite', value: 'Ladino 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 196 },
  },
  // Bárbaro
  {
    name: 'Fúria Implacável',
    description:
      'Quando você usa Fúria, você ganha vantagem em testes de Força. Você pode acabar com uma Fúria como ação livre em seu turno.',
    shortDescription: 'Vantagem em testes Força durante Fúria.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'bárbaro', 'fúria', 'força'],
    attributes: [
      { key: 'prerequisite', value: 'Bárbaro 1', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 197 },
  },
  {
    name: 'Golpe Selvagem',
    description:
      'Sua primeira ação em combate durante Fúria causa dano aumentado (dado de dano aumenta em um tamanho). Funciona uma vez por uso de Fúria.',
    shortDescription: 'Dano aumentado no primeiro ataque de Fúria.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'bárbaro', 'fúria', 'dano'],
    attributes: [
      { key: 'prerequisite', value: 'Bárbaro 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 198 },
  },
  // Bardo
  {
    name: 'Inspiração Bardesca',
    description:
      'Você pode gastar 2 PM como ação bônus para inspirar um aliado próximo. Esse aliado ganha vantagem no próximo teste de ataque, perícia ou resistência que fizer antes do fim de seu turno.',
    shortDescription: 'Aliado ganha vantagem no próximo teste (ação bônus, 2 PM).',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'bardo', 'inspiração', 'aliado'],
    attributes: [
      { key: 'prerequisite', value: 'Bardo 1, Carisma 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Ação de Bônus', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 199 },
  },
  {
    name: 'Canto de Cura',
    description:
      'Você canta uma melodia de cura que cura você e todos os aliados num raio de 6m em 1d6 + Carisma. Requer concentração, dura até 1 minuto.',
    shortDescription: 'Cura aliados em raio de 6m (1d6 + Car).',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'bardo', 'cura', 'magia'],
    attributes: [
      { key: 'prerequisite', value: 'Bardo 3, Carisma 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Padrão (iniciar concentração)', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 200 },
  },
  // Paladino
  {
    name: 'Golpe Sagrado',
    description:
      'Seu ataque contra uma criatura maligna causa +1d6 de dano radiante. Se acertar, o alvo não pode se curar até o fim do seu próximo turno.',
    shortDescription: 'Ataque maligno +1d6 radiante, impede cura.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'paladino', 'bem', 'mal', 'magia'],
    attributes: [
      { key: 'prerequisite', value: 'Paladino 1', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 201 },
  },
  {
    name: 'Aura de Justiça',
    description:
      'Você irrradia uma aura de 9m de raio que concede +1 em testes de ataque e resistência contra criações do mal. Requer concentração.',
    shortDescription: 'Aura de 9m: +1 ataque/resistência vs mal.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'paladino', 'aura', 'bem', 'mal'],
    attributes: [
      { key: 'prerequisite', value: 'Paladino 3, nível 5+', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Padrão (iniciar concentração)', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 202 },
  },
  // Druida
  {
    name: 'Forma Selvagem',
    description:
      'Você pode gastar 2 PM e uma ação padrão para se transformar em um animal pequeno (até tamanho Médio). Recupera 1d8 + nível de PV ao transformar. Dura 1 hora.',
    shortDescription: 'Transformação em animal (2 PM, 1 hora).',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'druida', 'transformação', 'animal'],
    attributes: [
      { key: 'prerequisite', value: 'Druida 3, nível 5+', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Padrão', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 203 },
  },
  {
    name: 'Graça Natural',
    description:
      'Seus testes de Destreza em terrenos selvagens recebem +3. Você deixa rastros mínimos e sua velocidade não diminui em terreno difícil natural.',
    shortDescription: '+3 Destreza em terreno selvagem, sem penalidade de terreno.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'druida', 'natureza', 'movimento'],
    attributes: [
      { key: 'prerequisite', value: 'Druida 1', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 204 },
  },
];

export const T20_PODERES_EXPANDIDOS_ALL = [
  ...T20_PODERES_DESTINO,
  ...T20_PODERES_CLASSE,
];
