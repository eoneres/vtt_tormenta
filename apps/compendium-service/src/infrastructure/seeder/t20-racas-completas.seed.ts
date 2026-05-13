import { EntryType } from '../../domain/entry/entry.entity';
import type { CreateEntryProps } from '../../domain/entry/entry.entity';

type SeedEntry = Omit<CreateEntryProps, 'isOfficial' | 'isHomebrew' | 'createdBy' | 'isPublic'>;

/**
 * Tormenta20 — Raças Completas (complementa as 3 existentes: Humano, Anão, Elfo)
 * Fonte: Tormenta20 Livro Básico
 */
export const T20_RACAS_COMPLETAS: SeedEntry[] = [
  // ── Já existem no seed original: Humano, Anão, Elfo ──────────────────────

  {
    name: 'Halfling',
    description:
      'Halflings são pequenas criaturas alegres e otimistas, com pés peludos e sorte inexplicável. Cheios de curiosidade, adoram explorar o mundo e fazer novos amigos. Sua habilidade natural de esquivar do perigo os torna sobreviventes notáveis.',
    shortDescription: 'Pequenos e sortudos, com pés peludos e espírito aventureiro.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'halfling', 'sorte', 'pequeno'],
    attributes: [
      { key: 'displacement', value: '6m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Destreza', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Pequeno', label: 'Tamanho' },
      { key: 'special', value: 'Sortudo — 1x/rodada, relança um d20', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 48 },
  },
  {
    name: 'Goblin',
    description:
      'Goblins são criaturas ágeis, astutas e criativas. Apesar da reputação ruim, os goblins que se tornam aventureiros geralmente buscam provar seu valor. São naturalmente furtivos e sabem usar o ambiente a seu favor.',
    shortDescription: 'Ágeis e espertos, com instinto furtivo e engenhosidade natural.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'goblin', 'furtividade', 'agilidade'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Destreza', label: 'Bônus de Atributo' },
      { key: 'dark_vision', value: '18m', label: 'Visão no Escuro' },
      { key: 'size', value: 'Pequeno', label: 'Tamanho' },
      { key: 'special', value: 'Fuga Astuta — movimento como ação livre 1x/rodada se atacado', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 50 },
  },
  {
    name: 'Lefou',
    description:
      'Lefou são seres corrompidos pelo caos, com aparência grotesca e poderes místicos imprevisíveis. Produto da influência do Skar, eles lutam contra sua natureza sombria, sendo aventureiros que buscam redenção ou simplesmente sobrevivência.',
    shortDescription: 'Corrompidos pelo caos, com poderes místicos imprevisíveis.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'lefou', 'caos', 'skar', 'corrupto'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Carisma', label: 'Bônus de Atributo' },
      { key: 'dark_vision', value: '12m', label: 'Visão no Escuro' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Resistência à magia do caos (+5); Mutação caótica (bônus variável)', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 52 },
  },
  {
    name: 'Minotauro',
    description:
      'Minotauros são criaturas imponentes com cabeça de touro e corpo humanoide musculoso. Apesar da reputação de violentos, são seres de honra que seguem um código de guerreiros. Sua força descomunal e resistência física os tornam guerreiros notáveis.',
    shortDescription: 'Guerreiros imponentes com cabeça de touro e código de honra.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'minotauro', 'força', 'guerreiro', 'touro'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Força', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Grande', label: 'Tamanho' },
      { key: 'natural_armor', value: '+2 em Defesa', label: 'Armadura Natural' },
      { key: 'special', value: 'Chifrada: ataque natural 1d8 + For', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 54 },
  },
  {
    name: 'Qareen',
    description:
      'Qareens são genios ligados à magia elemental e aos desejos. Descendentes de djinn, possuem traços etéreos e habilidades mágicas naturais. São sedutores e carismáticos, com um talento especial para a ilusão e encantamento.',
    shortDescription: 'Descendentes de genios, com habilidades mágicas e carisma sobrenatural.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'qareen', 'genio', 'magia', 'carisma'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Carisma', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Magia Inata: 1 magia de 1º círculo 3x/dia (PM 0)', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 56 },
  },
  {
    name: 'Sereia/Tritão',
    description:
      'Sereias e Tritões são seres aquáticos com metade humana e metade peixe. Guardiões dos oceanos de Arton, possuem voz encantadora e a capacidade de respirar sob a água. Em terra, usam encantamentos para se mover.',
    shortDescription: 'Guardiões aquáticos com voz encantadora e afinidade com o mar.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'sereia', 'tritão', 'aquático', 'magia'],
    attributes: [
      { key: 'displacement', value: '9m (12m natando)', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Carisma', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Anfíbio: respira água e ar; Encantamento: +5 em Diplomacia', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 58 },
  },
  {
    name: 'Sílfide',
    description:
      'Sílfides são criaturas etéreas ligadas ao vento e à liberdade. Com corpo leviano e asas delicadas, adoram os altos céus de Arton. São impulsivas e impacientes, mas extraordinariamente habilidosas em magia e acrobacia.',
    shortDescription: 'Seres etéreos do vento, com asas delicadas e espírito livre.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'sílfide', 'vento', 'voo', 'magia'],
    attributes: [
      { key: 'displacement', value: '9m (15m voando)', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Destreza', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Voo (manobra III); Leveza: não ativa armadilhas de pressão', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 60 },
  },
  {
    name: 'Suraggel',
    description:
      'Suraggels são híbridos de anjos ou demônios com humanos. Possuem traços divinos ou infernais marcantes. Filhos de Aeon (aggelus) ou do Skar (sulfure), carregam o peso de sua herança sobrenatural enquanto buscam seu próprio destino.',
    shortDescription: 'Híbridos celestiais ou infernais com poderes divinos ou demoníacos.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'suraggel', 'aggelus', 'sulfure', 'divino', 'infernal'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Sabedoria (aggelus) ou +2 Carisma (sulfure)', label: 'Bônus de Atributo' },
      { key: 'dark_vision', value: '18m', label: 'Visão no Escuro' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Resistência a fogo ou ácido 5; Detecção de maldade/bem', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 62 },
  },
  {
    name: 'Hynne',
    description:
      'Hynnes são seres que mesclam traços de diferentes raças humanoides, fruto de antigas misturas mágicas. Extremamente versáteis, podem herdar características de qualquer raça parental, tornando cada hynne verdadeiramente único.',
    shortDescription: 'Híbridos versáteis com traços únicos de múltiplas raças.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'hynne', 'híbrido', 'versátil'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 em um atributo à escolha', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Herança Múltipla: escolhe 1 poder de raça de qualquer raça parental', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 64 },
  },
  {
    name: 'Elfo da Floresta',
    description:
      'Elfos da Floresta são mais selvagens que seus primos, vivendo em comunhão profunda com a natureza. São mais robustos fisicamente e possuem laços mágicos com animais e plantas. Seu instinto de caça os torna rastreadores excepcionais.',
    shortDescription: 'Elfos selvagens em harmonia total com a natureza e os animais.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'elfo', 'floresta', 'natureza', 'rastreador'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Força', label: 'Bônus de Atributo' },
      { key: 'dark_vision', value: '18m', label: 'Visão no Escuro' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Familiaridade com natureza: +2 Sobrevivência e Furtividade em florestas', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 47 },
  },
  {
    name: 'Dahllan',
    description:
      'Dahllans são criaturas da natureza com corpo parcialmente vegetal. Nascidas das florestas sagradas de Arton, possuem conexão profunda com plantas e animais. Sua pele tem a textura da casca de árvore e flores brotam em seus cabelos.',
    shortDescription: 'Seres vegetais da floresta sagrada, guardiões da natureza.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'dahllan', 'natureza', 'planta', 'floresta'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Sabedoria', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Regeneração vegetal: recupera 1 PV/rodada em luz solar; Imunidade a sono', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 66 },
  },
  {
    name: 'Kliren',
    description:
      'Klirens são seres humanos com afinidade mágica excepcional, corpo incandescente de energia arcana. Produto de experimentos mágicos antigos, possuem a habilidade de absorver e redirecionar energia mágica de formas únicas.',
    shortDescription: 'Humanos transfigurados pela magia, com corpo incandescente de energia arcana.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'kliren', 'magia', 'energia', 'arcano'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Inteligência', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Absorção Mágica: 1x/cena, anula magia e recupera PM igual ao círculo', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 68 },
  },
  {
    name: 'Osteon',
    description:
      'Osteons são mortos-vivos inteligentes que mantiveram sua vontade e personalidade. Já não precisam comer, dormir ou respirar, mas carregam o peso psicológico de saber que estão mortos. Buscam propósito além da morte.',
    shortDescription: 'Mortos-vivos inteligentes que preservaram sua consciência e vontade.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'osteon', 'morto-vivo', 'esqueleto', 'necromancia'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Constituição', label: 'Bônus de Atributo' },
      { key: 'dark_vision', value: '18m', label: 'Visão no Escuro' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      {
        key: 'special',
        value: 'Imunidade: veneno, sono, doenças; Vulnerabilidade: energia positiva causa dano',
        label: 'Especial',
      },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 70 },
  },
  {
    name: 'Trog',
    description:
      'Trogs são meio-orcs ou criaturas bestiárias, robustos e ferozes. Marginalizados pela sociedade, desenvolveram resiliência e determinação únicas. Na batalha, sua raiva e força bruta podem ser devastadoras.',
    shortDescription: 'Criaturas bestiárias robustas com força bruta e determinação feroz.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'trog', 'meio-orc', 'força', 'brutalidade'],
    attributes: [
      { key: 'displacement', value: '9m', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Força', label: 'Bônus de Atributo' },
      { key: 'dark_vision', value: '12m', label: 'Visão no Escuro' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Resistência Brutal: 1x/cena, ignora dano igual ao nível', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 72 },
  },
  {
    name: 'Vinfolk',
    description:
      'Vinfolks são humanoides com traços de planta trepadeira: pele verde-esmeralda, cabelos como lianas e a capacidade de absorver nutrição pelo solo. São calmos e pacientes como as florestas que habitam, mas implacáveis quando sua terra é ameaçada.',
    shortDescription: 'Humanoides vegetais calmos e resilientes, protetores de suas florestas.',
    type: EntryType.RACE,
    system: 'tormenta20',
    tags: ['raça', 'vinfolk', 'planta', 'trepadeira', 'natureza'],
    attributes: [
      { key: 'displacement', value: '9m (18m escalar)', label: 'Deslocamento' },
      { key: 'racial_powers', value: 2, label: 'Poderes de Raça' },
      { key: 'ability_bonus', value: '+2 Constituição', label: 'Bônus de Atributo' },
      { key: 'size', value: 'Médio', label: 'Tamanho' },
      { key: 'special', value: 'Enraizar: ação livre, +4 Defesa enquanto parado; Trepadeira Natural', label: 'Especial' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 74 },
  },
];
