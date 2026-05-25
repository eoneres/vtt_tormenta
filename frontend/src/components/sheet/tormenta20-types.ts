// ─── Tormenta20 Sheet Data Shape ─────────────────────────────────────────────
// Stored in Character.sheetData (jsonb). Version tagged for future migrations.

export interface T20Sheet {
  _v: 1;
  _system: 'tormenta20';

  // ── Identidade ──────────────────────────────────────────────────────────────
  raca: string;
  subRaca?: string;
  classe: string;
  subClasse?: string;
  origem: string;
  divindade?: string;
  nivel: number;
  experiencia: number;
  tamanho: T20Tamanho;
  deslocamento: number; // metros
  alinhamento: string;

  // ── Atributos (valores brutos, 8–20+ com bônus raciais) ─────────────────────
  atributos: {
    for: number;
    des: number;
    con: number;
    int: number;
    sab: number;
    car: number;
  };

  // ── Combate ─────────────────────────────────────────────────────────────────
  pvMax: number;
  pvAtual: number;
  pvTemporario: number;
  defesa: number;          // calculada: 10 + mod Des + armadura + outros
  defesaOverride?: number; // se quiser sobrescrever
  reducaoDano: number;

  // Testes de Resistência (bônus total já calculado OU calculado a partir dos atributos)
  resistencias: {
    fortitude: T20Resistencia;
    reflexos: T20Resistencia;
    vontade: T20Resistencia;
  };

  // Dados de vida
  dadoDeVida: string; // ex: "d8"
  dadosRestantes: number;

  // ── Pontos de Mana ─────────────────────────────────────────────────────────
  pmMax: number;
  pmAtual: number;

  // ── Perícias ───────────────────────────────────────────────────────────────
  // graduacao: 0 | 2 | 4 | 6 | 8 | 10 (treinado=2, vet=6, épico=10 etc.)
  pericias: Record<T20Pericia, T20PericiaDado>;

  // ── Ataques ────────────────────────────────────────────────────────────────
  ataques: T20Ataque[];

  // ── Magias ─────────────────────────────────────────────────────────────────
  circulosConhecidos: number;   // círculo máximo que pode conjurar
  magias: T20Magia[];

  // ── Poderes ────────────────────────────────────────────────────────────────
  poderes: T20Poder[];

  // ── Equipamento ────────────────────────────────────────────────────────────
  tinacoins: { tp: number; to: number; tprata: number; tpouro: number; tl: number };
  equipamentos: T20Item[];

  // ── Características físicas ─────────────────────────────────────────────────
  idade: string;
  altura: string;
  peso: string;
  olhos: string;
  cabelo: string;
  pele: string;

  // ── Texto livre ────────────────────────────────────────────────────────────
  historico: string;
  personalidade: string;
  aparencia: string;
  anotacoes: string;
}

// ─── Enums e sub-tipos ────────────────────────────────────────────────────────

export type T20Tamanho = 'Minúsculo' | 'Pequeno' | 'Médio' | 'Grande' | 'Enorme' | 'Colossal';

export type T20Atributo = keyof T20Sheet['atributos'];

export interface T20Resistencia {
  atributoBase: T20Atributo; // For→Fort, Des→Ref, Sab→Von (padrão, editável)
  bonus: number;              // bônus de classe + outros fixos
  override?: number;          // sobrescreve tudo se preenchido
}

export type T20GraduacaoLabel = 'Destreinado' | 'Treinado' | 'Veterano' | 'Épico';
export type T20GraduacaoValor = 0 | 2 | 4 | 6 | 8 | 10;

export interface T20PericiaDado {
  graduacao: T20GraduacaoValor;
  atributo: T20Atributo;      // atributo governante (pode ser trocado para perícias com 2 atributos)
  bonus: number;              // outros bônus fixos
  penalidade: number;         // penalidade de armadura, etc.
  somenteTreinado: boolean;
}

export type T20Pericia =
  | 'acrobacia' | 'adestramento' | 'atletismo' | 'atuacao'
  | 'cavalgar' | 'conhecimento' | 'cura' | 'diplomacia'
  | 'enganacao' | 'fortitude' | 'furtividade' | 'guerra'
  | 'iniciativa' | 'intimidacao' | 'intuicao' | 'investigacao'
  | 'jogatina' | 'ladinagem' | 'luta' | 'magia'
  | 'misticismo' | 'nobreza' | 'ocultismo' | 'percepcao'
  | 'pilotagem' | 'pontaria' | 'reflexos' | 'religiao'
  | 'sobrevivencia' | 'vontade';

export interface T20Ataque {
  id: string;
  nome: string;
  tipo: 'corpo-a-corpo' | 'distancia' | 'magia';
  bonus: string;    // ex: "+7"
  dano: string;     // ex: "1d8+4"
  tipoDano: string; // ex: "cortante"
  critico: string;  // ex: "20/×2"
  alcance: string;  // ex: "1,5m" ou "9m/18m"
  notas?: string;
}

