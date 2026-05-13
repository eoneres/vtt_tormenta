import { EntryType } from '../../domain/entry/entry.entity';
import type { CreateEntryProps } from '../../domain/entry/entry.entity';

type SeedEntry = Omit<CreateEntryProps, 'isOfficial' | 'isHomebrew' | 'createdBy' | 'isPublic'>;

// ─── Helper ────────────────────────────────────────────────────────────────────

function monstro(
  name: string,
  description: string,
  shortDescription: string,
  nd: number,
  tipo: string,
  attrs: Array<{ key: string; value: string | number | string[]; label: string }>,
  page: number,
): SeedEntry {
  return {
    name,
    description,
    shortDescription,
    type: EntryType.MONSTER,
    system: 'tormenta20',
    tags: ['monstro', `nd-${nd}`, tipo.toLowerCase()],
    attributes: [
      { key: 'nd', value: nd, label: 'Nível de Desafio' },
      { key: 'tipo', value: tipo, label: 'Tipo' },
      { key: 'xp', value: ndToXp(nd), label: 'XP' },
      ...attrs,
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page },
  };
}

function ndToXp(nd: number): number {
  const table: Record<number, number> = {
    0: 50, 1: 100, 2: 200, 3: 300, 4: 500, 5: 700,
    6: 1000, 7: 1300, 8: 1800, 9: 2300, 10: 3000,
    11: 3900, 12: 5000, 13: 6500, 14: 8400, 15: 10500,
    16: 13500, 17: 17500, 18: 22000, 19: 28000, 20: 36000,
  };
  return table[nd] ?? nd * 1000;
}

// ─── Monstros ND 1-5 ─────────────────────────────────────────────────────────

