import { EntryType } from '../../domain/entry/entry.entity';
import type { CreateEntryProps } from '../../domain/entry/entry.entity';

type SeedEntry = Omit<CreateEntryProps, 'isOfficial' | 'isHomebrew' | 'createdBy' | 'isPublic'>;

// ─── Itens Mágicos Tormenta20 (Expandidos) ─────────────────────────────────────

export const T20_ITENS_MAGICOS: SeedEntry[] = [
  {
    name: 'Espada +1',
    description:
      'Uma espada longa ou espada larga mágica que concede bônus +1 em testes de ataque e dano. A lâmina brilha levemente com poder arcano.',
    shortDescription: '+1 ataque e dano com essa arma.',
    type: EntryType.ITEM,
    system: 'tormenta20',
    tags: ['item', 'arma', 'magia', 'mágico'],
    attributes: [
      { key: 'type', value: 'Arma Mágica', label: 'Tipo' },
      { key: 'rarity', value: 'Rara', label: 'Raridade' },
      { key: 'bonus', value: '+1 ataque, +1 dano', label: 'Bônus' },
      { key: 'weight', value: '2 kg', label: 'Peso' },
      { key: 'value', value: '2.500 TO', label: 'Valor' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 200 },
  },
  {
    name: 'Armadura de Platina +1',
    description:
      'Uma armadura de placas feita de platina pura com encantamentos defensivos. Concede +1 em Defesa além do bônus normal.',
    shortDescription: '+1 Defesa (além do normal), resistência mágica.',
    type: EntryType.ITEM,
    system: 'tormenta20',
    tags: ['item', 'armadura', 'magia', 'defesa'],
    attributes: [
      { key: 'type', value: 'Armadura Mágica', label: 'Tipo' },
      { key: 'rarity', value: 'Rara', label: 'Raridade' },
      { key: 'ac_bonus', value: '+1 Defesa', label: 'Bônus' },
      { key: 'weight', value: '30 kg', label: 'Peso' },
      { key: 'value', value: '3.500 TO', label: 'Valor' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 201 },
  },
  {
    name: 'Anel da Proteção',
    description:
      'Um anel de ouro simples com gema azul que brilha. Concede +1 em testes de Defesa e resistência a magia.',
    shortDescription: '+1 Defesa, resistência magia.',
    type: EntryType.ITEM,
    system: 'tormenta20',
    tags: ['item', 'acessório', 'magia', 'proteção'],
    attributes: [
      { key: 'type', value: 'Acessório Mágico', label: 'Tipo' },
      { key: 'rarity', value: 'Rara', label: 'Raridade' },
      { key: 'ac_bonus', value: '+1 Defesa', label: 'Bônus Defesa' },
      { key: 'magic_resistance', value: '+2 resistência magia', label: 'Resistência' },
      { key: 'weight', value: '0,1 kg', label: 'Peso' },
      { key: 'value', value: '2.000 TO', label: 'Valor' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 202 },
  },
  {
    name: 'Manto da Invisibilidade',
    description:
      'Um manto prateado que confere invisibilidade a quem o veste. O usuário pode ativar/desativar a invisibilidade como ação livre.',
    shortDescription: 'Torna invisível. Ativável/desativável como ação livre.',
    type: EntryType.ITEM,
    system: 'tormenta20',
    tags: ['item', 'manto', 'magia', 'invisibilidade'],
    attributes: [
      { key: 'type', value: 'Veste Mágica', label: 'Tipo' },
      { key: 'rarity', value: 'Lendária', label: 'Raridade' },
      { key: 'effect', value: 'Invisibilidade ativável/desativável', label: 'Efeito' },
      { key: 'charges', value: 'Ilimitado (ativação manual)', label: 'Cargas' },
      { key: 'weight', value: '0,5 kg', label: 'Peso' },
      { key: 'value', value: '10.000+ TO', label: 'Valor' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 203 },
  },
  {
    name: 'Cajado da Evocação',
    description:
      'Um cajado de madeira de carvalho com cristal no topo. Lançadores de magia ganham +2 em CD de magias de evocação e dano +1 com magias de evocação.',
    shortDescription: '+2 CD evocação, +1 dano evocação.',
    type: EntryType.ITEM,
    system: 'tormenta20',
    tags: ['item', 'cajado', 'magia', 'evocação'],
    attributes: [
      { key: 'type', value: 'Focalizador Mágico', label: 'Tipo' },
      { key: 'rarity', value: 'Muito Rara', label: 'Raridade' },
      { key: 'class_restriction', value: 'Mago, Clérigo, Druida', label: 'Restrição' },
      { key: 'bonus_cd', value: '+2 CD evocação', label: 'Bônus CD' },
      { key: 'bonus_damage', value: '+1 dano evocação', label: 'Bônus Dano' },
      { key: 'weight', value: '2 kg', label: 'Peso' },
      { key: 'value', value: '4.000 TO', label: 'Valor' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 204 },
  },
  {
    name: 'Botas da Velocidade',
    description:
      'Botas de couro fino com solas inflamáveis. O usuário ganha velocidade de movimento +3m permanentemente durante combate.',
    shortDescription: 'Velocidade +3m em combate.',
    type: EntryType.ITEM,
    system: 'tormenta20',
    tags: ['item', 'botas', 'magia', 'movimento'],
    attributes: [
      { key: 'type', value: 'Veste Mágica', label: 'Tipo' },
      { key: 'rarity', value: 'Rara', label: 'Raridade' },
      { key: 'effect', value: 'Velocidade +3m permanentemente', label: 'Efeito' },
      { key: 'duration', value: 'Permanente enquanto vestidas', label: 'Duração' },
      { key: 'weight', value: '1 kg', label: 'Peso' },
      { key: 'value', value: '2.500 TO', label: 'Valor' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 205 },
  },
  {
    name: 'Espelho da Verdade',
    description:
      'Um espelho com moldura de prata que sempre mostra a verdade. Revela ilusões, invisibilidade e transformações ilusórias.',
    shortDescription: 'Revela ilusões e invisibilidade.',
    type: EntryType.ITEM,
    system: 'tormenta20',
    tags: ['item', 'objeto', 'magia', 'adivinhação'],
    attributes: [
      { key: 'type', value: 'Objeto Mágico', label: 'Tipo' },
      { key: 'rarity', value: 'Rara', label: 'Raridade' },
      { key: 'effect', value: 'Revela ilusões e invisibilidade em 6m', label: 'Efeito' },
      { key: 'charges', value: 'Ilimitado', label: 'Cargas' },
      { key: 'weight', value: '2 kg', label: 'Peso' },
      { key: 'value', value: '3.000 TO', label: 'Valor' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 206 },
  },
  {
    name: 'Adaga da Venenação',
    description:
      'Uma adaga fina cuja lâmina tem uma película de veneno permanente. Ataques causam 1d4 de dano de veneno adicional. Recarrega veneno a cada novo dia.',
    shortDescription: '+1d4 dano de veneno com ataque.',
    type: EntryType.ITEM,
    system: 'tormenta20',
    tags: ['item', 'adaga', 'arma', 'veneno'],
    attributes: [
      { key: 'type', value: 'Arma Mágica', label: 'Tipo' },
      { key: 'rarity', value: 'Rara', label: 'Raridade' },
      { key: 'bonus_damage', value: '+1d4 dano veneno', label: 'Dano Extra' },
      { key: 'recharge', value: 'Novo veneno a cada dia', label: 'Recarregamento' },
      { key: 'weight', value: '0,5 kg', label: 'Peso' },
      { key: 'value', value: '1.500 TO', label: 'Valor' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 207 },
  },
  {
    name: 'Escudo de Reflexão Mágica',
    description:
      'Um escudo de aço com inscrições arcanas. Quando uma magia ataca o portador, ele pode gastar uma reação para refletir a magia de volta.',
    shortDescription: 'Pode refletir magia 1/dia (reação).',
    type: EntryType.ITEM,
    system: 'tormenta20',
    tags: ['item', 'escudo', 'magia', 'reflexão'],
    attributes: [
      { key: 'type', value: 'Escudo Mágico', label: 'Tipo' },
      { key: 'rarity', value: 'Muito Rara', label: 'Raridade' },
      { key: 'effect', value: 'Reflete magia 1/dia', label: 'Efeito' },
      { key: 'recharge', value: '1/dia', label: 'Recarregamento' },
      { key: 'weight', value: '4 kg', label: 'Peso' },
      { key: 'value', value: '3.500 TO', label: 'Valor' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 208 },
  },
  {
    name: 'Poção de Cura Maior',
    description:
      'Uma poção vermelha que brilha levemente. Quem bebe recupera 4d4+8 de PV. Pode ser usada uma vez.',
    shortDescription: 'Cura 4d4+8 PV (1 uso).',
    type: EntryType.ITEM,
    system: 'tormenta20',
    tags: ['item', 'poção', 'consumível', 'cura'],
    attributes: [
      { key: 'type', value: 'Poção Consumível', label: 'Tipo' },
      { key: 'rarity', value: 'Comum', label: 'Raridade' },
      { key: 'effect', value: 'Cura 4d4+8 PV', label: 'Efeito' },
      { key: 'uses', value: '1', label: 'Usos' },
      { key: 'weight', value: '0,3 kg', label: 'Peso' },
      { key: 'value', value: '300 TO', label: 'Valor' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 209 },
  },
  {
    name: 'Cinto de Força de Gigante',
    description:
      'Um cinto de couro com fivela de ouro. O usuário ganha FOR 19 (se a sua FOE for menor). Não acumula com outro bonus.',
    shortDescription: 'FOR 19 (se menor).',
    type: EntryType.ITEM,
    system: 'tormenta20',
    tags: ['item', 'cinto', 'acessório', 'magia', 'força'],
    attributes: [
      { key: 'type', value: 'Acessório Mágico', label: 'Tipo' },
      { key: 'rarity', value: 'Lendária', label: 'Raridade' },
      { key: 'effect', value: 'FOR 19 (mínimo)', label: 'Efeito' },
      { key: 'restriction', value: 'Não acumula com outros bônus FOR', label: 'Restrição' },
      { key: 'weight', value: '0,5 kg', label: 'Peso' },
      { key: 'value', value: '5.000+ TO', label: 'Valor' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 210 },
  },
];

// ─── Divindades de Arton ─────────────────────────────────────────────────────────

export const T20_DIVINDADES: SeedEntry[] = [
  {
    name: 'Arton (Divindade Primária)',
    description:
      'Arton é a força primária do bem e ordem no multiverso. Ela cria, protege e renova. Seus sacerdotes pregam justiça, verdade e proteção dos inocentes. Símbolo: Uma chama branca em círculo.',
    shortDescription: 'Bem, ordem, criação e renovação.',
    type: EntryType.DEITY,
    system: 'tormenta20',
    tags: ['divindade', 'bem', 'ordem', 'criação'],
    attributes: [
      { key: 'alignment', value: 'Bom e Ordeiro', label: 'Alinhamento' },
      { key: 'domains', value: 'Proteção, Luz, Renovação, Força', label: 'Domínios' },
      { key: 'holy_symbol', value: 'Chama branca em círculo', label: 'Símbolo Sagrado' },
      { key: 'priests', value: 'Clérigos e Paladinos', label: 'Sacerdotes' },
      { key: 'believers', value: 'Guerreiros, Guardiões, Nobres', label: 'Adoradores' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 300 },
  },
  {
    name: 'Kalleb (Deus da Morte)',
    description:
      'Kalleb é o senhor da morte, transição e repouso. Não é maligno, mas indiferente. Seus sacerdotes honram os mortos e garantem que almas descansem em paz. Símbolo: Caveira com coroa de flores.',
    shortDescription: 'Morte, repouso, transição e honra aos mortos.',
    type: EntryType.DEITY,
    system: 'tormenta20',
    tags: ['divindade', 'morte', 'repouso', 'neutral'],
    attributes: [
      { key: 'alignment', value: 'Neutro', label: 'Alinhamento' },
      { key: 'domains', value: 'Morte, Repouso, Transição, Conhecimento', label: 'Domínios' },
      { key: 'holy_symbol', value: 'Caveira com coroa de flores', label: 'Símbolo Sagrado' },
      { key: 'priests', value: 'Clérigos da Morte, Druidas', label: 'Sacerdotes' },
      { key: 'believers', value: 'Eruditos, Cavaleiros da Morte', label: 'Adoradores' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 301 },
  },
  {
    name: 'Ragnar (Deus da Guerra)',
    description:
      'Ragnar é o espírito da batalha, coragem e glória em combate. Valoriza honra e bravura. Seus sacerdotes abençoam guerreiros e conquistadores. Símbolo: Machado e escudo cruzados.',
    shortDescription: 'Guerra, coragem, honra e glória.',
    type: EntryType.DEITY,
    system: 'tormenta20',
    tags: ['divindade', 'guerra', 'coragem', 'honra'],
    attributes: [
      { key: 'alignment', value: 'Caótico Neutro', label: 'Alinhamento' },
      { key: 'domains', value: 'Guerra, Coragem, Honra, Força', label: 'Domínios' },
      { key: 'holy_symbol', value: 'Machado e escudo cruzados', label: 'Símbolo Sagrado' },
      { key: 'priests', value: 'Clérigos Guerreiros, Paladinos', label: 'Sacerdotes' },
      { key: 'believers', value: 'Guerreiros, Bárbaros, Conquistadores', label: 'Adoradores' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 302 },
  },
  {
    name: 'Szass Tam (Deus dos Segredos)',
    description:
      'Szass Tam é o conhecimento oculto, magia arcana e sabedoria antiga. Seus seguidores buscam poder através do aprendizado. Símbolo: Olho com pupila de estrela.',
    shortDescription: 'Magia, conhecimento oculto, segredos.',
    type: EntryType.DEITY,
    system: 'tormenta20',
    tags: ['divindade', 'magia', 'conhecimento', 'neutral'],
    attributes: [
      { key: 'alignment', value: 'Neutro Maligno', label: 'Alinhamento' },
      { key: 'domains', value: 'Magia, Conhecimento, Mistério, Engano', label: 'Domínios' },
      { key: 'holy_symbol', value: 'Olho com pupila de estrela', label: 'Símbolo Sagrado' },
      { key: 'priests', value: 'Magos, Clérigos Mágicos', label: 'Sacerdotes' },
      { key: 'believers', value: 'Eruditos, Bruxos, Necromantes', label: 'Adoradores' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 303 },
  },
  {
    name: 'Lusitânia (Deusa da Natureza)',
    description:
      'Lusitânia é a força selvagem da natureza, animais e fertilidade. Não é nem boa nem má, apenas natural. Seus sacerdotes protegem florestas e criaturas selvagens. Símbolo: Árvore dourada com coruja.',
    shortDescription: 'Natureza, animais, fertilidade e selvageria.',
    type: EntryType.DEITY,
    system: 'tormenta20',
    tags: ['divindade', 'natureza', 'animal', 'neutral'],
    attributes: [
      { key: 'alignment', value: 'Neutro', label: 'Alinhamento' },
      { key: 'domains', value: 'Natureza, Animais, Fertilidade, Tempestade', label: 'Domínios' },
      { key: 'holy_symbol', value: 'Árvore dourada com coruja', label: 'Símbolo Sagrado' },
      { key: 'priests', value: 'Druidas, Clérigos da Natureza', label: 'Sacerdotes' },
      { key: 'believers', value: 'Druidas, Silvícolas, Protetores da Natureza', label: 'Adoradores' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 304 },
  },
  {
    name: 'Goliarda (Deusa do Conhecimento)',
    description:
      'Goliarda é a sabedoria prática, conhecimento mundano e educação. Suas sacerdotisas ensinam e preservam história. Símbolo: Pergaminho aberto com pena dourada.',
    shortDescription: 'Conhecimento, educação, história e sabedoria.',
    type: EntryType.DEITY,
    system: 'tormenta20',
    tags: ['divindade', 'conhecimento', 'educação', 'bom'],
    attributes: [
      { key: 'alignment', value: 'Bom e Ordeiro', label: 'Alinhamento' },
      { key: 'domains', value: 'Conhecimento, Educação, Livros, Luz', label: 'Domínios' },
      { key: 'holy_symbol', value: 'Pergaminho aberto com pena dourada', label: 'Símbolo Sagrado' },
      { key: 'priests', value: 'Clérigos Eruditos, Bardos', label: 'Sacerdotes' },
      { key: 'believers', value: 'Estudiosos, Bardos, Mestres', label: 'Adoradores' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 305 },
  },
  {
    name: 'Thyatis (Deus da Riqueza)',
    description:
      'Thyatis é a prosperidade, comércio e ganho material. Seus seguidores buscam riqueza através do trabalho honesto ou desonesto. Símbolo: Moeda dourada com coroa.',
    shortDescription: 'Riqueza, comércio, prosperidade e ganho.',
    type: EntryType.DEITY,
    system: 'tormenta20',
    tags: ['divindade', 'riqueza', 'comércio', 'neutral'],
    attributes: [
      { key: 'alignment', value: 'Neutro', label: 'Alinhamento' },
      { key: 'domains', value: 'Riqueza, Comércio, Prosperidade, Engano', label: 'Domínios' },
      { key: 'holy_symbol', value: 'Moeda dourada com coroa', label: 'Símbolo Sagrado' },
      { key: 'priests', value: 'Clérigos Mercadores, Paladinos', label: 'Sacerdotes' },
      { key: 'believers', value: 'Mercadores, Nobres, Aventureiros', label: 'Adoradores' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 306 },
  },
  {
    name: 'Tybott (Deus da Magia Celestial)',
    description:
      'Tybott é a magia branca, cura e renovação através do poder divino. Seus seguidores buscam equilibrio e harmonia. Símbolo: Estrela com raios de luz.',
    shortDescription: 'Magia branca, cura, harmonia e equilíbrio.',
    type: EntryType.DEITY,
    system: 'tormenta20',
    tags: ['divindade', 'magia', 'cura', 'bom'],
    attributes: [
      { key: 'alignment', value: 'Bom', label: 'Alinhamento' },
      { key: 'domains', value: 'Magia Branca, Cura, Luz, Equilíbrio', label: 'Domínios' },
      { key: 'holy_symbol', value: 'Estrela com raios de luz', label: 'Símbolo Sagrado' },
      { key: 'priests', value: 'Clérigos, Paladinos, Magos Brancos', label: 'Sacerdotes' },
      { key: 'believers', value: 'Healers, Magas Brancas, Guardiões', label: 'Adoradores' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 307 },
  },
];

export const T20_ITENS_TOTAL = T20_ITENS_MAGICOS;
export const T20_DIVINDADES_TOTAL = T20_DIVINDADES;
