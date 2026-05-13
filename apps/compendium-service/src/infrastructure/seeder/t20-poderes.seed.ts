import { EntryType } from '../../domain/entry/entry.entity';
import type { CreateEntryProps } from '../../domain/entry/entry.entity';

type SeedEntry = Omit<CreateEntryProps, 'isOfficial' | 'isHomebrew' | 'createdBy' | 'isPublic'>;

// ─── Poderes de Combate ───────────────────────────────────────────────────────

export const T20_PODERES_COMBATE: SeedEntry[] = [
  {
    name: 'Ataque Furtivo',
    description:
      'Quando você ataca um inimigo flanqueado ou surpreendido, causa +1d6 de dano extra. A cada quatro níveis de ladino, esse bônus aumenta em +1d6 (máximo 5d6 no nível 17).',
    shortDescription: 'Dano extra contra alvos flanqueados ou desprevenidos.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'furtividade', 'ladino', 'dano'],
    attributes: [
      { key: 'prerequisite', value: 'Ladino 1 ou Furtividade 4 graduações', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'bonus_damage', value: '+1d6 (escala com nível)', label: 'Dano Bônus' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 160 },
  },
  {
    name: 'Ataque Brutal',
    description:
      'Você pode gastar 2 PM para, no seu ataque, tratar o resultado do dado de dano como o máximo possível. Funciona apenas uma vez por ataque.',
    shortDescription: 'Gaste 2 PM para maximizar o dado de dano de um ataque.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'dano', 'guerreiro'],
    attributes: [
      { key: 'prerequisite', value: 'For 3, nível 5', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Livre (ao atacar)', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 161 },
  },
  {
    name: 'Desarmar',
    description:
      'Você pode realizar a manobra de combate Desarmar sem penalidade. Quando bem-sucedido, você pode imediatamente apanhar a arma caída como ação livre (se quiser).',
    shortDescription: 'Realiza manobra de Desarmar sem penalidade e pode apanhar a arma.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'manobra', 'desarmar'],
    attributes: [
      { key: 'prerequisite', value: 'Combate com arma de uma mão', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Padrão', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 162 },
  },
  {
    name: 'Derrubar',
    description:
      'Você pode realizar a manobra Derrubar sem penalidade. Com sucesso, o alvo fica Caído e perde 1 ação de movimento para levantar.',
    shortDescription: 'Derruba inimigos sem penalidade, deixando-os na condição Caído.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'manobra', 'derrubar'],
    attributes: [
      { key: 'prerequisite', value: 'Força 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Padrão', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 163 },
  },
  {
    name: 'Especialização em Arma',
    description:
      'Escolha uma arma. Você recebe +2 nos testes de ataque com essa arma e seu dano aumenta em um passo (d4→d6→d8→d10→d12).',
    shortDescription: 'Especializa em uma arma, melhorando ataque e dano.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'arma', 'especialização'],
    attributes: [
      { key: 'prerequisite', value: 'Guerreiro 1 ou 5 graduações com a arma escolhida', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'attack_bonus', value: '+2 com a arma escolhida', label: 'Bônus de Ataque' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 164 },
  },
  {
    name: 'Estilo Desarmado',
    description:
      'Suas mãos e pés são armas. Você causa 1d6 de dano desarmado (tamanho Médio). Se tiver o poder Luta Aprimorada, causa 1d8.',
    shortDescription: 'Combate desarmado eficiente, causa 1d6 sem armas.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'desarmado', 'lutador'],
    attributes: [
      { key: 'prerequisite', value: 'Nenhum', label: 'Pré-requisito' },
      { key: 'damage', value: '1d6 desarmado', label: 'Dano' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 165 },
  },
  {
    name: 'Fúria Bárbara',
    description:
      'Como ação livre, você entra em fúria. Enquanto furioso: +4 Força, +4 Constituição (+2 PV por nível do bárbaro), -2 Defesa. Dura até o fim do combate ou você se acalmar. Após a fúria, fica Fatigado até descansar.',
    shortDescription: 'Entra em fúria ganhando bônus de Força e Con, mas -2 Defesa.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'fúria', 'bárbaro', 'força'],
    attributes: [
      { key: 'prerequisite', value: 'Bárbaro 1', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Livre', label: 'Tipo de Ação' },
      { key: 'str_bonus', value: '+4 Força durante a fúria', label: 'Bônus Força' },
      { key: 'con_bonus', value: '+4 Constituição durante a fúria', label: 'Bônus Constituição' },
      { key: 'defense_penalty', value: '-2 Defesa durante a fúria', label: 'Penalidade Defesa' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 166 },
  },
  {
    name: 'Golpe de Misericórdia',
    description:
      'Quando ataca um inimigo Inconsciente ou Indefeso, pode gastar 2 PM para causar dano máximo. O inimigo deve fazer teste de Constituição (CD igual ao dano causado) ou morrer.',
    shortDescription: 'Finaliza inimigos caídos causando dano máximo e forçando teste de morte.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'finalização', 'assassinato'],
    attributes: [
      { key: 'prerequisite', value: 'Ladino 5 ou Guerreiro 7', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Padrão', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 167 },
  },
  {
    name: 'Imposição de Mãos',
    description:
      'Como ação padrão, toque uma criatura e cura PV iguais a 1d8 + seu modificador de Carisma. Custa PM igual ao nível da cura ÷ 4. Você pode usar em si mesmo. Usos ilimitados, limitados apenas por PM disponível.',
    shortDescription: 'Cura tocando aliados. 1d8 + Carisma, custo em PM.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'cura', 'paladino', 'divino', 'toque'],
    attributes: [
      { key: 'prerequisite', value: 'Paladino 1', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Padrão', label: 'Tipo de Ação' },
      { key: 'healing', value: '1d8 + modificador de Carisma', label: 'Cura' },
      { key: 'pm_cost', value: '2 PM por 1d8 de cura', label: 'Custo PM' },
      { key: 'range', value: 'Toque', label: 'Alcance' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 168 },
  },
  {
    name: 'Ira Divina',
    description:
      'Você pode canalizar energia divina em seus ataques. Gaste 2 PM para causar +1d6 de dano radiante (ou profano para clérigos malignos) no próximo ataque. Esse dano aumenta em +1d6 a cada 5 níveis.',
    shortDescription: 'Canaliza energia divina para dano extra sagrado/profano.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'divino', 'clérigo', 'paladino', 'dano'],
    attributes: [
      { key: 'prerequisite', value: 'Clérigo ou Paladino 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Livre (ao atacar)', label: 'Tipo de Ação' },
      { key: 'bonus_damage', value: '+1d6 de dano sagrado/profano', label: 'Dano Bônus' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 169 },
  },
  {
    name: 'Reflexos de Combate',
    description:
      'Você pode fazer um ataque de oportunidade adicional por rodada. Normalmente, você só pode fazer um ataque de oportunidade por rodada.',
    shortDescription: 'Um ataque de oportunidade extra por rodada.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'reação', 'oportunidade'],
    attributes: [
      { key: 'prerequisite', value: 'Destreza 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 170 },
  },
  {
    name: 'Trespassar',
    description:
      'Quando seu ataque reduz um inimigo a 0 PV, você pode fazer um ataque adicional imediatamente contra outro inimigo adjacente. Isso pode se encadear.',
    shortDescription: 'Ao matar inimigo, faz ataque bônus contra adjacente.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'corrente', 'matador'],
    attributes: [
      { key: 'prerequisite', value: 'Guerreiro 7 ou Bárbaro 5', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Livre (ao matar inimigo)', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 171 },
  },
  {
    name: 'Escudo de Proteção',
    description:
      'Quando um aliado adjacente seria atingido por um ataque, você pode gastar 2 PM para interpor seu escudo, desviando o ataque. Role Defesa contra a jogada de ataque do inimigo.',
    shortDescription: 'Protege aliado adjacente com escudo contra um ataque.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'escudo', 'proteção', 'aliado'],
    attributes: [
      { key: 'prerequisite', value: 'Escudo, Guerreiro 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Reação', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 172 },
  },
  {
    name: 'Aura de Coragem',
    description:
      'Aliados a até 10 quadrados de você recebem imunidade a efeitos de medo não mágicos e +2 em testes de resistência contra medo mágico.',
    shortDescription: 'Irradia coragem para aliados próximos contra efeitos de medo.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'aura', 'paladino', 'coragem', 'medo'],
    attributes: [
      { key: 'prerequisite', value: 'Paladino 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Passivo (aura sempre ativa)', label: 'Tipo de Ação' },
      { key: 'range', value: '10 quadrados (15m)', label: 'Alcance' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 173 },
  },
  {
    name: 'Fintar',
    description:
      'Como ação de movimento, você engana um inimigo com uma finção. Faça teste de Enganação vs Intuição do inimigo. Se vencer, ele fica Flanqueado por você até o fim de seu próximo turno.',
    shortDescription: 'Usa Enganação para deixar inimigo flanqueado temporariamente.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'combate', 'enganação', 'flanquear', 'ladino'],
    attributes: [
      { key: 'prerequisite', value: 'Enganação 4 graduações', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Movimento', label: 'Tipo de Ação' },
      { key: 'check', value: 'Enganação vs Intuição', label: 'Teste' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 174 },
  },

  // ─── Poderes de Destino ──────────────────────────────────────────────────────

  {
    name: 'Sortudo',
    description:
      'Uma vez por rodada, quando fizer qualquer teste, você pode escolher rolar novamente e usar o melhor resultado.',
    shortDescription: 'Rola novamente qualquer teste uma vez por rodada.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'sorte', 're-rolar'],
    attributes: [
      { key: 'power_type', value: 'Destino', label: 'Tipo de Poder' },
      { key: 'action_type', value: 'Livre (1x/rodada)', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: 1, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 185 },
  },
  {
    name: 'Presença Ameaçadora',
    description:
      'Uma vez por cena, você pode amedrontar todos os inimigos a até 6 quadrados. Inimigos devem fazer teste de Vontade (CD 10 + seu nível + mod. Carisma) ou ficam Abalados por 1d4 rodadas.',
    shortDescription: 'Amedronta todos os inimigos próximos com a presença.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'intimidação', 'medo', 'aura'],
    attributes: [
      { key: 'power_type', value: 'Destino', label: 'Tipo de Poder' },
      { key: 'prerequisite', value: 'Intimidação 4 graduações, Carisma 3', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Padrão (1x/cena)', label: 'Tipo de Ação' },
      { key: 'save', value: 'Vontade CD 10 + nível + mod. Carisma', label: 'Resistência' },
      { key: 'duration', value: '1d4 rodadas', label: 'Duração' },
      { key: 'pm_cost', value: 3, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 186 },
  },
  {
    name: 'Toque Vampírico',
    description:
      'Ao acertar um ataque corpo a corpo, gaste 2 PM para drenar PV do alvo. Você cura PV igual à metade do dano causado (arredondado para baixo).',
    shortDescription: 'Drena PV do inimigo ao acertar ataques corpo a corpo.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'vampirismo', 'cura', 'drenagem'],
    attributes: [
      { key: 'power_type', value: 'Destino', label: 'Tipo de Poder' },
      { key: 'prerequisite', value: 'Nível 5', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Livre (ao acertar ataque)', label: 'Tipo de Ação' },
      { key: 'healing', value: 'Metade do dano causado', label: 'Cura' },
      { key: 'pm_cost', value: 2, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 187 },
  },
  {
    name: 'Esquiva',
    description:
      'Você ganha +2 em Defesa contra ataques de um inimigo por rodada (você escolhe qual no início do seu turno). Se estiver usando armadura leve ou nenhuma, o bônus é +3.',
    shortDescription: '+2 em Defesa contra ataques de um inimigo por rodada.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'esquiva', 'defesa', 'agilidade'],
    attributes: [
      { key: 'power_type', value: 'Destino', label: 'Tipo de Poder' },
      { key: 'prerequisite', value: 'Destreza 3', label: 'Pré-requisito' },
      { key: 'defense_bonus', value: '+2 Defesa (ou +3 sem armadura pesada)', label: 'Bônus de Defesa' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 188 },
  },
  {
    name: 'Fortitude Incrível',
    description:
      'Você ganha +2 em testes de Fortitude. Quando seria reduzido a 0 PV, pode gastar 4 PM para ficar com 1 PV em vez disso. Pode ser usado uma vez por cena.',
    shortDescription: '+2 Fortitude e pode gastar PM para sobreviver com 1 PV.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'fortitude', 'sobrevivência'],
    attributes: [
      { key: 'power_type', value: 'Destino', label: 'Tipo de Poder' },
      { key: 'prerequisite', value: 'Constituição 3', label: 'Pré-requisito' },
      { key: 'fortitude_bonus', value: '+2 Fortitude', label: 'Bônus de Fortitude' },
      { key: 'pm_cost', value: '4 PM (para sobreviver com 1 PV)', label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 189 },
  },
  {
    name: 'Vitalidade',
    description:
      'Você ganha +2 PV por nível retroativamente. Se tiver pelo menos 5 níveis em uma classe com d10 de PV, ganha +3 PV por nível em vez disso.',
    shortDescription: '+2 PV por nível de personagem (retroativo).',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'PV', 'vitalidade'],
    attributes: [
      { key: 'power_type', value: 'Destino', label: 'Tipo de Poder' },
      { key: 'pv_bonus', value: '+2 PV por nível', label: 'Bônus PV' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 190 },
  },
  {
    name: 'Magia Acelerada',
    description:
      'Gaste 2 PM adicionais para lançar uma magia como ação de movimento em vez de padrão. Magias de tempo de conjuração de 1 rodada ou mais não são afetadas.',
    shortDescription: 'Lança uma magia com ação de movimento gastando 2 PM extras.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'magia', 'acelerado', 'conjuração'],
    attributes: [
      { key: 'power_type', value: 'Destino', label: 'Tipo de Poder' },
      { key: 'prerequisite', value: 'Capacidade de lançar magias', label: 'Pré-requisito' },
      { key: 'action_type', value: 'Modificador de conjuração', label: 'Tipo de Ação' },
      { key: 'pm_cost', value: '+2 PM adicionais', label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 191 },
  },
  {
    name: 'Metamagia Ampliada',
    description:
      'Gaste 1 PM adicional para dobrar o alcance de uma magia (alcance pessoal não é afetado, alcance toque torna-se 1,5m).',
    shortDescription: 'Dobra o alcance de uma magia gastando 1 PM extra.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'magia', 'metamagia', 'alcance'],
    attributes: [
      { key: 'power_type', value: 'Destino', label: 'Tipo de Poder' },
      { key: 'prerequisite', value: 'Capacidade de lançar magias, nível 5', label: 'Pré-requisito' },
      { key: 'pm_cost', value: '+1 PM adicional', label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 192 },
  },
  {
    name: 'Sentido Apurado',
    description:
      'Você tem percepção aguçada. Recebe +2 em testes de Percepção. Não é surpreendido quando apenas um inimigo tenta surpreendê-lo.',
    shortDescription: '+2 Percepção e imunidade a surpresa por um inimigo.',
    type: EntryType.POWER,
    system: 'tormenta20',
    tags: ['poder', 'destino', 'percepção', 'alerta'],
    attributes: [
      { key: 'power_type', value: 'Destino', label: 'Tipo de Poder' },
      { key: 'perception_bonus', value: '+2 Percepção', label: 'Bônus de Percepção' },
      { key: 'pm_cost', value: 0, label: 'Custo PM' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 193 },
  },
];