export const T20_MONSTROS_NOVOS: SeedEntry[] = [
  monstro(
    'Rato Gigante',
    'Um rato do tamanho de um gato grande. Pragas comuns em masmorras e esgotos. Atacam em grupos e podem transmitir doenças com suas mordidas.',
    'Roedor enorme de masmorras, transmite doenças.',
    1/4, 'Besta', [
      { key: 'pv', value: 7, label: 'PV' },
      { key: 'defesa', value: 12, label: 'Defesa' },
      { key: 'ataque', value: 'Mordida +2 (1d4 perfurante)', label: 'Ataque' },
      { key: 'for_dex_con', value: '2/-1/2', label: 'FOR/DES/CON' },
      { key: 'special', value: 'Doença: Fortitude CD 12 ou perde 1 CON por dia', label: 'Especial' },
    ], 280,
  ),
  monstro(
    'Kobold',
    'Humanoides reptilianos de pequeno porte, servidores de dragões. Coveiros e armadilheiros por excelência, preferem emboscar inimigos maiores usando vantagem numérica e terreno preparado.',
    'Humanoide reptiliano armadilheiro, servo de dragões.',
    1/4, 'Humanoide', [
      { key: 'pv', value: 5, label: 'PV' },
      { key: 'defesa', value: 12, label: 'Defesa' },
      { key: 'ataque', value: 'Lança +4 (1d6 perfurante)', label: 'Ataque' },
      { key: 'for_dex_con', value: '-2/2/0', label: 'FOR/DES/CON' },
      { key: 'special', value: 'Tática de Grupo: +2 em ataque quando aliado adjacente ao alvo', label: 'Especial' },
    ], 281,
  ),
  monstro(
    'Zumbi',
    'Um cadáver animado por necromancia, sem inteligência ou vontade própria. Lento mas incansável, continua avançando mesmo ferido. Pode ser destruído por dano suficiente ou magia positiva.',
    'Morto-vivo lento, resistente a dano, destruído por positivo.',
    1, 'Morto-Vivo', [
      { key: 'pv', value: 22, label: 'PV' },
      { key: 'defesa', value: 8, label: 'Defesa' },
      { key: 'ataque', value: 'Soco +3 (1d6+2 impacto)', label: 'Ataque' },
      { key: 'for_dex_con', value: '3/-2/—', label: 'FOR/DES/CON' },
      { key: 'immunities', value: ['veneno', 'sono', 'doenças', 'precisão'], label: 'Imunidades' },
      { key: 'special', value: 'Perseverança Morta: 1x/combate, ignora redução a 0 PV', label: 'Especial' },
    ], 282,
  ),
  monstro(
    'Lobo',
    'Predador natural das florestas de Arton. Caça em alcateias usando táticas coordenadas para derrubar presas maiores. Lobos veteranos aprendem a derrubar oponentes.',
    'Predador do bosque que caça em grupo e derruba oponentes.',
    1, 'Besta', [
      { key: 'pv', value: 11, label: 'PV' },
      { key: 'defesa', value: 13, label: 'Defesa' },
      { key: 'ataque', value: 'Mordida +4 (2d4+2)', label: 'Ataque' },
      { key: 'for_dex_con', value: '2/2/1', label: 'FOR/DES/CON' },
      { key: 'special', value: 'Derrubar: se acertar, alvo faz Fortitude CD 13 ou cai', label: 'Especial' },
    ], 283,
  ),
  monstro(
    'Esqueleto Arqueiro',
    'Esqueleto animado equipado com arco. Menos robusto que esqueletos de combate, mas pode atacar à distância com precisão sobrenatural.',
    'Morto-vivo arqueiro eficaz a distância.',
    1, 'Morto-Vivo', [
      { key: 'pv', value: 13, label: 'PV' },
      { key: 'defesa', value: 13, label: 'Defesa' },
      { key: 'ataque', value: 'Arco curto +4 (1d6 perfurante, alcance 18m)', label: 'Ataque' },
      { key: 'for_dex_con', value: '0/3/—', label: 'FOR/DES/CON' },
      { key: 'immunities', value: ['veneno', 'frio', 'doenças'], label: 'Imunidades' },
    ], 284,
  ),
  monstro(
    'Hobgoblin',
    'Parentes militaristas dos goblins, os hobgoblins organizam seus grupos com disciplina militar. São lutadores disciplinados que usam formações táticas.',
    'Humanoide goblinoide disciplinado e tático.',
    1, 'Humanoide', [
      { key: 'pv', value: 11, label: 'PV' },
      { key: 'defesa', value: 18, label: 'Defesa' },
      { key: 'ataque', value: 'Espada longa +3 (1d8+1)', label: 'Ataque' },
      { key: 'for_dex_con', value: '1/1/2', label: 'FOR/DES/CON' },
      { key: 'special', value: 'Formação Marcial: +1 em ataque e dano por aliado hobgoblin adjacente (máx +3)', label: 'Especial' },
    ], 285,
  ),
  monstro(
    'Aranha Gigante',
    'Uma aranha do tamanho de um pônei. Tece teias enormes para capturar presas, injectando veneno paralisante com sua mordida.',
    'Aranha enorme com teia e veneno paralisante.',
    2, 'Besta', [
      { key: 'pv', value: 26, label: 'PV' },
      { key: 'defesa', value: 13, label: 'Defesa' },
      { key: 'ataque', value: 'Mordida +4 (1d6 + veneno)', label: 'Ataque' },
      { key: 'for_dex_con', value: '2/3/1', label: 'FOR/DES/CON' },
      { key: 'special', value: 'Veneno: Fortitude CD 13 ou Lento 1 rodada; Teia: alcance 9m, Atletismo CD 15 para escapar', label: 'Especial' },
    ], 286,
  ),
  monstro(
    'Ogro',
    'Humanoides gigantes de baixa inteligência mas força descomunal. Vivem em cavernas e atacam viajantes para se alimentar. Embora lentos de raciocínio, são perigosos em combate direto.',
    'Gigante estúpido de força brutal, habita cavernas.',
    2, 'Gigante', [
      { key: 'pv', value: 59, label: 'PV' },
      { key: 'defesa', value: 11, label: 'Defesa' },
      { key: 'ataque', value: 'Clava +6 (2d8+4 impacto)', label: 'Ataque' },
      { key: 'for_dex_con', value: '5/-1/3', label: 'FOR/DES/CON' },
      { key: 'size', value: 'Grande', label: 'Tamanho' },
      { key: 'special', value: 'Pancada Esmagadora: 1x/rodada, pode derrubar alvo (Fortitude CD 16)', label: 'Especial' },
    ], 287,
  ),
  monstro(
    'Ooze Gelatinosa',
    'Uma massa translúcida que dissolve tudo que toca. Habita corredores de masmorras e é quase invisível em pedra molhada. Engloba criaturas e as digere vivas.',
    'Massa dissolutora que engole e digere criaturas.',
    2, 'Gosma', [
      { key: 'pv', value: 84, label: 'PV' },
      { key: 'defesa', value: 6, label: 'Defesa' },
      { key: 'ataque', value: 'Pseudópode +4 (2d6+1 ácido)', label: 'Ataque' },
      { key: 'for_dex_con', value: '2/-4/6', label: 'FOR/DES/CON' },
      { key: 'immunities', value: ['ácido', 'frio', 'trovão', 'cegado', 'atordoado'], label: 'Imunidades' },
      { key: 'special', value: 'Engolir: criaturas Médias ou menores capturadas recebem 6d6 ácido/rodada', label: 'Especial' },
    ], 288,
  ),
  monstro(
    'Troll',
    'Humanoides regenerativos de pele esverdeada e dentes afiados. Atacam com garras e dentes furiosos. Seu maior perigo é a regeneração — só fogo ou ácido impedem que se refaçam.',
    'Humanoide regenerativo, morre apenas com fogo ou ácido.',
    5, 'Gigante', [
      { key: 'pv', value: 84, label: 'PV' },
      { key: 'defesa', value: 15, label: 'Defesa' },
      { key: 'ataque', value: 'Garra +7 (1d6+5) × 2 + Mordida +7 (1d6+5)', label: 'Ataque' },
      { key: 'for_dex_con', value: '5/1/6', label: 'FOR/DES/CON' },
      { key: 'size', value: 'Grande', label: 'Tamanho' },
      { key: 'special', value: 'Regeneração 5: recupera 5 PV/rodada (fogo e ácido impedem)', label: 'Especial' },
    ], 289,
  ),
  monstro(
    'Wyvern',
    'Dragão menor com dois membros traseiros e asas. Usa o ferrão venenoso na cauda para paralisar presas antes de devorá-las. Territorial e agressivo, ataca qualquer intruso.',
    'Dragão menor com ferrão venenoso na cauda.',
    6, 'Dragão', [
      { key: 'pv', value: 110, label: 'PV' },
      { key: 'defesa', value: 17, label: 'Defesa' },
      { key: 'ataque', value: 'Mordida +9 (2d6+5) + Ferrão +9 (2d6+5 + veneno)', label: 'Ataque' },
      { key: 'for_dex_con', value: '5/1/4', label: 'FOR/DES/CON' },
      { key: 'size', value: 'Grande', label: 'Tamanho' },
      { key: 'flight', value: '18m (manobra III)', label: 'Voo' },
      { key: 'special', value: 'Veneno: Fortitude CD 17 ou Paralisado 1d4 rodadas', label: 'Especial' },
    ], 290,
  ),
  monstro(
    'Demônio Bebelite',
    'Demônio de segunda ordem, servil mas traiçoeiro. Parece humanoide com chifres pequenos e pele avermelhada. Serve demônios maiores como mensageiros e batedores.',
    'Demônio menor traiçoeiro, mensageiro infernal.',
    3, 'Elemental', [
      { key: 'pv', value: 45, label: 'PV' },
      { key: 'defesa', value: 14, label: 'Defesa' },
      { key: 'ataque', value: 'Garra +5 (1d4+2) + Chifre +5 (1d6+2)', label: 'Ataque' },
      { key: 'for_dex_con', value: '2/2/2', label: 'FOR/DES/CON' },
      { key: 'resistances', value: ['fogo', 'frio', 'ácido'], label: 'Resistências' },
      { key: 'special', value: 'Teleporte à Vontade; Língua do Inferno (entende todos os idiomas)', label: 'Especial' },
    ], 291,
  ),
  monstro(
    'Naga Sombria',
    'Serpente humanóide senciente com poderes mágicos. Lidera cultos secretos e usa magia para controlar servos. Inteligente e traiçoeira, prefere manipular a combater diretamente.',
    'Serpente senciente que lidera cultos com magia.',
    7, 'Monstruosidade', [
      { key: 'pv', value: 136, label: 'PV' },
      { key: 'defesa', value: 15, label: 'Defesa' },
      { key: 'ataque', value: 'Mordida +8 (2d6+4 + veneno) ou Magia', label: 'Ataque' },
      { key: 'for_dex_con', value: '4/2/3', label: 'FOR/DES/CON' },
      { key: 'size', value: 'Grande', label: 'Tamanho' },
      { key: 'special', value: 'Magias de 1-3 círculo (à vontade e 3x/dia); Veneno: CON CD 15', label: 'Especial' },
    ], 292,
  ),
  monstro(
    'Vampiro',
    'Morto-vivo predatório que se alimenta do sangue dos vivos. Imortais, sedutores e poderosos, vampiros lideram hierarquias sombrias. Têm fraquezas clássicas: sol, estaca, alho, água benta.',
    'Morto-vivo nobre e poderoso que drena sangue dos vivos.',
    10, 'Morto-Vivo', [
      { key: 'pv', value: 195, label: 'PV' },
      { key: 'defesa', value: 20, label: 'Defesa' },
      { key: 'ataque', value: 'Golpe +12 (1d8+8) + Mordida +12 (1d6+5 + drenagem)', label: 'Ataque' },
      { key: 'for_dex_con', value: '8/4/—', label: 'FOR/DES/CON' },
      { key: 'resistances', value: ['físico não-prateado ou mágico'], label: 'Resistências' },
      { key: 'immunities', value: ['veneno', 'doenças', 'sono', 'paralisia', 'fome'], label: 'Imunidades' },
      { key: 'special', value: 'Hipnose (Vontade CD 18); Névoa (forma gasosa); Regeneração 10 (exceto sol e estaca)', label: 'Especial' },
    ], 293,
  ),
  monstro(
    'Lich',
    'Mago que alcançou a imortalidade através de rituais necromânticos. Guarda sua alma em uma phylactery, tornando-se praticamente imortal. Acumula poder por séculos, tornando-se uma das maiores ameaças de Arton.',
    'Mago imortal de poder absoluto, alma guardada em phylactery.',
    16, 'Morto-Vivo', [
      { key: 'pv', value: 300, label: 'PV' },
      { key: 'defesa', value: 22, label: 'Defesa' },
      { key: 'ataque', value: 'Toque Paralisante +12 (3d6 frio + Paralisado) ou Magias', label: 'Ataque' },
      { key: 'for_dex_con', value: '0/4/—', label: 'FOR/DES/CON' },
      { key: 'immunities', value: ['físico, veneno, doenças, fome, sono, paralisia, Apavorado'], label: 'Imunidades' },
      { key: 'special', value: 'Phylactery (renascimento em 1d10 dias); Magias de até 9º círculo; Resistência Mágica 25', label: 'Especial' },
    ], 294,
  ),
  monstro(
    'Dragão Vermelho Ancião',
    'O maior e mais perigoso dragão das montanhas de Arton. Orgulhoso, ganancioso e incrivelmente destrutivo. Seu sopro pode derreter pedras e sua presença basta para amedrontar exércitos inteiros.',
    'O dragão mais poderoso de Arton, sopro derrете pedras.',
    20, 'Dragão', [
      { key: 'pv', value: 546, label: 'PV' },
      { key: 'defesa', value: 22, label: 'Defesa' },
      { key: 'ataque', value: 'Mordida +17 (4d8+10) + 2 Garras +17 (2d6+10) + Cauda +17 (2d8+10)', label: 'Ataque' },
      { key: 'for_dex_con', value: '10/-1/8', label: 'FOR/DES/CON' },
      { key: 'size', value: 'Enorme', label: 'Tamanho' },
      { key: 'flight', value: '24m (manobra IV)', label: 'Voo' },
      { key: 'special', value: 'Sopro Cone de Fogo 18m (20d10, Reflexos CD 25 reduz); Presença Aterrorizante (9m, Vontade CD 23 ou Apavorado); Imune a Fogo', label: 'Especial' },
    ], 298,
  ),
];

