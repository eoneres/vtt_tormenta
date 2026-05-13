import { EntryType } from '../../domain/entry/entry.entity';
import type { CreateEntryProps } from '../../domain/entry/entry.entity';

type SeedEntry = Omit<CreateEntryProps, 'isOfficial' | 'isHomebrew' | 'createdBy' | 'isPublic'>;

/**
 * Tormenta20 — Classes Restantes (6 classes para completar as 14 do LB)
 * As 8 existentes: Guerreiro, Mago, Clérigo, Ladino, Bárbaro, Bardo, Paladino, Druida
 */
export const T20_CLASSES_RESTANTES: SeedEntry[] = [
  {
    name: 'Arcanista',
    description:
      'Arcanistas dominam a magia em sua forma mais pura e caótica. Ao contrário dos magos metódicos, os arcanistas canalizam energia arcana intuitivamente, às vezes com resultados imprevisíveis mas devastadores. São os maiores lançadores de magias ofensivas de Arton.',
    shortDescription: 'Lançador arcano intuitivo, mestre da magia ofensiva e do poder bruto.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'arcanista', 'magia', 'arcano', 'ataque'],
    attributes: [
      { key: 'pv_per_level', value: '4 + mod. Constituição', label: 'PV por Nível' },
      { key: 'pm_per_level', value: '6 + mod. Inteligência', label: 'PM por Nível' },
      { key: 'key_attribute', value: 'Inteligência', label: 'Atributo-Chave' },
      { key: 'armor_proficiency', value: 'Nenhuma', label: 'Proficiência de Armadura' },
      { key: 'weapon_proficiency', value: 'Simples', label: 'Proficiência de Arma' },
      { key: 'skills_per_level', value: '2 + mod. Inteligência', label: 'Perícias/Nível' },
      {
        key: 'level_progression',
        value: JSON.stringify({
          1: { features: ['Magia Arcana (1º círculo)', 'Resiliência Arcana'], pm_bonus: 0 },
          2: { features: ['Poder de Arcanista'], pm_bonus: 2 },
          3: { features: ['Magia (2º círculo)'], pm_bonus: 2 },
          4: { features: ['Poder de Arcanista'], pm_bonus: 2 },
          5: { features: ['Magia (3º círculo)', 'Surto Arcano'], pm_bonus: 3 },
          6: { features: ['Poder de Arcanista'], pm_bonus: 3 },
          7: { features: ['Magia (4º círculo)'], pm_bonus: 3 },
          8: { features: ['Poder de Arcanista'], pm_bonus: 4 },
          9: { features: ['Magia (5º círculo)'], pm_bonus: 4 },
          10: { features: ['Poder de Arcanista', 'Maestria Arcana'], pm_bonus: 5 },
          20: { features: ['Magia Suprema'], pm_bonus: 10 },
        }),
        label: 'Progressão por Nível',
      },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 88 },
  },
  {
    name: 'Caçador',
    description:
      'Caçadores são rastreadores e sobreviventes incomparáveis. Especialistas em terreno aberto, eles usam armadilhas, arqueria e conhecimento profundo da natureza para caçar suas presas. Cada caçador escolhe um inimigo predileto contra o qual se especializa.',
    shortDescription: 'Rastreador especialista, mestre em arqueria e inimigos prediletos.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'caçador', 'rastreador', 'natureza', 'arco'],
    attributes: [
      { key: 'pv_per_level', value: '6 + mod. Constituição', label: 'PV por Nível' },
      { key: 'pm_per_level', value: '3 + mod. Sabedoria', label: 'PM por Nível' },
      { key: 'key_attribute', value: 'Destreza ou Força', label: 'Atributo-Chave' },
      { key: 'armor_proficiency', value: 'Leve e média', label: 'Proficiência de Armadura' },
      { key: 'weapon_proficiency', value: 'Simples e marciais', label: 'Proficiência de Arma' },
      { key: 'skills_per_level', value: '4 + mod. Inteligência', label: 'Perícias/Nível' },
      {
        key: 'level_progression',
        value: JSON.stringify({
          1: { features: ['Inimigo Predileto', 'Rastreamento', 'Explorador'], pm_bonus: 0 },
          2: { features: ['Poder de Caçador'], pm_bonus: 1 },
          3: { features: ['Inimigo Predileto (2º)', 'Sentido de Sobrevivência'], pm_bonus: 1 },
          5: { features: ['Inimigo Predileto (3º)', 'Magia (1º círculo)'], pm_bonus: 2 },
          10: { features: ['Inimigo Predileto (4º)', 'Maestria do Terreno'], pm_bonus: 3 },
          20: { features: ['Inimigo Mortal'], pm_bonus: 6 },
        }),
        label: 'Progressão por Nível',
      },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 96 },
  },
  {
    name: 'Inventor',
    description:
      'Inventores são gênios da engenharia arcano-mecânica. Criam dispositivos, autômatos e engenhos mágicos que transformam o campo de batalha. Combinam ciência e magia de formas que deixam outros encantadores perplexos.',
    shortDescription: 'Engenheiro arcano que cria dispositivos mágicos e autômatos de combate.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'inventor', 'engenharia', 'autômato', 'dispositivo'],
    attributes: [
      { key: 'pv_per_level', value: '6 + mod. Constituição', label: 'PV por Nível' },
      { key: 'pm_per_level', value: '4 + mod. Inteligência', label: 'PM por Nível' },
      { key: 'key_attribute', value: 'Inteligência', label: 'Atributo-Chave' },
      { key: 'armor_proficiency', value: 'Leve e média', label: 'Proficiência de Armadura' },
      { key: 'weapon_proficiency', value: 'Simples e marciais', label: 'Proficiência de Arma' },
      { key: 'skills_per_level', value: '4 + mod. Inteligência', label: 'Perícias/Nível' },
      {
        key: 'level_progression',
        value: JSON.stringify({
          1: { features: ['Autômato (1 módulo)', 'Engenhosidade'], pm_bonus: 0 },
          2: { features: ['Poder de Inventor', 'Módulo de Autômato'], pm_bonus: 1 },
          5: { features: ['Autômato Aprimorado', 'Magia (1º círculo)'], pm_bonus: 2 },
          10: { features: ['Autômato Avançado (3 módulos)'], pm_bonus: 4 },
          20: { features: ['Obra-Prima: Autômato Lendário'], pm_bonus: 8 },
        }),
        label: 'Progressão por Nível',
      },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 104 },
  },
  {
    name: 'Lutador',
    description:
      'Lutadores são mestres do combate corpo a corpo sem armas. Usando técnicas precisas de luta, podem atordoar, imobilizar e derrubar inimigos muito maiores que eles. Sua força interior (ki) potencializa golpes sobre-humanos.',
    shortDescription: 'Mestre de combate desarmado com ki, ataques rápidos e técnicas de luta.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'lutador', 'ki', 'combate', 'artes-marciais'],
    attributes: [
      { key: 'pv_per_level', value: '8 + mod. Constituição', label: 'PV por Nível' },
      { key: 'pm_per_level', value: '4 + mod. Sabedoria', label: 'PM por Nível' },
      { key: 'key_attribute', value: 'Força ou Destreza', label: 'Atributo-Chave' },
      { key: 'armor_proficiency', value: 'Leve', label: 'Proficiência de Armadura' },
      { key: 'weapon_proficiency', value: 'Simples e marciais leves', label: 'Proficiência de Arma' },
      { key: 'skills_per_level', value: '4 + mod. Inteligência', label: 'Perícias/Nível' },
      {
        key: 'level_progression',
        value: JSON.stringify({
          1: { features: ['Golpe Desarmado (1d6)', 'Ataque Extra', 'Defesa sem Armadura'], pm_bonus: 0 },
          2: { features: ['Poder de Lutador', 'Ki (2 pontos)'], pm_bonus: 1 },
          3: { features: ['Golpe Desarmado (1d8)', 'Estilo de Luta'], pm_bonus: 1 },
          5: { features: ['Surto de Ki'], pm_bonus: 2 },
          10: { features: ['Golpe Desarmado (1d12)', 'Ki (10 pontos)'], pm_bonus: 4 },
          20: { features: ['Mestre das Artes Marciais', 'Ki Supremo'], pm_bonus: 8 },
        }),
        label: 'Progressão por Nível',
      },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 112 },
  },
  {
    name: 'Nobre',
    description:
      'Nobres são líderes natos que influenciam aliados e inimigos com carisma, táticas e riqueza. Mestres da política e da guerra, transformam batalhas com comandos inspirados. Sua rede de contatos e recursos financeiros são armas tão poderosas quanto qualquer espada.',
    shortDescription: 'Líder carismático com táticas de batalha, influência social e recursos.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'nobre', 'liderança', 'carisma', 'político'],
    attributes: [
      { key: 'pv_per_level', value: '6 + mod. Constituição', label: 'PV por Nível' },
      { key: 'pm_per_level', value: '4 + mod. Carisma', label: 'PM por Nível' },
      { key: 'key_attribute', value: 'Carisma', label: 'Atributo-Chave' },
      { key: 'armor_proficiency', value: 'Leve e média', label: 'Proficiência de Armadura' },
      { key: 'weapon_proficiency', value: 'Simples e marciais', label: 'Proficiência de Arma' },
      { key: 'skills_per_level', value: '6 + mod. Inteligência', label: 'Perícias/Nível' },
      {
        key: 'level_progression',
        value: JSON.stringify({
          1: { features: ['Inspire Courage', 'Contatos (2)', 'Posição Social'], pm_bonus: 0 },
          2: { features: ['Poder de Nobre'], pm_bonus: 1 },
          3: { features: ['Tática de Batalha'], pm_bonus: 1 },
          5: { features: ['Inspirar Bravura (3d6)', 'Contatos (4)'], pm_bonus: 2 },
          10: { features: ['Liderança Suprema'], pm_bonus: 4 },
          20: { features: ['Rei/Rainha de Arton'], pm_bonus: 8 },
        }),
        label: 'Progressão por Nível',
      },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 120 },
  },
  {
    name: 'Bucaneiro',
    description:
      'Bucaneiros são piratas, duelistas e aventureiros dos mares. Combinam agilidade de lutador com astúcia de ladino. Especialistas em duelos com estoque ou sabre, usam armas de fogo rudimentares e manobras acrobáticas para surpreender os inimigos.',
    shortDescription: 'Duelista ágil dos mares, mestre em esgrima e manobras acrobáticas.',
    type: EntryType.CLASS,
    system: 'tormenta20',
    tags: ['classe', 'bucaneiro', 'pirata', 'duelista', 'esgrima'],
    attributes: [
      { key: 'pv_per_level', value: '8 + mod. Constituição', label: 'PV por Nível' },
      { key: 'pm_per_level', value: '3 + mod. Carisma', label: 'PM por Nível' },
      { key: 'key_attribute', value: 'Destreza', label: 'Atributo-Chave' },
      { key: 'armor_proficiency', value: 'Leve', label: 'Proficiência de Armadura' },
      { key: 'weapon_proficiency', value: 'Simples e marciais perfurantes/cortantes', label: 'Proficiência de Arma' },
      { key: 'skills_per_level', value: '4 + mod. Inteligência', label: 'Perícias/Nível' },
      {
        key: 'level_progression',
        value: JSON.stringify({
          1: { features: ['Duelo (Desafio + bônus Dex em dano)', 'Acrobacia de Batalha'], pm_bonus: 0 },
          2: { features: ['Poder de Bucaneiro'], pm_bonus: 1 },
          3: { features: ['Fanfarronice (1x/cena: provoca inimigo)'], pm_bonus: 1 },
          5: { features: ['Graça Mortal (Dex em dano corpo a corpo)'], pm_bonus: 2 },
          10: { features: ['Mestre Duelista'], pm_bonus: 3 },
          20: { features: ['Lenda dos Mares'], pm_bonus: 6 },
        }),
        label: 'Progressão por Nível',
      },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 128 },
  },
];
