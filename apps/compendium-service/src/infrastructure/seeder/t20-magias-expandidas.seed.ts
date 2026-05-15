import { EntryType } from '../../domain/entry/entry.entity';
import type { CreateEntryProps } from '../../domain/entry/entry.entity';

type SeedEntry = Omit<CreateEntryProps, 'isOfficial' | 'isHomebrew' | 'createdBy' | 'isPublic'>;

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

// ─── Magias 2º Círculo (Expandidas) ────────────────────────────────────────────

export const T20_MAGIAS_2_CIRCULO_EXPANDIDAS: SeedEntry[] = [
  magia(
    'Levitação',
    'Uma criatura que você toque levita até 9m de altura por 10 minutos. Pode ser mantida por concentração. A criatura pode se mover horizontalmente enquanto levita.',
    'Levita criatura até 9m por 10 minutos.',
    2, 'Transmutação',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'duration', value: '10 minutos (concentração)', label: 'Duração' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    210,
  ),
  magia(
    'Invisibilidade',
    'Uma criatura que você toque fica invisível por 1 hora ou até atacar. Você a vê mesmo invisível. A magia se dissipa se a criatura atacar.',
    'Torna alvo invisível por 1 hora.',
    2, 'Ilusão',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'duration', value: '1 hora', label: 'Duração' },
      { key: 'save', value: 'Vontade nega', label: 'Resistência' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    211,
  ),
  magia(
    'Resistência Elemental',
    'Uma criatura ganha resistência 10 contra um elemento por 1 hora. Você escolhe qual elemento (fogo, frio, eletricidade, ácido ou sônico).',
    'Resistência 10 vs elemento por 1 hora.',
    2, 'Abjuração',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'duration', value: '1 hora', label: 'Duração' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    212,
  ),
  magia(
    'Força Felina',
    'Uma criatura ganha vantagem em testes de Destreza, velocidade aumenta em 3m e recebe +1 em Defesa por 1 hora.',
    'Vantagem Destreza, +3m velocidade, +1 Defesa por 1 hora.',
    2, 'Transmutação',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'duration', value: '1 hora', label: 'Duração' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    213,
  ),
  magia(
    'Sugestão',
    'Uma criatura próxima que você vê deve fazer Vontade (CD Inteligência). Se falhar, ela é obrigada a fazer uma ação razoável que você sugerir. A ação não pode causar dano a si mesma.',
    'Força criatura a fazer ação sugerida (Vontade resiste).',
    2, 'Encantamento',
    [
      { key: 'range', value: '12m', label: 'Alcance' },
      { key: 'save', value: 'Vontade nega', label: 'Resistência' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    214,
  ),
  magia(
    'Escuridão Profunda',
    'Uma esfera de raio 4,5m em um ponto que você vê é preenchida com escuridão mágica. Até mesmo Visão no Escuro não penetra. Dura 10 minutos com concentração.',
    'Área de 4,5m de escuridão mágica por 10 minutos.',
    2, 'Evocação',
    [
      { key: 'range', value: '36m', label: 'Alcance' },
      { key: 'area', value: '4,5m de raio', label: 'Área' },
      { key: 'duration', value: '10 minutos (concentração)', label: 'Duração' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    215,
  ),
];

// ─── Magias 3º Círculo (Expandidas) ────────────────────────────────────────────

export const T20_MAGIAS_3_CIRCULO_EXPANDIDAS: SeedEntry[] = [
  magia(
    'Revitalizar',
    'Uma criatura que você toque recupera metade de seus PV máximos. Se a criatura tiver uma condição debilitante (Envenenado, Doença), você pode removê-la.',
    'Cura metade dos PV, pode remover uma condição.',
    3, 'Invocação',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'healing', value: '50% dos PV máximos', label: 'Cura' },
      { key: 'pm_cost', value: 3, label: 'Custo PM' },
    ],
    220,
  ),
  magia(
    'Dimensão Etérea',
    'Uma criatura que você toque entra no plano etéreo por até 1 hora. Ela fica invisível e intangível a criaturas do plano material, mas pode ser atacada por magia e tem vantagem em testes de Furtividade.',
    'Criatura fica etérea e invisível por 1 hora.',
    3, 'Transmutação',
    [
      { key: 'range', value: 'Toque', label: 'Alcance' },
      { key: 'duration', value: '1 hora', label: 'Duração' },
      { key: 'pm_cost', value: 3, label: 'Custo PM' },
    ],
    221,
  ),
  magia(
    'Tormenta Arcana',
    'Um cone de raio 9m é preenchido com raios de magia instável. Cada criatura na área sofre 4d6 de dano de magia (Reflexos reduz à metade). Objetos desencantados sofrem dano total sem resistência.',
    'Cone 9m: 4d6 dano magia (Reflexos reduz).',
    3, 'Evocação',
    [
      { key: 'range', value: 'Cone 9m', label: 'Alcance' },
      { key: 'damage', value: '4d6 magia', label: 'Dano' },
      { key: 'save', value: 'Reflexos reduz à metade', label: 'Resistência' },
      { key: 'pm_cost', value: 3, label: 'Custo PM' },
    ],
    222,
  ),
  magia(
    'Busca Verdadeira',
    'Você consegue sentir mentiras dentro de 9m por 10 minutos. Você sabe quando alguém mente intencionalmente, mas não sabe a verdade. Criações mágicas podem resistir com Vontade.',
    'Detecta mentiras em 9m por 10 minutos.',
    3, 'Adivinhação',
    [
      { key: 'range', value: '9m', label: 'Alcance' },
      { key: 'duration', value: '10 minutos (concentração)', label: 'Duração' },
      { key: 'save', value: 'Vontade nega para criaturas mágicas', label: 'Resistência' },
      { key: 'pm_cost', value: 3, label: 'Custo PM' },
    ],
    223,
  ),
  magia(
    'Esfera de Enraizamento',
    'Um raio de 6m se enche com trepadeiras e raízes que imobilizam tudo nela. Criaturas na área fazem Reflexos ou ficam Imobilizadas por 1 minuto com concentração.',
    'Raio 6m: Imobiliza criaturas (Reflexos resiste).',
    3, 'Transmutação',
    [
      { key: 'range', value: '36m', label: 'Alcance' },
      { key: 'area', value: '6m de raio', label: 'Área' },
      { key: 'save', value: 'Reflexos nega', label: 'Resistência' },
      { key: 'pm_cost', value: 3, label: 'Custo PM' },
    ],
    224,
  ),
];

// ─── Magias 4º Círculo (Expandidas) ────────────────────────────────────────────

export const T20_MAGIAS_4_CIRCULO_EXPANDIDAS: SeedEntry[] = [
  magia(
    'Escudo de Força',
    'Uma criatura que você vê ganha +8 em Defesa contra um ataque específico no próximo turno. Você pode gastar PM adicional para manter por mais turnos.',
    'Alvo ganha +8 Defesa por 1 turno.',
    4, 'Abjuração',
    [
      { key: 'range', value: '18m', label: 'Alcance' },
      { key: 'duration', value: '1 turno (extensível)', label: 'Duração' },
      { key: 'pm_cost', value: 4, label: 'Custo PM' },
    ],
    230,
  ),
  magia(
    'Morte Repentina',
    'Um alvo que você vê deve fazer Fortitude (CD Inteligência + nível/2). Se falhar, sofre 6d6 de dano necrótico imediatamente. Se atingido, sofre 3d6 de dano.',
    'Alvo sofre 6d6 necrótico (Fortitude reduz para 3d6).',
    4, 'Necromancia',
    [
      { key: 'range', value: '36m', label: 'Alcance' },
      { key: 'damage', value: '6d6 necrótico', label: 'Dano' },
      { key: 'save', value: 'Fortitude reduz para 3d6', label: 'Resistência' },
      { key: 'pm_cost', value: 4, label: 'Custo PM' },
    ],
    231,
  ),
  magia(
    'Tecelagem Temporal',
    'Você pode voltar no tempo até 6 segundos (1 rodada). Você escolhe qual ação você gostaria de não ter tomado e a desfaz. O resto do mundo permanece como estava.',
    'Voltar 6 segundos e refazer uma ação.',
    4, 'Transmutação',
    [
      { key: 'range', value: 'Pessoal', label: 'Alcance' },
      { key: 'effect', value: 'Voltar 1 rodada', label: 'Efeito' },
      { key: 'frequency', value: '1/dia', label: 'Frequência' },
      { key: 'pm_cost', value: 4, label: 'Custo PM' },
    ],
    232,
  ),
  magia(
    'Controle de Condições Climáticas',
    'Você controla o clima em um raio de 1,5km por até 8 horas. Você pode criar chuva, neblina, vento ou tempestade. O efeito não afeta criaturas ou estruturas.',
    'Controla clima em raio de 1,5km por 8 horas.',
    4, 'Transmutação',
    [
      { key: 'range', value: '1,5km de raio', label: 'Alcance' },
      { key: 'duration', value: '8 horas', label: 'Duração' },
      { key: 'pm_cost', value: 4, label: 'Custo PM' },
    ],
    233,
  ),
];

// ─── Magias 5º Círculo (Expandidas) ────────────────────────────────────────────

export const T20_MAGIAS_5_CIRCULO_EXPANDIDAS: SeedEntry[] = [
  magia(
    'Desejo',
    'Você pode desejar que algo aconteça. A magia torna seu desejo realidade, mas o Mestre tem controle final sobre como isso se manifesta. Deixa o lançador exausto.',
    'Realiza um desejo (risco de exaustão).',
    5, 'Invocação',
    [
      { key: 'range', value: 'Pessoal', label: 'Alcance' },
      { key: 'effect', value: 'Realiza desejo do lançador', label: 'Efeito' },
      { key: 'side_effect', value: 'Lançador fica Exausto 1d4 dias', label: 'Efeito Colateral' },
      { key: 'pm_cost', value: 5, label: 'Custo PM' },
    ],
    240,
  ),
  magia(
    'Ressurreição Verdadeira',
    'Você pode trazer de volta à vida uma criatura morta há até 200 anos. A criatura reaparece no seu corpo original com 1 PV. O corpo deve estar intacto (pelo menos 50% do corpo original).',
    'Ressuscita criatura morta há até 200 anos.',
    5, 'Necromancia',
    [
      { key: 'range', value: 'Toque (do corpo)', label: 'Alcance' },
      { key: 'effect', value: 'Ressurreição completa', label: 'Efeito' },
      { key: 'requirement', value: 'Corpo pelo menos 50% intacto', label: 'Requisito' },
      { key: 'pm_cost', value: 5, label: 'Custo PM' },
    ],
    241,
  ),
  magia(
    'Ascensão Divina',
    'Você se torna imune a dano por 1 minuto e ganha vantagem em todos os testes. Sua forma fica radiante e causa 1d6 de dano radiante em qualquer criatura que o atacar no corpo a corpo.',
    'Imunidade a dano por 1 minuto, radiância defensiva.',
    5, 'Transmutação',
    [
      { key: 'range', value: 'Pessoal', label: 'Alcance' },
      { key: 'duration', value: '1 minuto', label: 'Duração' },
      { key: 'effect', value: 'Imunidade + vantagem testes + contra-dano radiante', label: 'Efeito' },
      { key: 'pm_cost', value: 5, label: 'Custo PM' },
    ],
    242,
  ),
];

// ─── Rituais ────────────────────────────────────────────────────────────────────

export const T20_RITUAIS: SeedEntry[] = [
  magia(
    'Ritual de Contato Planar',
    'Você entra em contato com uma divindade ou ser extraplanar. O ritual dura 1 hora e requer componentes específicos. O ser pode não responder ou ser hostil.',
    'Entra em contato com criatura extraplanar.',
    0, 'Invocação (Ritual)',
    [
      { key: 'type', value: 'Ritual', label: 'Tipo' },
      { key: 'duration', value: '1 hora', label: 'Duração' },
      { key: 'requirement', value: 'Componentes específicos', label: 'Requisito' },
      { key: 'pm_cost', value: 10, label: 'Custo PM (total)' },
    ],
    250,
  ),
  magia(
    'Ritual de Ligação',
    'Você vincula permanentemente um item a si mesmo. Você ganha +1 em testes de ataque e defesa com esse item. Se o item for destruído, você sofre 3d6 de dano psíquico.',
    'Vincula item a si permanentemente (+1 ataque/defesa).',
    0, 'Transmutação (Ritual)',
    [
      { key: 'type', value: 'Ritual', label: 'Tipo' },
      { key: 'effect', value: '+1 ataque/defesa com item', label: 'Efeito' },
      { key: 'items', value: 'Até 3 itens simultaneamente', label: 'Limite' },
      { key: 'pm_cost', value: 5, label: 'Custo PM (total)' },
    ],
    251,
  ),
  magia(
    'Ritual de Scrying',
    'Você consegue ver e ouvir um local distante por até 1 hora. Você conhece o local ou é bem descrito para você. Criaturas podem resistir com Vontade.',
    'Vê/ouve local distante por 1 hora (concentração).',
    0, 'Adivinhação (Ritual)',
    [
      { key: 'type', value: 'Ritual', label: 'Tipo' },
      { key: 'range', value: 'Qualquer distância', label: 'Alcance' },
      { key: 'duration', value: '1 hora (concentração)', label: 'Duração' },
      { key: 'save', value: 'Vontade nega para criaturas inteligentes', label: 'Resistência' },
      { key: 'pm_cost', value: 8, label: 'Custo PM (total)' },
    ],
    252,
  ),
  magia(
    'Ritual de Proteção',
    'Você protege um edifício ou área de 30m² contra intrusões mágicas por 1 semana. Criaturas malignas não conseguem entrar sem vencer o ritual com magia.',
    'Protege área de 30m² contra magia/mal por 1 semana.',
    0, 'Abjuração (Ritual)',
    [
      { key: 'type', value: 'Ritual', label: 'Tipo' },
      { key: 'area', value: '30m²', label: 'Área' },
      { key: 'duration', value: '1 semana', label: 'Duração' },
      { key: 'pm_cost', value: 6, label: 'Custo PM (total)' },
    ],
    253,
  ),
  magia(
    'Ritual de Comunhão',
    'Você consegue se comunicar com mortos ou com criaturas em outro plano por até 10 minutos. A criatura deve ser conhecida ou estar próxima (1km).',
    'Comunica com mortos ou criaturas distantes.',
    0, 'Necromancia (Ritual)',
    [
      { key: 'type', value: 'Ritual', label: 'Tipo' },
      { key: 'duration', value: '10 minutos', label: 'Duração' },
      { key: 'range', value: '1km', label: 'Alcance' },
      { key: 'pm_cost', value: 7, label: 'Custo PM (total)' },
    ],
    254,
  ),
];

export const T20_MAGIAS_EXPANDIDAS_ALL = [
  ...T20_MAGIAS_2_CIRCULO_EXPANDIDAS,
  ...T20_MAGIAS_3_CIRCULO_EXPANDIDAS,
  ...T20_MAGIAS_4_CIRCULO_EXPANDIDAS,
  ...T20_MAGIAS_5_CIRCULO_EXPANDIDAS,
  ...T20_RITUAIS,
];