export interface T20Magia {
  id: string;
  nome: string;
  circulo: number;       // 1–5 (arcano) ou 1–4 (divino)
  escola: string;
  execucao: string;      // "padrão", "completa", "livre"
  alcance: string;
  alvo: string;
  duracao: string;
  resistencia: string;   // "Fort anula", "Ref reduz à metade", "—"
  custopm: number;
  descricao?: string;
  preparada: boolean;
}

export interface T20Poder {
  id: string;
  nome: string;
  tipo: 'combate' | 'magia' | 'destino' | 'tormenta' | 'origem' | 'classe' | 'outro';
  prerequisito?: string;
  descricao: string;
}

export interface T20Item {
  id: string;
  nome: string;
  quantidade: number;
  peso?: number;  // kg
  bonus?: string; // ex: "+2 Defesa"
  notas?: string;
}

// ─── Dados de referência ─────────────────────────────────────────────────────

export const T20_ATRIBUTOS: { key: T20Atributo; label: string; abrev: string }[] = [
  { key: 'for', label: 'Força',        abrev: 'FOR' },
  { key: 'des', label: 'Destreza',     abrev: 'DES' },
  { key: 'con', label: 'Constituição', abrev: 'CON' },
  { key: 'int', label: 'Inteligência', abrev: 'INT' },
  { key: 'sab', label: 'Sabedoria',    abrev: 'SAB' },
  { key: 'car', label: 'Carisma',      abrev: 'CAR' },
];

export const T20_PERICIAS_META: Record<T20Pericia, {
  label: string;
  atributo: T20Atributo;
  somenteTreinado: boolean;
}> = {
  acrobacia:    { label: 'Acrobacia',     atributo: 'des', somenteTreinado: false },
  adestramento: { label: 'Adestramento',  atributo: 'car', somenteTreinado: true  },
  atletismo:    { label: 'Atletismo',     atributo: 'for', somenteTreinado: false },
  atuacao:      { label: 'Atuação',       atributo: 'car', somenteTreinado: false },
  cavalgar:     { label: 'Cavalgar',      atributo: 'des', somenteTreinado: false },
  conhecimento: { label: 'Conhecimento',  atributo: 'int', somenteTreinado: true  },
  cura:         { label: 'Cura',          atributo: 'sab', somenteTreinado: false },
  diplomacia:   { label: 'Diplomacia',    atributo: 'car', somenteTreinado: false },
  enganacao:    { label: 'Enganação',     atributo: 'car', somenteTreinado: false },
  fortitude:    { label: 'Fortitude',     atributo: 'con', somenteTreinado: false },
  furtividade:  { label: 'Furtividade',   atributo: 'des', somenteTreinado: false },
  guerra:       { label: 'Guerra',        atributo: 'int', somenteTreinado: true  },
  iniciativa:   { label: 'Iniciativa',    atributo: 'des', somenteTreinado: false },
  intimidacao:  { label: 'Intimidação',   atributo: 'car', somenteTreinado: false },
  intuicao:     { label: 'Intuição',      atributo: 'sab', somenteTreinado: false },
  investigacao: { label: 'Investigação',  atributo: 'int', somenteTreinado: false },
  jogatina:     { label: 'Jogatina',      atributo: 'car', somenteTreinado: true  },
  ladinagem:    { label: 'Ladinagem',     atributo: 'des', somenteTreinado: true  },
  luta:         { label: 'Luta',          atributo: 'for', somenteTreinado: false },
  magia:        { label: 'Magia',         atributo: 'int', somenteTreinado: true  },
  misticismo:   { label: 'Misticismo',    atributo: 'int', somenteTreinado: true  },
  nobreza:      { label: 'Nobreza',       atributo: 'int', somenteTreinado: true  },
  ocultismo:    { label: 'Ocultismo',     atributo: 'int', somenteTreinado: true  },
  percepcao:    { label: 'Percepção',     atributo: 'sab', somenteTreinado: false },
  pilotagem:    { label: 'Pilotagem',     atributo: 'des', somenteTreinado: true  },
  pontaria:     { label: 'Pontaria',      atributo: 'des', somenteTreinado: false },
  reflexos:     { label: 'Reflexos',      atributo: 'des', somenteTreinado: false },
  religiao:     { label: 'Religião',      atributo: 'sab', somenteTreinado: true  },
  sobrevivencia:{ label: 'Sobrevivência', atributo: 'sab', somenteTreinado: false },
  vontade:      { label: 'Vontade',       atributo: 'sab', somenteTreinado: false },
};

export const T20_CLASSES = [
  'Arcanista', 'Bárbaro', 'Bardo', 'Bucaneiro', 'Caçador',
  'Cavaleiro', 'Clérigo', 'Druida', 'Duelist a', 'Feiticeiro',
  'Guerreiro', 'Inventor', 'Ladino', 'Lutador', 'Nobre',
  'Paladino', 'Patrulheiro', 'Samurai',
];

