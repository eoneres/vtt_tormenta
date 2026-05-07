const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, LevelFormat, TableOfContents,
  PageBreak, UnderlineType
} = require('docx');
const fs = require('fs');

// ---- Color palette ----
const C = {
  primary:    "1B3A5C",  // dark blue
  secondary:  "2E6DA4",  // medium blue
  accent:     "C0392B",  // red accent
  light:      "D6E4F0",  // light blue bg
  lightGray:  "F2F2F2",  // table alt row
  midGray:    "DDDDDD",  // border
  darkGray:   "555555",  // body text
  white:      "FFFFFF",
  heading1:   "1B3A5C",
  heading2:   "2E6DA4",
  heading3:   "1A5276",
};

// ---- Border helpers ----
const thinBorder  = { style: BorderStyle.SINGLE, size: 1, color: C.midGray };
const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

// ---- Reusable paragraph helpers ----
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 36, color: C.heading1, font: "Arial" })],
    spacing: { before: 480, after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.secondary, space: 1 } },
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 28, color: C.heading2, font: "Arial" })],
    spacing: { before: 360, after: 180 },
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: 24, color: C.heading3, font: "Arial" })],
    spacing: { before: 240, after: 120 },
  });
}
function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: C.darkGray, font: "Arial", ...opts })],
    spacing: { after: 120 },
    alignment: AlignmentType.JUSTIFIED,
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    children: [new TextRun({ text, size: 22, color: C.darkGray, font: "Arial" })],
    spacing: { after: 60 },
  });
}
function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    children: [new TextRun({ text, size: 22, color: C.darkGray, font: "Arial" })],
    spacing: { after: 60 },
  });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}
function spacer(after = 200) {
  return new Paragraph({ children: [new TextRun("")], spacing: { after } });
}

// ---- Table helpers ----
function headerCell(text, width, color = C.primary) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: color, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 20, color: C.white, font: "Arial" })],
    })],
  });
}
function dataCell(text, width, shade = C.white, bold = false) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: shade, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, color: C.darkGray, font: "Arial", bold })],
    })],
  });
}
function simpleTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ children: headers.map((h, i) => headerCell(h, colWidths[i])) }),
      ...rows.map((row, ri) =>
        new TableRow({ children: row.map((cell, i) => dataCell(cell, colWidths[i], ri % 2 === 0 ? C.white : C.lightGray)) })
      ),
    ],
  });
}

// ---- INFO BOX (shaded paragraph block) ----
function infoBox(label, lines) {
  return [
    new Paragraph({
      children: [new TextRun({ text: label, bold: true, size: 22, color: C.white, font: "Arial" })],
      shading: { fill: C.secondary, type: ShadingType.CLEAR },
      spacing: { before: 180, after: 0 },
      indent: { left: 180, right: 180 },
    }),
    ...lines.map(line =>
      new Paragraph({
        children: [new TextRun({ text: line, size: 20, color: C.darkGray, font: "Arial" })],
        shading: { fill: C.light, type: ShadingType.CLEAR },
        spacing: { after: 0 },
        indent: { left: 180, right: 180 },
      })
    ),
    spacer(120),
  ];
}

// ---- CODE BLOCK ----
function codeBlock(lines) {
  return [
    ...lines.map(line =>
      new Paragraph({
        children: [new TextRun({ text: line, size: 18, font: "Courier New", color: "1A1A1A" })],
        shading: { fill: "F4F4F4", type: ShadingType.CLEAR },
        spacing: { after: 0 },
        indent: { left: 360, right: 360 },
      })
    ),
    spacer(120),
  ];
}

// ============================================================
// DOCUMENT CONTENT
// ============================================================
const children = [];

