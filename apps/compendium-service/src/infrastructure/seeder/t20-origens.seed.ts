import { EntryType } from '../../domain/entry/entry.entity';
import type { CreateEntryProps } from '../../domain/entry/entry.entity';

type SeedEntry = Omit<CreateEntryProps, 'isOfficial' | 'isHomebrew' | 'createdBy' | 'isPublic'>;

export const T20_ORIGENS: SeedEntry[] = [
  {
    name: 'Acólito',
    description:
      'Você cresceu servindo a um templo ou ordem religiosa. Sua vida foi moldada pela devoção, pela reza e pelo serviço aos necessitados. Esse passado lhe concede conhecimento profundo de liturgia, história sagrada e conexões com sua fé.',
    shortDescription: 'Servo de templo com fé profunda e conhecimento litúrgico.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'acólito', 'religião', 'templo'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Sabedoria ou +2 Carisma', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Religião', 'Cura'], label: 'Perícias' },
      { key: 'power', value: 'Fé Inabalável: +2 em testes de Vontade contra magia', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 136 },
  },
  {
    name: 'Amnésico',
    description:
      'Você não se lembra de seu passado. Tudo que sabe sobre si mesmo veio de estranhos ou de fragmentos difusos. Esse mistério é ao mesmo tempo uma maldição e uma libertação — você pode se tornar quem quiser ser.',
    shortDescription: 'Personagem sem memória do passado, destino em aberto.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'amnésico', 'mistério', 'passado'],
    attributes: [
      { key: 'bonus_attributes', value: '+1 em três atributos diferentes à escolha', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Qualquer duas à escolha'], label: 'Perícias' },
      { key: 'power', value: 'Instinto Sobrevivente: +2 em iniciativa e +1d6 de dano surpresa', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 138 },
  },
  {
    name: 'Aristocrata',
    description:
      'Você nasceu ou foi criado entre a nobreza de Arton. Aprendeu etiqueta, política e a arte de manipular pessoas desde cedo. Sua posição lhe dá acesso a recursos e contatos que outros aventureiros sonhariam ter.',
    shortDescription: 'Nascido na nobreza, com acesso a recursos, contatos e etiqueta social.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'aristocrata', 'nobreza', 'político'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Carisma', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Diplomacia', 'História'], label: 'Perícias' },
      { key: 'power', value: 'Nome de Família: 1x/sessão, use seu nome para evitar conflito ou obter favor', label: 'Poder de Origem' },
      { key: 'resources', value: 'Nível de riqueza Abastado (250TO)', label: 'Recursos Iniciais' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 139 },
  },
  {
    name: 'Artesão',
    description:
      'Você aprendeu um ofício manual — ferraria, carpintaria, joalheria, costura ou outro. Seu trabalho com as mãos lhe ensinou paciência, precisão e o valor de fazer as coisas do jeito certo.',
    shortDescription: 'Mestre artesão com habilidades manuais e precisão técnica.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'artesão', 'ofício', 'criação'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Inteligência ou +2 Destreza', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Ofício (escolha)', 'Investigação'], label: 'Perícias' },
      { key: 'power', value: 'Fazer e Consertar: cria ou repara itens em metade do tempo', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 140 },
  },
  {
    name: 'Assistente de Laboratório',
    description:
      'Você passou anos em um laboratório arcano, auxiliando magos e alquimistas em experimentos perigosos. Sobreviveu a explosões, transmutações acidentais e pelo menos uma criatura escapando do frasco. Ganhou um conhecimento prático valioso.',
    shortDescription: 'Sobrevivente de laboratório arcano com conhecimento alquímico e mágico.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'laboratório', 'alquimia', 'magia', 'arcano'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Inteligência', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Arcanismo', 'Alquimia'], label: 'Perícias' },
      { key: 'power', value: 'Poção de Emergência: prepara 1 poção de cura por descanso, custo 0', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 141 },
  },
  {
    name: 'Caçador de Recompensas',
    description:
      'Você ganhou a vida rastreando fugitivos, criminosos e monstros por recompensa. Aprendeu a ler pistas, seguir rastros e capturar alvos vivos — ou trazer a cabeça deles se necessário.',
    shortDescription: 'Rastreador profissional que caça alvos por recompensa.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'caçador', 'recompensa', 'rastreamento'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Destreza ou +2 Sabedoria', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Sobrevivência', 'Investigação'], label: 'Perícias' },
      { key: 'power', value: 'Alvo Marcado: designa 1 criatura; +1d6 de dano e +2 em rastreamento contra ela', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 142 },
  },
  {
    name: 'Charlatão',
    description:
      'Você sobreviveu inventando histórias, vendendo produtos falsos e enganando pessoas. Não necessariamente mau, às vezes um bom charlatão apenas tira de quem tem para dar a quem precisa. Ou guarda para si mesmo.',
    shortDescription: 'Enganador nato com habilidade para disfarces e lábia.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'charlatão', 'engano', 'disfarce'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Carisma', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Enganação', 'Atuação'], label: 'Perícias' },
      { key: 'power', value: 'Identidade Falsa: mantém 1 identidade secreta documentada', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 143 },
  },
  {
    name: 'Circense',
    description:
      'Você cresceu viajando com um circo ou companhia de entretenimento. Aprendeu acrobacia, prestidigitação, contorcionismo ou outras habilidades de performance. A vida itinerante lhe deu perspectiva ampla sobre Arton.',
    shortDescription: 'Artista circense com acrobacia e habilidades de entretenimento.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'circense', 'acrobacia', 'performance'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Destreza ou +2 Carisma', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Acrobacia', 'Atuação'], label: 'Perícias' },
      { key: 'power', value: 'Contorcionista: passa por espaços para criaturas Pequenas sem penalidade', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 144 },
  },
  {
    name: 'Criminoso',
    description:
      'Você fez parte do submundo: ladrão, contrabandista, arrombador ou pior. Conhece a linguagem das sombras, sabe como entrar onde não devia e tem contatos em lugares que pessoas honestas preferem desconhecer.',
    shortDescription: 'Ex-criminoso com contatos no submundo e habilidades de ladrão.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'criminoso', 'submundo', 'ladrão'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Destreza', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Ladinagem', 'Furtividade'], label: 'Perícias' },
      { key: 'power', value: 'Contato Criminal: 1x/sessão, pede favor a contato do submundo', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 145 },
  },
  {
    name: 'Ermitão',
    description:
      'Você viveu isolado, longe da civilização, em contemplação, punição ou simplesmente preferência. Durante esse isolamento, descobriu verdades sobre si mesmo e sobre o mundo que poucos têm tempo de encontrar.',
    shortDescription: 'Solitário contempl ativo com sabedoria nascida do isolamento.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'ermitão', 'isolamento', 'sabedoria'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Sabedoria', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Medicina', 'Natureza'], label: 'Perícias' },
      { key: 'power', value: 'Descoberta do Isolamento: conhece 1 segredo sobre o mundo (a ser definido com o mestre)', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 146 },
  },
  {
    name: 'Escravo',
    description:
      'Você foi escravizado em algum momento da vida. A experiência moldou você de formas profundas: pode ter deixado cicatrizes, uma determinação de ferro ou uma raiva que arde como brasa. Você sabe o preço da liberdade.',
    shortDescription: 'Sobrevivente da escravidão com determinação e resiliência extraordinárias.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'escravo', 'liberdade', 'resiliência'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Constituição ou +2 Força', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Atletismo', 'Resistência'], label: 'Perícias' },
      { key: 'power', value: 'Nunca Mais: +2 em testes contra medo e encantamento; +1d6 de dano ao atacar quem o prendeu', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 147 },
  },
  {
    name: 'Estudante',
    description:
      'Você passou anos em uma academia, universidade ou sob tutela de um mestre erudito. Sua sede de conhecimento é insaciável, e suas prateleiras mentais estão repletas de teoria sobre magia, história e ciência.',
    shortDescription: 'Erudito dedicado com vasto conhecimento teórico de múltiplas áreas.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'estudante', 'erudito', 'conhecimento'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Inteligência', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['História', 'Arcanismo ou Natureza ou Religião'], label: 'Perícias' },
      { key: 'power', value: 'Pesquisa Rápida: 1x/cena, declara conhecer informação relevante (aprovação do mestre)', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 148 },
  },
  {
    name: 'Fazendeiro',
    description:
      'Você cresceu no campo, trabalhando a terra desde criança. A vida rural lhe ensinou resistência física, conhecimento de animais e plantas, e uma conexão honesta com o mundo natural que poucos citadinos conhecem.',
    shortDescription: 'Homem do campo com robustez, conhecimento rural e praticidade.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'fazendeiro', 'campo', 'natureza', 'robusto'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Constituição ou +2 Força', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Natureza', 'Atletismo'], label: 'Perícias' },
      { key: 'power', value: 'Trabalho Duro: +2 PV por nível; Conhece animais e plantas comuns de Arton', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 149 },
  },
  {
    name: 'Forasteiro',
    description:
      'Você vem de longe — de outro país, outro plano ou outro tempo. As diferenças culturais às vezes criam mal-entendidos, mas também uma perspectiva única que locais nunca poderiam ter.',
    shortDescription: 'Estrangeiro de terras distantes com perspectiva única e cultura diferente.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'forasteiro', 'estrangeiro', 'cultura'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 em qualquer atributo à escolha', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Sobrevivência', 'Idioma extra'], label: 'Perícias' },
      { key: 'power', value: 'Perspectiva Incomum: +2 em testes para perceber ambush e ilusões', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 150 },
  },
  {
    name: 'Gladiador',
    description:
      'Você lutou na arena, seja como escravo ou voluntário. Aprendeu a performar para a multidão enquanto sobrevivia a adversários mortais. Conhece a diferença entre o combate real e o teatro — e usa isso a seu favor.',
    shortDescription: 'Veterano da arena que transforma combate em espetáculo mortal.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'gladiador', 'arena', 'combate', 'espetáculo'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Força ou +2 Constituição', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Atletismo', 'Intimidação'], label: 'Perícias' },
      { key: 'power', value: 'Lutador da Arena: quando derrota inimigo visivelmente, aliados ganham +1d6 de dano por 1 rodada', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 151 },
  },
  {
    name: 'Herói Camponês',
    description:
      'Você era uma pessoa comum até que algo extraordinário aconteceu. Defendeu sua aldeia de monstros, sobreviveu a uma catástrofe ou simplesmente decidiu fazer algo. Não tem treinamento especial — apenas coragem e determinação.',
    shortDescription: 'Pessoa comum movida pela coragem para se tornar herói.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'herói', 'camponês', 'coragem', 'povo'],
    attributes: [
      { key: 'bonus_attributes', value: '+1 em dois atributos à escolha', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Sobrevivência', 'Qualquer uma à escolha'], label: 'Perícias' },
      { key: 'power', value: 'Coragem do Povo: não falha automaticamente em 1 em rolagens de medo', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 152 },
  },
  {
    name: 'Marujo',
    description:
      'Você passou anos em alto mar, navegando pelos oceanos de Arton. Aprendeu a ler estrelas, ventos e marés, e a sobreviver a tempestades que fariam homens mais frágeis mergulharem no fundo do oceano.',
    shortDescription: 'Navegador experiente dos mares de Arton com resistência e orientação.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'marujo', 'mar', 'navegação', 'sobrevivência'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Constituição ou +2 Destreza', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Navegação', 'Atletismo'], label: 'Perícias' },
      { key: 'power', value: 'Pernas do Mar: nunca é surpreendido em ambientes aquáticos; nada à velocidade de deslocamento', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 153 },
  },
  {
    name: 'Médium',
    description:
      'Você pode sentir e comunicar-se com espíritos dos mortos. Essa habilidade pode ser bênção ou maldição — os mortos raramente ficam calados quando encontram alguém que pode ouvi-los.',
    shortDescription: 'Sensível ao mundo espiritual, capaz de comunicar com os mortos.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'médium', 'espírito', 'mortos', 'sobrenatural'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Sabedoria ou +2 Carisma', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Misticismo', 'Religião'], label: 'Perícias' },
      { key: 'power', value: 'Consultar os Mortos: 1x/dia, pergunta a espírito sobre eventos passados (1 pergunta)', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 154 },
  },
  {
    name: 'Mercador',
    description:
      'Você cresceu no comércio, viajando entre cidades e negociando mercadorias. Desenvolveu olho para valor, instinto para negócios e uma rede de contatos ao longo de toda Arton.',
    shortDescription: 'Comerciante experiente com rede de contatos e instinto para negócios.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'mercador', 'comércio', 'viagem', 'contatos'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Carisma ou +2 Inteligência', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Diplomacia', 'Investigação'], label: 'Perícias' },
      { key: 'power', value: 'Tino Comercial: paga 75% do preço padrão; vende por 10% a mais', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 155 },
  },
  {
    name: 'Soldado',
    description:
      'Você serviu num exército ou milícia por anos. Aprendeu disciplina, táticas em grupo e a diferença entre um duelo e uma guerra. Sabe que sobreviver sozinho é sorte; sobreviver com companheiros é estratégia.',
    shortDescription: 'Veterano militar com disciplina, táticas de grupo e resistência.',
    type: EntryType.ORIGIN,
    system: 'tormenta20',
    tags: ['origem', 'soldado', 'militar', 'tática', 'disciplina'],
    attributes: [
      { key: 'bonus_attributes', value: '+2 Força ou +2 Constituição', label: 'Bônus de Atributos' },
      { key: 'skills', value: ['Atletismo', 'Intimidação'], label: 'Perícias' },
      { key: 'power', value: 'Formação Tática: quando flanqueia com aliado, bônus de +2 em ataque (em vez de +1)', label: 'Poder de Origem' },
    ],
    relations: [],
    source: { book: 'Tormenta20 Livro Básico', page: 156 },
  },
];