export const T20_RACAS = [
  'Humano', 'Anão', 'Elfo', 'Goblin', 'Halfling', 'Lefou',
  'Minotauro', 'Qareen', 'Sereia/Tritão', 'Sílfide', 'Suraggel', 'Têmis',
];

export const T20_ORIGENS = [
  'Acólito', 'Amnésico', 'Amante', 'Artesão', 'Artista',
  'Assistente de Laboratório', 'Charlatão', 'Circense', 'Criminoso',
  'Curandeiro', 'Eremita', 'Escravo', 'Estudioso', 'Farmer',
  'Forasteiro', 'Gladiador', 'Herói Camponês', 'Marujo',
  'Mercenário', 'Nobre', 'Órfão', 'Refugiado', 'Revolucionário',
  'Selvagem', 'Soldado', 'Taverneiro', 'Vítima',
];

export const T20_GRADUACAO_LABELS: Record<T20GraduacaoValor, T20GraduacaoLabel> = {
  0: 'Destreinado',
  2: 'Treinado',
  4: 'Veterano',
  6: 'Veterano',
  8: 'Épico',
  10: 'Épico',
};

// ─── Fórmulas T20 ─────────────────────────────────────────────────────────────

/**
 * Modificador de atributo T20: floor(valor / 3) - 2
 * Valor 8 → −1  |  10 → +1  |  12 → +2  |  18 → +4  |  20 → +5
 */
export function modAtributo(valor: number): number {
  return Math.floor(valor / 3) - 2;
}

export function fmtMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Bônus de perícia total:
 *   mod(atributo) + graduação + bônus extras − penalidade
 * Se somenteTreinado e graduação === 0, retorna null (não pode usar).
 */
export function bonusPericia(sheet: T20Sheet, pericia: T20Pericia): number | null {
  const dado = sheet.pericias[pericia];
  const meta = T20_PERICIAS_META[pericia];
  if (meta.somenteTreinado && dado.graduacao === 0) return null;
  const mod = modAtributo(sheet.atributos[dado.atributo]);
  return mod + dado.graduacao + dado.bonus - dado.penalidade;
}

/**
 * Teste de Resistência:
 *   mod(atributo base) + bônus de classe + outros
 * Se override definido, retorna direto.
 */
export function bonusResistencia(sheet: T20Sheet, res: keyof T20Sheet['resistencias']): number {
  const r = sheet.resistencias[res];
  if (r.override !== undefined) return r.override;
  return modAtributo(sheet.atributos[r.atributoBase]) + r.bonus;
}

/** PM máximo padrão por nível (sem feats/itens): base do arcano é nível × modificador de atributo conjurador */
export function pvPorNivel(dadoVida: string, nivel: number, modCon: number): number {
  const faces = parseInt(dadoVida.replace('d', '')) || 8;
  // Nível 1: máximo. Níveis 2+: média +1 (arredondado para cima)
  const base = faces + (nivel - 1) * (Math.ceil(faces / 2) + 1);
  return base + modCon * nivel;
}

// ─── Ficha em branco padrão ───────────────────────────────────────────────────

function pericias_default(): Record<T20Pericia, T20PericiaDado> {
  return Object.fromEntries(
    Object.entries(T20_PERICIAS_META).map(([key, meta]) => [
      key,
      {
        graduacao: 0 as T20GraduacaoValor,
        atributo: meta.atributo,
        bonus: 0,
        penalidade: 0,
        somenteTreinado: meta.somenteTreinado,
      },
    ]),
  ) as Record<T20Pericia, T20PericiaDado>;
}

export function defaultT20Sheet(overrides: Partial<T20Sheet> = {}): T20Sheet {
  return {
    _v: 1,
    _system: 'tormenta20',
    raca: '',
    classe: '',
    origem: '',
    divindade: '',
    nivel: 1,
    experiencia: 0,
    tamanho: 'Médio',
    deslocamento: 9,
    alinhamento: '',
    atributos: { for: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 },
    pvMax: 8,
    pvAtual: 8,
    pvTemporario: 0,
    defesa: 10,
    reducaoDano: 0,
    resistencias: {
      fortitude: { atributoBase: 'con', bonus: 0 },
      reflexos:  { atributoBase: 'des', bonus: 0 },
      vontade:   { atributoBase: 'sab', bonus: 0 },
    },
    dadoDeVida: 'd8',
    dadosRestantes: 1,
    pmMax: 0,
    pmAtual: 0,
    pericias: pericias_default(),
    ataques: [],
    circulosConhecidos: 0,
    magias: [],
    poderes: [],
    tinacoins: { tp: 0, to: 0, tprata: 0, tpouro: 0, tl: 0 },
    equipamentos: [],
    idade: '',
    altura: '',
    peso: '',
    olhos: '',
    cabelo: '',
    pele: '',
    historico: '',
    personalidade: '',
    aparencia: '',
    anotacoes: '',
    ...overrides,
  };
}