// ---- COVER PAGE ----
children.push(
  new Paragraph({
    children: [new TextRun("")],
    shading: { fill: C.primary, type: ShadingType.CLEAR },
    spacing: { before: 1440, after: 0 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "PLATAFORMA VTT MULTISSISTEMA", bold: true, size: 52, color: C.white, font: "Arial" })],
    shading: { fill: C.primary, type: ShadingType.CLEAR },
    spacing: { before: 240, after: 120 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Documento de Modelagem de Sistema", size: 32, color: "A8C8E8", font: "Arial" })],
    shading: { fill: C.primary, type: ShadingType.CLEAR },
    spacing: { before: 0, after: 120 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Arquitetura · Desenvolvimento · LGPD", size: 26, color: "7FB3D3", font: "Arial", italics: true })],
    shading: { fill: C.primary, type: ShadingType.CLEAR },
    spacing: { before: 0, after: 0 },
  }),
  new Paragraph({
    children: [new TextRun("")],
    shading: { fill: C.primary, type: ShadingType.CLEAR },
    spacing: { before: 0, after: 480 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Versão 1.0  |  Maio 2025", size: 22, color: "7FB3D3", font: "Arial" })],
    shading: { fill: C.primary, type: ShadingType.CLEAR },
    spacing: { before: 480, after: 1440 },
  }),
  pageBreak(),
);

// ---- TOC placeholder ----
children.push(
  h1("Sumário"),
  new TableOfContents("Sumário", { hyperlink: true, headingStyleRange: "1-3" }),
  pageBreak(),
);

// ============================
// 1. VISÃO GERAL
// ============================
children.push(
  h1("1. Visão Geral do Produto"),
  para("A plataforma VTT (Virtual Tabletop) Multissistema é um SaaS cloud-native de RPG online, concebido para unir a experiência visual-tática de plataformas como Roll20 à profundidade de gerenciamento do D&D Beyond, com foco inicial nos sistemas Tormenta 20, D&D 5ª Edição e Shadowrun, e arquitetura preparada para expansão irrestrita a qualquer sistema de RPG."),
  para("A proposta estratégica central é se posicionar como a primeira plataforma VTT verdadeiramente multissistema da América Latina, com suporte nativo e aprofundado a Tormenta 20, atendendo uma demanda claramente reprimida no mercado brasileiro."),

  h2("1.1 Objetivos Estratégicos"),
  bullet("Criar a experiência de mesa virtual mais completa para o RPG nacional (Tormenta20)."),
  bullet("Arquitetura System Agnostic com módulos de regras plugáveis via DSL/JSON."),
  bullet("Separação clara entre engine genérica e módulos de regras, evitando acoplamento."),
  bullet("Ecossistema de criadores: publicação de módulos, aventuras, mapas, tokens, sistemas."),
  bullet("Compliance total com LGPD e GDPR-ready."),
  bullet("Monetização freemium + marketplace com revenue share."),
  spacer(),

  h2("1.2 Escopo Inicial — MVP"),
  simpleTable(
    ["Funcionalidade", "Descrição", "Prioridade"],
    [
      ["Autenticação", "Login social, JWT, MFA", "Alta"],
      ["Campanhas", "Criação, gerenciamento de mesa e personagens", "Alta"],
      ["Mesa Virtual", "Mapas grid, tokens, fog of war", "Alta"],
      ["Chat & Rolagens", "Texto, macros, rolagens com histórico auditável", "Alta"],
      ["Fichas Dinâmicas", "Ficha de Tormenta20 e D&D 5e com cálculos automáticos", "Alta"],
      ["Compêndio Básico", "Raças, classes, magias, monstros de T20", "Média"],
      ["Iluminação Dinâmica", "Raycasting, LOS, sombras", "Média"],
      ["Marketplace", "Venda de módulos, mapas, aventuras", "Baixa/Fase 2"],
    ],
    [2800, 4000, 2200]
  ),
  spacer(),
  pageBreak(),
);

// ============================
// 2. ARQUITETURA MACRO
// ============================
children.push(
  h1("2. Arquitetura Macro do Sistema"),
  para("O sistema adota o padrão Microserviços + Event-Driven Architecture combinado com sistemas de tempo real via WebSockets. Cada domínio de negócio é encapsulado em um serviço independente, comunicando-se por eventos assíncronos (Message Broker) ou chamadas síncronas via API Gateway."),

  h2("2.1 Visão de Camadas"),
  simpleTable(
    ["Camada", "Responsabilidade", "Tecnologias"],
    [
      ["Frontend", "SPA com canvas de mesa virtual, fichas e compêndio", "Next.js, TypeScript, PixiJS, Zustand"],
      ["API Gateway", "Roteamento, rate limiting, autenticação, quotas", "Kong / AWS API GW / custom NestJS"],
      ["Microserviços", "Domínios de negócio isolados", "NestJS (Node.js) / Go para serviços críticos de RT"],
      ["Message Broker", "Comunicação assíncrona entre serviços", "RabbitMQ / Apache Kafka"],
      ["Real-Time Server", "WebSocket gateway para estado de mesa", "Colyseus / Socket.IO / custom"],
      ["Bancos de Dados", "Persistência polilíngue por domínio", "PostgreSQL, MongoDB, Redis"],
      ["Object Storage", "Mapas, tokens, imagens, áudios", "S3 / Cloudflare R2 / MinIO"],
      ["CDN", "Entrega de assets estáticos globalmente", "Cloudflare / CloudFront"],
      ["Infra", "Orquestração e escalabilidade", "Kubernetes, Docker, Helm"],
    ],
    [1800, 3600, 3600]
  ),
  spacer(),

  h2("2.2 Padrões Arquiteturais Adotados"),
  bullet("Domain-Driven Design (DDD): Cada microserviço representa um Bounded Context."),
  bullet("CQRS (Command Query Responsibility Segregation): Separação de reads e writes em serviços de alta carga (mesa virtual, compêndio)."),
  bullet("Event Sourcing parcial: Log auditável de eventos de combate, movimentação e rolagens."),
  bullet("API-First: Todas as funcionalidades expostas via API RESTful documentada + WebSocket contracts."),
  bullet("Authoritative Server: O servidor é fonte de verdade para todo estado de jogo — nunca o cliente."),
  spacer(),

  h2("2.3 Diagrama de Contexto — Bounded Contexts"),
  ...infoBox("Bounded Contexts Principais", [
    "  [Identity & Auth]  →  Gestão de usuários, sessões, OAuth, MFA",
    "  [Campaign]         →  Campanhas, mesas, personagens, NPCs",
    "  [Rules Engine]     →  DSL, dados, automações, fórmulas",
    "  [VTT Engine]       →  Mesa visual, tokens, mapas, lighting",
    "  [Realtime Gateway] →  WebSocket, presença, sincronização",
    "  [Compendium]       →  Entidades de regras (raças, classes, magias...)",
    "  [Marketplace]      →  Publicação, venda, DRM, revenue share",
    "  [Homebrew]         →  Criação e publicação de conteúdo",
    "  [Notification]     →  Push, e-mail, in-app",
    "  [Billing]          →  Planos, assinaturas, pagamentos",
    "  [Audit & Compliance] →  Logs, LGPD, exportação de dados",
  ]),
  pageBreak(),
);

// ============================
// 3. MICROSERVIÇOS — DETALHAMENTO
// ============================
children.push(
  h1("3. Detalhamento dos Microserviços"),

  h2("3.1 Identity & Auth Service"),
  para("Responsável por todo ciclo de vida de identidade: cadastro, login, sessão, recuperação de senha, controle de dispositivos e gestão de permissões."),
  simpleTable(
    ["Recurso", "Detalhe"],
    [
      ["Autenticação", "Login por e-mail/senha + OAuth2 (Google, Discord, Twitch)"],
      ["MFA", "TOTP (Google Authenticator), SMS backup"],
      ["Tokens", "JWT Access Token (15 min) + Refresh Token rotacionado (30 dias)"],
      ["Sessões", "Controle multi-dispositivo, revogação remota"],
      ["RBAC", "Roles: ADMIN, GM, PLAYER, SPECTATOR, CREATOR"],
      ["Auditoria", "Log de todos os eventos de autenticação com IP anonimizado"],
    ],
    [2800, 6200]
  ),
  spacer(),

  h2("3.2 Campaign Service"),
  para("Gerencia campanhas, mesas, convites, personagens e relacionamentos entre entidades do jogo."),
  bullet("Entidades: Campaign, Table, Character, NPC, PlayerInvite, SessionLog."),
  bullet("Uma campanha pode ter múltiplas mesas (one-shot vs. campanha longa)."),
  bullet("Personagens pertencem a jogadores e podem ser reutilizados em múltiplas campanhas."),
  bullet("NPCs são entidades controladas pelo GM, podendo ser compartilhados no Marketplace."),
  spacer(),

  h2("3.3 Rules Engine Service"),
  para("Núcleo do sistema. Permite que qualquer sistema de RPG seja modelado via DSL declarativa (JSON/YAML), sem necessidade de alterar código da plataforma."),
  h3("3.3.1 Estrutura da DSL"),
  ...codeBlock([
    '{',
    '  "system": "tormenta20",',
    '  "version": "1.0",',
    '  "attributes": ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"],',
    '  "skills": [',
    '    { "id": "atletismo", "attribute": "forca", "trained_bonus": 5 }',
    '  ],',
    '  "roll": {',
    '    "attack": "1d20 + attribute_mod + proficiency + misc",',
    '    "damage": "weapon_dice + attribute_mod"',
    '  },',
    '  "events": ["ON_ATTACK", "ON_DAMAGE", "ON_HEAL", "ON_TURN_START", "ON_CONDITION_APPLY"],',
    '  "conditions": ["abalado", "agarrado", "apavorado", "caído", "cego", "surdo"]',
    '}',
  ]),
  h3("3.3.2 Subsistemas da Engine"),
  simpleTable(
    ["Subsistema", "Função"],
    [
      ["Dice Engine", "d4 a d100, pools, exploding dice, success counting, advantage/disadvantage"],
      ["Formula Evaluator", "Avaliação segura de fórmulas (sandbox, sem execução arbitrária)"],
      ["Event Bus", "Sistema pub/sub interno para triggers de regras"],
      ["Buff/Debuff Manager", "Estado reativo: vantagens, penalidades, modificadores temporários"],
      ["Condition Tracker", "Condições do sistema com efeitos automáticos"],
      ["Automation Engine", "Scripts declarativos para automação de regras complexas"],
    ],
    [2800, 6200]
  ),
  spacer(),
  ...infoBox("Segurança da Sandbox de Scripts", [
    "  - Scripts rodam em isolamento total (VM sandbox / WebAssembly)",
    "  - Sem acesso ao sistema de arquivos, rede ou variáveis de ambiente",
    "  - Timeout configurável por execução (padrão: 100ms)",
    "  - Lista branca de funções permitidas (Math, dice, character attributes)",
    "  - Auditoria de todos os scripts executados",
  ]),

  h2("3.4 VTT Engine Service"),
  para("Gerencia o estado visual da mesa: mapas, layers, tokens, fog of war e iluminação dinâmica."),
  simpleTable(
    ["Recurso", "Detalhe"],
    [
      ["Mapas", "Grid quadrado e hexagonal, múltiplas layers (background, objects, GM layer, player layer)"],
      ["Fog of War", "FoW por token (visão individual por personagem) ou global (GM controla)"],
      ["Dynamic Lighting", "Raycasting em tempo real, paredes com LOS, sombras, fontes de luz"],
      ["Tokens", "Movimento com animação, barra de HP, auras, status visuais, snap-to-grid"],
      ["Medição", "Ferramentas de distância e área de efeito (cone, círculo, linha, cubo)"],
      ["Iniciativa Tracker", "Ordem de iniciativa sincronizada em tempo real para todos os jogadores"],
    ],
    [2200, 6800]
  ),
  spacer(),

  h2("3.5 Realtime Gateway Service"),
  para("WebSocket gateway responsável por toda comunicação em tempo real durante as sessões de jogo."),
  bullet("Protocolo: WebSocket com fallback para Long-Polling."),
  bullet("Rooms isoladas por mesa: eventos de uma mesa nunca vazam para outra."),
  bullet("Modelo Authoritative Server: toda ação é validada no servidor antes de ser broadcastada."),
  bullet("Event batching: micro-eventos agrupados em frames de 50ms para reduzir tráfego."),
  bullet("Reconexão automática: estado da mesa é reenviado ao cliente ao reconectar."),
  bullet("Horizontal scaling via Redis Pub/Sub para sincronizar múltiplos pods."),
  spacer(),

  h2("3.6 Compendium Service"),
  para("Armazena e serve todas as entidades de regras dos sistemas suportados: raças, classes, subclasses, magias, habilidades, itens, monstros, aventuras e tabelas."),
  bullet("Read-heavy: CQRS com réplica de leitura + cache Redis em camadas."),
  bullet("Full-text search via ElasticSearch ou PostgreSQL FTS."),
  bullet("Conteúdo oficial licenciado separado de homebrew por namespace."),
  bullet("Filtros por sistema, fonte, nível, escola de magia, tipo de monstro, etc."),
  spacer(),
  pageBreak(),
);

// ============================
// 4. SISTEMA DE FICHAS
// ============================
children.push(
  h1("4. Sistema de Fichas Dinâmicas"),
  para("As fichas de personagem são renderizadas dinamicamente a partir de uma definição JSON do sistema. O layout, os atributos, recursos e habilidades são todos configuráveis por sistema, sem código customizado por ficha."),

  h2("4.1 Arquitetura da Ficha"),
  bullet("Cada sistema define um Sheet Schema: quais campos existem, seus tipos, fórmulas de cálculo e layout."),
  bullet("O frontend renderiza a ficha a partir do schema — o componente React é genérico."),
  bullet("Cálculos automáticos: bônus de atributo, modificadores, totais de HP, CA, etc."),
  bullet("Drag-and-drop de habilidades e itens diretamente para a barra de ações."),
  bullet("Integração direta com a engine de rolagens: clicar em um atributo/perícia rola o dado."),
  spacer(),

  h2("4.2 Ficha Tormenta20 — Mapeamento"),
  simpleTable(
    ["Seção", "Campos", "Automação"],
    [
      ["Atributos", "FOR, DES, CON, INT, SAB, CAR (valor + mod)", "Mod = (valor - 10) / 2"],
      ["Defesa", "Defesa, Armadura, Escudo, Outros", "CA = 10 + mod_des + armadura + escudo"],
      ["PV / PM", "PV Máximo, Atual, Temp; PM Máximo, Atual", "PV base por classe + CON; PM por classe + INT"],
      ["Perícias", "Lista T20 com treino, atributo, bônus misc", "Total = mod_attr + treino + misc"],
      ["Ataques", "Nome, bônus ataque, dano, crítico, alcance", "Clique rola 1d20 + bônus"],
      ["Poderes & Magias", "Lista de poderes com descrição e custo de PM", "Botão 'usar' desconta PM automaticamente"],
      ["Equipamento", "Inventário com peso e custo", "Soma automática de peso total"],
      ["Origem & Classe", "Raça, origem, classe, nível, XP", "XP tracker com threshold por nível"],
    ],
    [2200, 3800, 3000]
  ),
  spacer(),
  pageBreak(),
);

// ============================
// 5. BANCO DE DADOS
// ============================
children.push(
  h1("5. Modelagem de Banco de Dados"),
  para("A plataforma adota persistência polilíngue (polyglot persistence): cada tipo de dado é armazenado no banco mais adequado à sua natureza de acesso e estrutura."),

  h2("5.1 PostgreSQL — Dados Relacionais"),
  para("Dados estruturados, transacionais e com forte necessidade de integridade referencial."),
  simpleTable(
    ["Entidade", "Campos Principais", "Relacionamentos"],
    [
      ["users", "id, email, display_name, password_hash, created_at, deleted_at", "→ user_roles, campaigns"],
      ["campaigns", "id, owner_id, system_id, name, status, settings_json", "→ tables, characters"],
      ["tables", "id, campaign_id, name, active_map_id, state", "→ table_members, maps"],
      ["characters", "id, user_id, campaign_id, system_id, sheet_data (JSONB)", "→ tables via table_characters"],
      ["marketplace_items", "id, creator_id, type, title, price, status, drm_level", "→ purchases"],
      ["subscriptions", "id, user_id, plan_id, status, expires_at", "→ users, plans"],
      ["audit_logs", "id, user_id (nullable), action, resource, ip_hash, created_at", "Tabela append-only"],
    ],
    [2200, 4400, 2400]
  ),
  spacer(),

  h2("5.2 MongoDB — Dados Flexíveis"),
  para("Conteúdo com schema variável por sistema: fichas, regras, homebrews, entidades de compêndio."),
  bullet("Collection compendium_entries: { system, type, data } — schema livre por tipo de entidade."),
  bullet("Collection homebrew_items: rascunhos e publicações de conteúdo criado por usuários."),
  bullet("Collection sheet_templates: definição de layout e campos por sistema de RPG."),
  spacer(),

  h2("5.3 Redis — Cache e Tempo Real"),
  simpleTable(
    ["Uso", "Key Pattern", "TTL"],
    [
      ["Sessão de usuário", "session:{token_id}", "30 dias"],
      ["Estado da mesa (cache)", "table:state:{table_id}", "Enquanto sessão ativa"],
      ["Presença online", "presence:{user_id}", "60s (heartbeat)"],
      ["Rate limiting", "ratelimit:{ip}:{endpoint}", "1 min / 1h"],
      ["Cache de compêndio", "compendium:{system}:{type}:{id}", "24h"],
      ["Pub/Sub RT nodes", "channel:table:{table_id}", "Sem TTL (evento)"],
    ],
    [2800, 3600, 2600]
  ),
  spacer(),
  pageBreak(),
);

// ============================
// 6. SEGURANÇA
// ============================
children.push(
  h1("6. Arquitetura de Segurança"),

  h2("6.1 Princípios Fundamentais"),
  bullet("Zero Trust: toda requisição autentica, autoriza e valida — sem trust implícito por estar 'dentro da rede'."),
  bullet("Least Privilege: cada serviço e usuário possui apenas as permissões mínimas necessárias."),
  bullet("Defense in Depth: múltiplas camadas de controle — rede, aplicação, dados."),
  bullet("Authoritative Server: cliente nunca é fonte de verdade para estado de jogo."),
  bullet("Privacy by Design: coleta mínima de dados, anonimização por padrão."),
  spacer(),

  h2("6.2 Segurança de Aplicação"),
  simpleTable(
    ["Ameaça", "Mitigação"],
    [
      ["SQL Injection", "ORM com queries parametrizadas, sem concatenação de SQL"],
      ["XSS", "Content Security Policy restritiva, sanitização de inputs, React por padrão escapa HTML"],
      ["CSRF", "SameSite=Strict cookies + CSRF tokens para mutações"],
      ["SSRF", "Whitelist de domínios externos permitidos, bloqueio de IPs internos em fetches"],
      ["Rate Limiting", "Por IP e por user: API Gateway + Redis. Exponential backoff em auth failures"],
      ["Brute Force Auth", "Lockout após 5 tentativas, CAPTCHA progressivo, alertas por e-mail"],
      ["Upload Malicioso", "Validação de MIME type + antivírus (ClamAV) + sandbox de processamento"],
      ["Script Injection (VTT)", "Sandbox isolada para scripts de automação, sem eval() no cliente"],
    ],
    [2800, 6200]
  ),
  spacer(),

  h2("6.3 Segurança de Infraestrutura"),
  bullet("TLS 1.3 obrigatório em todas as comunicações externas e internas (mTLS entre microserviços)."),
  bullet("Secrets gerenciados via HashiCorp Vault ou AWS Secrets Manager — sem secrets em código ou env files versionados."),
  bullet("Network Policies no Kubernetes: pods só se comunicam com serviços explicitamente declarados."),
  bullet("Imagens Docker escaneadas por vulnerabilidades (Trivy, Snyk) no pipeline CI/CD."),
  bullet("Web Application Firewall (WAF) na borda com regras para OWASP Top 10."),
  spacer(),

  h2("6.4 Criptografia de Dados"),
  simpleTable(
    ["Dado", "Algoritmo", "Observação"],
    [
      ["Senhas", "Argon2id (memória 64MB, 3 iterações)", "bcrypt como fallback legado"],
      ["Dados em trânsito", "TLS 1.3 / AES-256-GCM", "HSTS com max-age mínimo 1 ano"],
      ["Dados em repouso (DB)", "AES-256 (encryption at rest do cloud provider)", "Chaves rotacionadas anualmente"],
      ["Tokens JWT", "RS256 (chave assimétrica)", "Chaves rotacionadas com JWK endpoint"],
      ["PII em logs", "Anonimização parcial de IP, mascaramento de e-mail", "Nunca logar senha ou token completo"],
    ],
    [2600, 3000, 3400]
  ),
  spacer(),

  h2("6.5 Anti-Cheat e Integridade de Jogo"),
  bullet("Todas as rolagens são computadas no servidor com seed auditável e assinatura digital."),
  bullet("Movimentação de tokens validada contra as regras do sistema (distância máxima por turno)."),
  bullet("Log imutável (append-only) de eventos de combate com timestamp e user_id."),
  bullet("GMs recebem alertas de anomalias estatísticas em rolagens (detecção de bots)."),
  spacer(),
  pageBreak(),
);

// ============================
// 7. LGPD
// ============================
children.push(
  h1("7. Conformidade com LGPD e Privacidade"),
  para("A plataforma é desenvolvida sob o princípio de Privacy by Design, integrando proteção de dados desde a concepção arquitetural, não como camada adicional. A conformidade com a LGPD (Lei 13.709/2018) é requisito funcional de negócio, não opcional."),

  h2("7.1 Dados Pessoais Coletados e Bases Legais"),
  simpleTable(
    ["Dado", "Finalidade", "Base Legal (LGPD)", "Retenção"],
    [
      ["E-mail", "Autenticação, comunicação", "Execução contratual (Art. 7°, V)", "Até exclusão da conta"],
      ["Nome de exibição", "Identificação na plataforma", "Execução contratual", "Até exclusão da conta"],
      ["IP de acesso", "Segurança, prevenção de fraudes", "Legítimo interesse (Art. 7°, IX)", "90 dias (anonimizado após 30)"],
      ["Dados de pagamento", "Cobrança de assinatura", "Execução contratual", "7 anos (obrigação fiscal)"],
      ["Conteúdo criado", "Funcionamento do serviço", "Execução contratual", "Até exclusão da conta"],
      ["Logs de sessão de jogo", "Funcionalidade, auditoria de rolagens", "Execução contratual", "12 meses"],
      ["Cookies de sessão", "Autenticação", "Execução contratual / Consentimento", "30 dias"],
      ["Dados de uso/analytics", "Melhoria do produto", "Consentimento (Art. 7°, I)", "24 meses"],
    ],
    [2000, 2800, 2600, 1600]
  ),
  spacer(),

  h2("7.2 Direitos do Titular — Implementação Técnica"),
  simpleTable(
    ["Direito (LGPD Art. 18)", "Implementação", "SLA"],
    [
      ["Confirmação e acesso", "Endpoint GET /me/data — exporta todos os dados em JSON/CSV", "Imediato (self-service)"],
      ["Correção", "Edição de perfil via UI; solicitação de correção via suporte", "48h"],
      ["Anonimização", "Script de anonimização: substitui PII por hash irreversível", "72h"],
      ["Portabilidade", "Exportação completa: personagens, campanhas, conteúdo em JSON", "24h"],
      ["Eliminação", "Soft delete + purge agendado em 30 dias; dados de billing mantidos 7 anos", "Imediato (soft) / 30 dias (hard)"],
      ["Oposição ao tratamento", "Opt-out de analytics e marketing via painel de configurações", "Imediato"],
      ["Revogação de consentimento", "Toggle em configurações de privacidade com efeito imediato", "Imediato"],
    ],
    [2600, 4400, 2000]
  ),
  spacer(),

  h2("7.3 DPO e Governança de Privacidade"),
  bullet("Designação de Encarregado (DPO) com canal público de contato (privacidade@plataforma.com.br)."),
  bullet("Registro de Atividades de Tratamento (ROPA) documentado e atualizado."),
  bullet("Privacy Impact Assessment (PIA/DPIA) obrigatório para novas features que processem PII."),
  bullet("Treinamento anual obrigatório de privacidade para toda a equipe técnica e produto."),
  bullet("Cláusulas contratuais com todos os sub-operadores (cloud, analytics, pagamentos)."),
  spacer(),

  h2("7.4 Incidente de Segurança — Plano de Resposta"),
  bullet("Contenção: isolamento do serviço afetado em até 1h da detecção."),
  bullet("Avaliação: classificação do incidente (tipos de dados, volume, risco de dano)."),
  bullet("Notificação ANPD: em até 72h para incidentes com risco relevante (Art. 48, LGPD)."),
  bullet("Notificação aos titulares: comunicação direta quando houver risco ou dano."),
  bullet("Post-mortem: relatório técnico completo em até 15 dias."),
  spacer(),

  h2("7.5 Transferência Internacional de Dados"),
  para("A plataforma poderá usar provedores cloud com infraestrutura fora do Brasil (AWS, GCP). A transferência será baseada em cláusulas contratuais padrão (Art. 33, II, LGPD) com provedores que ofereçam nível adequado de proteção, preferencialmente com data residency configurada para regiões brasileiras ou sul-americanas."),
  spacer(),
  pageBreak(),
);

// ============================
// 8. MARKETPLACE & HOMEBREW
// ============================
children.push(
  h1("8. Marketplace e Sistema Homebrew"),

  h2("8.1 Arquitetura do Marketplace"),
  para("O Marketplace funciona como uma plataforma de distribuição de conteúdo criado pela comunidade e por editoras parceiras, com modelo de revenue share."),
  simpleTable(
    ["Tipo de Conteúdo", "Formatos", "DRM"],
    [
      ["Aventuras", "PDF + dados estruturados T20/D&D", "Licença por conta, não transferível"],
      ["Mapas", "PNG/WebP + metadata de grid", "Uso irrestrito após compra"],
      ["Tokens", "PNG transparente, sets temáticos", "Uso irrestrito após compra"],
      ["Sistemas Completos", "JSON schema + assets + fichas", "Licença por plataforma"],
      ["Módulos de Automação", "Scripts declarativos validados", "Open source ou licenciado"],
      ["Trilhas Sonoras", "MP3/OGG para uso em mesa", "Licença de uso não-comercial"],
    ],
    [2600, 3200, 3200]
  ),
  spacer(),

  h2("8.2 Modelo Financeiro"),
  bullet("Revenue share padrão: 70% criador / 30% plataforma."),
  bullet("Criadores verificados (editoras parceiras): 80% / 20%."),
  bullet("Conteúdo gratuito: sem taxas, mas sujeito a curadoria."),
  bullet("Pagamentos via integração com Stripe (internacional) e Pagar.me (Brasil/PIX)."),
  bullet("Repasse mensal com relatório de vendas detalhado por item."),
  spacer(),

  h2("8.3 Sistema Homebrew"),
  para("Usuários podem criar conteúdo personalizado (homebrew) tanto para uso privado quanto para publicação."),
  bullet("Builder visual para: classes, origens, poderes, magias, raças, monstros, itens."),
  bullet("Workflow de publicação: Rascunho → Revisão Comunitária → Publicado."),
  bullet("Conteúdo homebrew isolado de conteúdo oficial por namespace (evita conflitos de ID)."),
  bullet("Importação/exportação em JSON padronizado para interoperabilidade."),
  spacer(),
  pageBreak(),
);

// ============================
// 9. OBSERVABILIDADE
// ============================
children.push(
  h1("9. Observabilidade e Monitoramento"),

  h2("9.1 Stack de Observabilidade"),
  simpleTable(
    ["Ferramenta", "Função", "Dados Coletados"],
    [
      ["Prometheus", "Coleta de métricas", "Latência, throughput, erros, saturation"],
      ["Grafana", "Dashboards e alertas", "Painéis por serviço, SLO dashboards"],
      ["Loki", "Agregação de logs", "Logs estruturados JSON de todos os serviços"],
      ["OpenTelemetry", "Distributed tracing", "Trace ID propagado entre microserviços"],
      ["Jaeger / Tempo", "Visualização de traces", "Rastreamento de requests end-to-end"],
      ["Alertmanager", "Roteamento de alertas", "PagerDuty, Slack, e-mail on-call"],
    ],
    [2200, 3000, 3800]
  ),
  spacer(),

  h2("9.2 SLOs (Service Level Objectives)"),
  simpleTable(
    ["Serviço", "SLO Disponibilidade", "SLO Latência (p95)", "SLO Latência (p99)"],
    [
      ["API Gateway", "99.9%", "< 200ms", "< 500ms"],
      ["Realtime Gateway", "99.9%", "< 50ms", "< 150ms"],
      ["Rules Engine", "99.5%", "< 100ms", "< 300ms"],
      ["Compendium API", "99.5%", "< 300ms", "< 800ms"],
      ["Marketplace API", "99.5%", "< 500ms", "< 1500ms"],
    ],
    [2600, 2200, 2200, 2000]
  ),
  spacer(),

  h2("9.3 Métricas de Negócio"),
  bullet("Sessões de jogo ativas em tempo real (WebSocket connections)."),
  bullet("Rolagens por minuto (throughput da Rules Engine)."),
  bullet("Taxa de sincronização da mesa (event lag entre servidor e clientes)."),
  bullet("Tempo médio de carregamento de ficha por sistema."),
  bullet("Conversão freemium → premium e taxa de churn."),
  spacer(),
  pageBreak(),
);

// ============================
// 10. DEVOPS & CI/CD
// ============================
children.push(
  h1("10. DevSecOps e Pipeline CI/CD"),

  h2("10.1 Pipeline de CI/CD"),
  ...infoBox("Estágios do Pipeline (GitHub Actions / GitLab CI)", [
    "  1. Lint & Format        → ESLint, Prettier, validação de tipos TypeScript",
    "  2. Unit Tests           → Jest (>80% coverage obrigatório para merge)",
    "  3. Integration Tests    → Testes de contrato entre microserviços (Pact)",
    "  4. SAST                 → SonarQube — análise estática de segurança",
    "  5. SCA                  → Dependabot / Snyk — vulnerabilidades em dependências",
    "  6. Secret Scanning      → Gitleaks — detecta credenciais acidentais no código",
    "  7. Container Scan       → Trivy — vulnerabilidades em imagens Docker",
    "  8. IaC Scan             → Checkov — misconfigurations em Terraform/Helm",
    "  9. Build & Push         → Imagem Docker para registry privado",
    " 10. Deploy Staging        → Helm upgrade no cluster de staging",
    " 11. E2E Tests             → Playwright — testes de ponta a ponta em staging",
    " 12. Deploy Production     → Blue/Green deployment com rollback automático",
  ]),

  h2("10.2 Gestão de Ambiente"),
  bullet("Infraestrutura como Código (IaC) com Terraform para todos os recursos cloud."),
  bullet("Helm charts versionados para cada microserviço."),
  bullet("GitOps com ArgoCD: estado do cluster sempre espelha repositório Git."),
  bullet("Ambientes: Development, Staging, Production — isolados por namespace Kubernetes."),
  bullet("Feature flags (LaunchDarkly / Unleash) para rollout gradual de funcionalidades."),
  spacer(),
  pageBreak(),
);

// ============================
// 11. ROADMAP
// ============================
children.push(
  h1("11. Roadmap Técnico"),
  simpleTable(
    ["Fase", "Duração Est.", "Entregas Principais"],
    [
      ["Fase 0 — Fundação", "2 meses", "Infra base (K8s, CI/CD, observabilidade), Identity Service, estrutura de DB"],
      ["Fase 1 — MVP", "4 meses", "Campanhas, VTT básico (mapa, tokens, FoW), Chat, Rolagens, Fichas T20 e D&D 5e"],
      ["Fase 2 — Experiência", "3 meses", "Iluminação dinâmica, Compêndio T20 completo, Automações, Iniciativa tracker"],
      ["Fase 3 — Ecossistema", "4 meses", "Marketplace, Homebrew builder, APIs públicas, SDKs, Webhooks"],
      ["Fase 4 — Expansão", "Contínuo", "Mobile apps, ferramentas IA (resumo de sessão, NPCs), suporte a novos sistemas"],
    ],
    [2200, 1800, 5000]
  ),
  spacer(),

  h2("11.1 Critérios de Go-Live (MVP)"),
  bullet("Suporte completo a Tormenta20 e D&D 5e com fichas automatizadas."),
  bullet("Mesa virtual funcional com até 8 jogadores simultâneos por sala."),
  bullet("Latência de sincronização < 100ms em p95 no Brasil."),
  bullet("Conformidade LGPD verificada por assessoria jurídica."),
  bullet("Penetration test aprovado (sem críticos/altos não resolvidos)."),
  bullet("99.5% de uptime em 30 dias de staging com carga simulada."),
  spacer(),
  pageBreak(),
);

// ============================
// 12. TECNOLOGIAS — SUMÁRIO
// ============================
children.push(
  h1("12. Stack Tecnológica — Visão Consolidada"),
  simpleTable(
    ["Camada", "Tecnologia Escolhida", "Alternativa / Fallback", "Justificativa"],
    [
      ["Frontend SPA", "Next.js 14 + TypeScript", "Vite + React", "SSR/SSG, performance, ecossistema"],
      ["Canvas VTT", "PixiJS v8", "Phaser, Konva", "GPU-accelerated, 2D ótimo para VTT"],
      ["Estado Frontend", "Zustand + React Query", "Redux Toolkit", "Leve, DX superior para RT"],
      ["Backend Principal", "NestJS (Node.js)", "Go (serviços RT críticos)", "Modular, DI nativo, TypeScript"],
      ["API Real-Time", "Colyseus (sobre WS)", "Socket.IO, Livekit", "Game-loop, rooms, autoridade nativa"],
      ["API Gateway", "Kong OSS", "AWS API Gateway, Traefik", "Plugins, rate limiting, flexibilidade"],
      ["Banco Relacional", "PostgreSQL 16", "—", "Robustez, JSONB, full-text search"],
      ["Banco Documentos", "MongoDB Atlas", "Couchbase", "Schema livre para regras/homebrew"],
      ["Cache / RT", "Redis 7 (Cluster)", "Valkey (fork OSS)", "Pub/Sub, performance, versatilidade"],
      ["Search", "PostgreSQL FTS (inicial)", "ElasticSearch / Typesense", "Simples para MVP, migrar se necessário"],
      ["Object Storage", "Cloudflare R2", "AWS S3, MinIO", "Sem egress fees, CDN integrado"],
      ["Mensageria", "RabbitMQ", "Apache Kafka (se escalar)", "Simples, confiável, suficiente para MVP"],
      ["Infra", "Kubernetes (EKS/GKE)", "—", "Escalabilidade, portabilidade"],
      ["IaC", "Terraform + Helm", "Pulumi", "Padrão de mercado"],
      ["CI/CD", "GitHub Actions", "GitLab CI", "Integração, Actions ecosystem"],
      ["Observabilidade", "Prometheus + Grafana + Loki", "Datadog (custo)", "OSS, sem vendor lock-in"],
      ["Pagamentos BR", "Pagar.me (PIX, cartão)", "Stripe + conversão", "PIX nativo, menor fricção BR"],
    ],
    [2000, 2400, 2200, 2400]
  ),
  spacer(),
  pageBreak(),
);

// ============================
// 13. RISCOS
// ============================
children.push(
  h1("13. Riscos Técnicos e Mitigações"),
  simpleTable(
    ["Risco", "Impacto", "Probabilidade", "Mitigação"],
    [
      ["Latência alta em tempo real (muitos jogadores)", "Alto", "Média", "Sharding de rooms, event batching, edge nodes no Brasil"],
      ["Complexidade de regras impossível de modelar em DSL", "Alto", "Baixa", "DSL extensível + escape hatch para scripts declarativos supervisionados"],
      ["Escalabilidade de assets (mapas HD, tokens)", "Médio", "Alta", "CDN + R2 com lazy loading, compressão WebP, thumbnails automáticos"],
      ["Violação de direitos autorais no Marketplace", "Alto", "Média", "DMCA process, moderação de conteúdo, licenças explícitas por item"],
      ["Incidente de vazamento de dados (LGPD)", "Crítico", "Baixa", "Encryption at rest, pen tests, SOC2, plano de resposta a incidentes"],
      ["Dependência de sistema único de RPG", "Médio", "Alta (já mitigada)", "Arquitetura System Agnostic desde o início"],
      ["Acoplamento entre microserviços", "Médio", "Média", "Event-driven, API contracts (Pact), ADR process obrigatório"],
      ["Vendor lock-in em cloud", "Médio", "Média", "Kubernetes agnóstico de cloud, Terraform multi-provider, R2 para storage"],
    ],
    [2600, 1200, 1400, 3800]
  ),
  spacer(),
  pageBreak(),
);

// ============================
// APÊNDICE
// ============================
children.push(
  h1("Apêndice A — Glossário"),
  simpleTable(
    ["Termo", "Definição"],
    [
      ["VTT", "Virtual Tabletop — plataforma digital para RPG de mesa online"],
      ["DSL", "Domain-Specific Language — linguagem declarativa para definir regras de sistemas"],
      ["CQRS", "Command Query Responsibility Segregation — separação de leitura e escrita"],
      ["DDD", "Domain-Driven Design — modelagem orientada ao domínio de negócio"],
      ["Authoritative Server", "Servidor como única fonte de verdade para estado de jogo"],
      ["FoW", "Fog of War — névoa de guerra; restrição de visibilidade no mapa"],
      ["LOS", "Line of Sight — linha de visão para iluminação dinâmica"],
      ["PII", "Personally Identifiable Information — dado pessoal identificável"],
      ["ROPA", "Record of Processing Activities — registro de atividades de tratamento (LGPD)"],
      ["Revenue Share", "Modelo de divisão de receita entre plataforma e criador de conteúdo"],
      ["Homebrew", "Conteúdo criado por usuários, não-oficial"],
      ["T20", "Tormenta 20 — sistema de RPG brasileiro da Editora Jambô"],
    ],
    [2200, 6800]
  ),
  spacer(),
  pageBreak(),

  h1("Apêndice B — Referências"),
  bullet("Tormenta 20 — Livro Básico (Editora Jambô, 2020)"),
  bullet("Tormenta 20 — Atlas de Arton (Editora Jambô)"),
  bullet("LGPD — Lei Geral de Proteção de Dados (Lei 13.709/2018)"),
  bullet("OWASP Top 10 2021 — owasp.org"),
  bullet("12-Factor App — 12factor.net"),
  bullet("Domain-Driven Design — Eric Evans"),
  bullet("Building Microservices — Sam Newman"),
  bullet("Roll20 API Documentation — help.roll20.net"),
);

// ============================================================
// NUMBERING CONFIG
// ============================================================
const numbering = {
  config: [
    {
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      },{
        level: 1, format: LevelFormat.BULLET, text: "◦",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
      }]
    },
    {
      reference: "numbers",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
  ]
};

// ============================================================
// HEADER / FOOTER
// ============================================================
const headerPara = new Paragraph({
  children: [
    new TextRun({ text: "Plataforma VTT Multissistema — Documento de Modelagem", size: 18, color: C.secondary, font: "Arial" }),
  ],
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.secondary, space: 1 } },
  alignment: AlignmentType.LEFT,
});

const footerPara = new Paragraph({
  children: [
    new TextRun({ text: "Confidencial — Versão 1.0 | Maio 2025      Página ", size: 18, color: "888888", font: "Arial" }),
    new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888", font: "Arial" }),
    new TextRun({ text: " de ", size: 18, color: "888888", font: "Arial" }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "888888", font: "Arial" }),
  ],
  border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.midGray, space: 1 } },
  alignment: AlignmentType.CENTER,
});

// ============================================================
// BUILD DOCUMENT
// ============================================================
const doc = new Document({
  numbering,
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: C.heading1 },
        paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: C.heading2 },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: C.heading3 },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 }
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1200, bottom: 1200, left: 1440 }
      }
    },
    headers: { default: new Header({ children: [headerPara] }) },
    footers: { default: new Footer({ children: [footerPara] }) },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("./modelagem_vtt.docx", buf);
  console.log("DONE");
});