// ─── Itens e Equipamentos ─────────────────────────────────────────────────────

function item(
  name: string,
  desc: string,
  shortDesc: string,
  category: string,
  price: number,
  attrs: Array<{ key: string; value: string | number; label: string }>,
  page: number,
): SeedEntry {
  return {
    name,
    description: desc,
    shortDescription: shortDesc,
    type: EntryType.ITEM,
    system: 'tormenta20',
    tags: ['item', category],
    attributes: [
      { key: 'category', value: category, label: 'Categoria' },
      { key: 'price', value: `${price} TO`, label: 'Preço' },
      ...attrs,
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page },
  };
}

export const T20_ITENS: SeedEntry[] = [
  // ── Armas ─────────────────────────────────────────────────────────────────
  item('Adaga', 'Lâmina curta e leve, usada por ladinos e como arma secundária. Pode ser arremessada.', 'Lâmina leve, arremessável.', 'arma', 5, [
    { key: 'damage', value: '1d4 cortante/perfurante', label: 'Dano' },
    { key: 'properties', value: 'Leve, Arremesso (3/9m), Perfuração', label: 'Propriedades' },
    { key: 'weight', value: '0,5 kg', label: 'Peso' },
  ], 310),
  item('Espada Curta', 'Espada de lâmina reta e pontuda, ideal para Destreza.', 'Espada leve e pontuda.', 'arma', 15, [
    { key: 'damage', value: '1d6 perfurante', label: 'Dano' },
    { key: 'properties', value: 'Finesse, Leve', label: 'Propriedades' },
    { key: 'weight', value: '1 kg', label: 'Peso' },
  ], 311),
  item('Espada Longa', 'A espada padrão de guerreiros e cavaleiros. Versátil, pode ser usada com uma ou duas mãos.', 'Espada versátil de guerreiros.', 'arma', 30, [
    { key: 'damage', value: '1d8 cortante (1d10 duas mãos)', label: 'Dano' },
    { key: 'properties', value: 'Versátil', label: 'Propriedades' },
    { key: 'weight', value: '1,5 kg', label: 'Peso' },
  ], 312),
  item('Machado de Batalha', 'Machado de guerra pesado, preferido por guerreiros de força bruta.', 'Machado pesado de alto dano.', 'arma', 25, [
    { key: 'damage', value: '1d8 cortante (1d10 duas mãos)', label: 'Dano' },
    { key: 'properties', value: 'Versátil', label: 'Propriedades' },
    { key: 'weight', value: '2 kg', label: 'Peso' },
  ], 313),
  item('Espadão', 'Espada de dois gumes enorme que exige as duas mãos. O máximo de dano bruto em armas de lâmina.', 'Espada gigante de duas mãos.', 'arma', 75, [
    { key: 'damage', value: '2d6 cortante', label: 'Dano' },
    { key: 'properties', value: 'Duas mãos, Pesada', label: 'Propriedades' },
    { key: 'weight', value: '3 kg', label: 'Peso' },
  ], 314),
  item('Arco Curto', 'Arco compacto para combate a distância em terrenos fechados.', 'Arco compacto de curto alcance.', 'arma', 30, [
    { key: 'damage', value: '1d6 perfurante', label: 'Dano' },
    { key: 'range', value: '18/72m', label: 'Alcance' },
    { key: 'properties', value: 'Munição, Duas mãos', label: 'Propriedades' },
    { key: 'weight', value: '1 kg', label: 'Peso' },
  ], 315),
  item('Arco Longo', 'O arco preferido de arqueiros treinados. Alcance excepcional e dano maior.', 'Arco de longo alcance para arqueiros.', 'arma', 75, [
    { key: 'damage', value: '1d8 perfurante', label: 'Dano' },
    { key: 'range', value: '45/180m', label: 'Alcance' },
    { key: 'properties', value: 'Munição, Pesada, Duas mãos', label: 'Propriedades' },
    { key: 'weight', value: '1 kg', label: 'Peso' },
  ], 316),
  item('Besta Leve', 'Arma mecânica que dispara virotes. Fácil de usar mas demora para recarregar.', 'Arco mecânico de virotes, fácil de usar.', 'arma', 40, [
    { key: 'damage', value: '1d8 perfurante', label: 'Dano' },
    { key: 'range', value: '24/96m', label: 'Alcance' },
    { key: 'properties', value: 'Munição, Recarga (ação de movimento), Duas mãos', label: 'Propriedades' },
    { key: 'weight', value: '2,5 kg', label: 'Peso' },
  ], 317),
  item('Lança', 'Arma de haste com ponta de metal. Pode ser arremessada ou usada em combate corpo a corpo.', 'Haste com ponta, arremessável.', 'arma', 5, [
    { key: 'damage', value: '1d6 perfurante', label: 'Dano' },
    { key: 'range', value: '6/18m (arremesso)', label: 'Alcance' },
    { key: 'properties', value: 'Arremesso, Alcance', label: 'Propriedades' },
    { key: 'weight', value: '1,5 kg', label: 'Peso' },
  ], 318),
  item('Cajado', 'Bastão de madeira resistente que pode ser usado como arma ou foco mágico.', 'Bastão mágico e arma versátil.', 'arma', 5, [
    { key: 'damage', value: '1d6 impacto', label: 'Dano' },
    { key: 'properties', value: 'Versátil (1d8), Foco arcano', label: 'Propriedades' },
    { key: 'weight', value: '2 kg', label: 'Peso' },
  ], 319),

  // ── Armaduras ─────────────────────────────────────────────────────────────
  item('Gibão de Couro', 'Armadura básica de couro endurecido. Proteção mínima, máxima mobilidade.', 'Armadura leve de couro básica.', 'armadura', 10, [
    { key: 'defense_bonus', value: '+2 Defesa', label: 'Bônus Defesa' },
    { key: 'armor_type', value: 'Leve', label: 'Tipo' },
    { key: 'check_penalty', value: 0, label: 'Penalidade' },
    { key: 'weight', value: '5 kg', label: 'Peso' },
  ], 325),
  item('Cota de Malha', 'Anéis entrelaçados de metal. Boa proteção sem sacrificar muito a mobilidade.', 'Armadura de anéis de metal.', 'armadura', 150, [
    { key: 'defense_bonus', value: '+4 Defesa', label: 'Bônus Defesa' },
    { key: 'armor_type', value: 'Média', label: 'Tipo' },
    { key: 'check_penalty', value: -3, label: 'Penalidade' },
    { key: 'dex_max', value: '+2 Destreza máximo', label: 'DES máxima' },
    { key: 'weight', value: '18 kg', label: 'Peso' },
  ], 326),
  item('Armadura de Placas', 'A melhor proteção que um guerreiro comum pode comprar. Pesada mas quase impenetrável.', 'Armadura pesada de placas de metal.', 'armadura', 600, [
    { key: 'defense_bonus', value: '+8 Defesa', label: 'Bônus Defesa' },
    { key: 'armor_type', value: 'Pesada', label: 'Tipo' },
    { key: 'check_penalty', value: -6, label: 'Penalidade' },
    { key: 'dex_max', value: '+0 Destreza máximo', label: 'DES máxima' },
    { key: 'weight', value: '32 kg', label: 'Peso' },
  ], 327),
  item('Escudo', 'Escudo de madeira reforçado com metal. A defesa adicional mais acessível.', 'Escudo de madeira e metal.', 'armadura', 10, [
    { key: 'defense_bonus', value: '+2 Defesa', label: 'Bônus Defesa' },
    { key: 'armor_type', value: 'Escudo', label: 'Tipo' },
    { key: 'check_penalty', value: -1, label: 'Penalidade' },
    { key: 'weight', value: '3 kg', label: 'Peso' },
  ], 328),

  // ── Poções ────────────────────────────────────────────────────────────────
  item('Poção de Cura Menor', 'Béquer de líquido avermelhado que cura ferimentos ao ser ingerido.', 'Cura 2d8+3 PV ao beber.', 'poção', 50, [
    { key: 'healing', value: '2d8+3 PV', label: 'Cura' },
    { key: 'action_to_drink', value: 'Ação Padrão', label: 'Ação para Beber' },
  ], 335),
  item('Poção de Cura Moderada', 'Poção mais concentrada com energia curativa mais potente.', 'Cura 3d8+5 PV ao beber.', 'poção', 150, [
    { key: 'healing', value: '3d8+5 PV', label: 'Cura' },
    { key: 'action_to_drink', value: 'Ação Padrão', label: 'Ação para Beber' },
  ], 335),
  item('Poção de Curar Veneno', 'Antídoto mágico que neutraliza todos os venenos no corpo.', 'Neutraliza todos os venenos.', 'poção', 100, [
    { key: 'effect', value: 'Remove todos os efeitos de veneno', label: 'Efeito' },
    { key: 'action_to_drink', value: 'Ação Padrão', label: 'Ação para Beber' },
  ], 336),
  item('Poção de Velocidade', 'Poção de cor laranja que acelera os movimentos e reflexos.', 'Dobra o deslocamento e ações por 1 rodada.', 'poção', 200, [
    { key: 'effect', value: 'Dobra deslocamento, +2 ataques, +2 Defesa por 1 rodada', label: 'Efeito' },
    { key: 'duration', value: '1 rodada', label: 'Duração' },
    { key: 'action_to_drink', value: 'Ação Livre', label: 'Ação para Beber' },
  ], 336),
  item('Óleo de Flamejamento', 'Óleo mágico que encobre uma arma em chamas por 1 minuto.', '+1d6 de dano de fogo por 1 minuto.', 'poção', 75, [
    { key: 'bonus_damage', value: '+1d6 fogo por 1 minuto', label: 'Dano Bônus' },
    { key: 'action_to_apply', value: 'Ação Padrão', label: 'Ação para Aplicar' },
  ], 337),

  // ── Itens Mágicos ─────────────────────────────────────────────────────────
  item('Anel de Proteção +1', 'Anel mágico que forma um escudo invisível ao redor do portador.', '+1 Defesa e testes de resistência.', 'item-mágico', 1500, [
    { key: 'bonus', value: '+1 Defesa e Resistências', label: 'Bônus' },
    { key: 'attunement', value: 'Sim', label: 'Sintonização' },
  ], 345),
  item('Botas de Velocidade', 'Botas encantadas que permitem ao portador mover-se mais rápido que o normal.', '+3m de deslocamento, ignora terreno difícil.', 'item-mágico', 2500, [
    { key: 'bonus', value: '+3m de deslocamento', label: 'Bônus' },
    { key: 'special', value: 'Ignora terreno difícil', label: 'Especial' },
    { key: 'attunement', value: 'Sim', label: 'Sintonização' },
  ], 346),
  item('Capa de Invisibilidade', 'Capa tecida com fio mágico que permite ao portador tornar-se invisível.', 'Ficar invisível por 1 hora/dia (acumulável).', 'item-mágico', 5000, [
    { key: 'uses', value: '1 hora/dia (cumulativa)', label: 'Usos' },
    { key: 'action_to_activate', value: 'Ação de Movimento', label: 'Ativação' },
    { key: 'attunement', value: 'Sim', label: 'Sintonização' },
  ], 347),
  item('Espada +1', 'Espada longa com encantamento mágico simples. A arma mágica mais comum de Arton.', 'Espada longa +1 de ataque e dano.', 'item-mágico', 2000, [
    { key: 'bonus', value: '+1 em ataque e dano', label: 'Bônus' },
    { key: 'base_weapon', value: 'Espada longa (1d8 cortante)', label: 'Arma Base' },
    { key: 'attunement', value: 'Não', label: 'Sintonização' },
  ], 348),
  item('Amuleto de Saúde', 'Pingente de quartzo rosa que fortalece a vitalidade do portador.', '+10 PV máximos enquanto equipado.', 'item-mágico', 3000, [
    { key: 'bonus', value: '+10 PV máximos', label: 'Bônus' },
    { key: 'attunement', value: 'Sim', label: 'Sintonização' },
  ], 349),

  // ── Equipamentos Gerais ───────────────────────────────────────────────────
  item('Corda (15m)', 'Corda resistente de cânhamo, suporta até 300kg.', 'Corda de cânhamo de 15 metros.', 'equipamento', 1, [
    { key: 'length', value: '15 metros', label: 'Comprimento' },
    { key: 'capacity', value: '300 kg', label: 'Capacidade' },
    { key: 'weight', value: '5 kg', label: 'Peso' },
  ], 360),
  item('Tocha', 'Bastão com ponta embebida em resina. Ilumina 6m por 1 hora.', 'Ilumina 6m por 1 hora.', 'equipamento', 1, [
    { key: 'light', value: '6m de raio', label: 'Luz' },
    { key: 'duration', value: '1 hora', label: 'Duração' },
    { key: 'weight', value: '0,5 kg', label: 'Peso' },
  ], 361),
  item('Varinha de Fogo (10 cargas)', 'Varinha de madeira de árvore incendiária com energia mágica armazenada.', 'Dispara Bola de Fogo (3 cargas) ou Chamas (1 carga).', 'item-mágico', 1500, [
    { key: 'charges', value: 10, label: 'Cargas' },
    { key: 'abilities', value: 'Bola de Fogo (3 cargas) ou Mãos Flamejantes (1 carga)', label: 'Habilidades' },
    { key: 'attunement', value: 'Não', label: 'Sintonização' },
  ], 362),
  item('Pederneira e Isqueiro', 'Ferramentas para acender fogo. Demora 1 minuto para acender algo.', 'Acende fogo em 1 minuto.', 'equipamento', 1, [
    { key: 'use_time', value: '1 minuto', label: 'Tempo de Uso' },
    { key: 'weight', value: '0,1 kg', label: 'Peso' },
  ], 363),
  item('Mochila de Aventureiro', 'Mochila com compartimentos múltiplos, capacidade de 18kg.', 'Mochila com 18kg de capacidade.', 'equipamento', 10, [
    { key: 'capacity', value: '18 kg', label: 'Capacidade' },
    { key: 'includes', value: 'Mochila, corda 3m, saco de dormir, cantil, isqueiro', label: 'Inclui' },
    { key: 'weight', value: '2 kg', label: 'Peso' },
  ], 364),
];

// ─── Export ───────────────────────────────────────────────────────────────────

export const ALL_T20_NOVOS_MONSTROS_ITENS: SeedEntry[] = [
  ...T20_MONSTROS_NOVOS,
  ...T20_ITENS,
];
