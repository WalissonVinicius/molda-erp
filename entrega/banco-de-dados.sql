-- ============================================================
-- BANCO DE DADOS - ERP MOLDA (SQLite)
-- Atividade Avaliativa N3 - Banco de Dados - 3o semestre (ADS)
-- Aluno: Walisson Vinicius
-- Repositorio: https://github.com/WalissonVinicius/molda-erp
-- Aplicacao:   https://erp.walisson.dev
-- ============================================================

-- ############################################################
-- PARTE 1 - ESQUEMA (tabelas, tratamentos, indices e TRIGGERS)
-- ############################################################

-- =============================================================================
-- ERP Molda — Esquema do banco de dados (SQLite)
-- Agência digital: Prospecção -> Comercial -> Financeiro recorrente -> Operação
--
-- Padrão de nomes:
--   - Tabelas: snake_case no plural, em português
--   - Chave primária: "id" (INTEGER AUTOINCREMENT)
--   - Chave estrangeira: "<entidade>_id"
--   - Datas de controle: "criado_em" / "atualizado_em"
--   - Valores monetários: REAL (em reais)
-- =============================================================================

PRAGMA foreign_keys = ON;       -- impõe integridade referencial
PRAGMA recursive_triggers = ON; -- permite encadear triggers (proposta -> contrato -> fatura)

-- Limpeza (permite reexecutar o script do zero) ------------------------------
DROP TABLE IF EXISTS tarefas;
DROP TABLE IF EXISTS projetos;
DROP TABLE IF EXISTS pagamentos;
DROP TABLE IF EXISTS faturas;
DROP TABLE IF EXISTS contratos;
DROP TABLE IF EXISTS propostas;
DROP TABLE IF EXISTS planos_servicos;
DROP TABLE IF EXISTS servicos;
DROP TABLE IF EXISTS planos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS auditorias_site;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS colaboradores;
DROP TABLE IF EXISTS segmentos;

-- =============================================================================
-- MÓDULO CRM / PROSPECÇÃO
-- =============================================================================

-- Nichos de mercado atendidos pela agência (odonto, construtora, agro, ...).
CREATE TABLE segmentos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nome      TEXT    NOT NULL UNIQUE,
  descricao TEXT,
  ativo     INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
  criado_em TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Equipe da Molda: sócios e vendedores responsáveis por leads/propostas.
CREATE TABLE colaboradores (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nome      TEXT    NOT NULL,
  email     TEXT    UNIQUE,
  papel     TEXT    NOT NULL DEFAULT 'COMERCIAL'
            CHECK (papel IN ('SOCIO', 'DEV', 'MARKETING', 'COMERCIAL')),
  ativo     INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
  criado_em TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Leads de prospecção ativa (Google Maps) com pontuação de oportunidade.
CREATE TABLE leads (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nome           TEXT    NOT NULL,
  segmento_id    INTEGER NOT NULL REFERENCES segmentos(id) ON DELETE RESTRICT,
  responsavel_id INTEGER REFERENCES colaboradores(id) ON DELETE SET NULL,
  telefone       TEXT,
  cidade         TEXT    DEFAULT 'Sinop',
  uf             TEXT    DEFAULT 'MT' CHECK (uf IS NULL OR length(uf) = 2),
  site           TEXT,
  -- quanto maior o score, mais "feio" o site atual e mais quente o lead
  score_feiura   INTEGER NOT NULL DEFAULT 0 CHECK (score_feiura BETWEEN 0 AND 100),
  temperatura    TEXT    NOT NULL DEFAULT 'FRIO'
                 CHECK (temperatura IN ('FRIO', 'MORNO', 'QUENTE', 'SUPER_QUENTE')),
  tier           INTEGER NOT NULL DEFAULT 3 CHECK (tier BETWEEN 1 AND 3),
  franquia       INTEGER NOT NULL DEFAULT 0 CHECK (franquia IN (0, 1)),
  status         TEXT    NOT NULL DEFAULT 'NOVO'
                 CHECK (status IN ('NOVO', 'EM_CONTATO', 'CONVERTIDO', 'PERDIDO')),
  ativo          INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
  convertido_em  TEXT,
  criado_em      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Auditoria técnica do site do lead (relação 1:1 com leads).
CREATE TABLE auditorias_site (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id        INTEGER NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  https          INTEGER NOT NULL DEFAULT 0 CHECK (https IN (0, 1)),
  mobile_ok      INTEGER NOT NULL DEFAULT 0 CHECK (mobile_ok IN (0, 1)),
  tem_whatsapp   INTEGER NOT NULL DEFAULT 0 CHECK (tem_whatsapp IN (0, 1)),
  tempo_carga_ms INTEGER CHECK (tempo_carga_ms IS NULL OR tempo_carga_ms >= 0),
  observacoes    TEXT,
  criado_em      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Clientes ativos da agência (lead convertido ou entrada direta).
CREATE TABLE clientes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nome           TEXT    NOT NULL,
  segmento_id    INTEGER NOT NULL REFERENCES segmentos(id) ON DELETE RESTRICT,
  lead_origem_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  cnpj           TEXT    UNIQUE,
  email          TEXT    UNIQUE,
  telefone       TEXT,
  cidade         TEXT    DEFAULT 'Sinop',
  uf             TEXT    DEFAULT 'MT' CHECK (uf IS NULL OR length(uf) = 2),
  decisor        TEXT,
  status         TEXT    NOT NULL DEFAULT 'PROSPECCAO'
                 CHECK (status IN ('PROSPECCAO', 'ATIVO', 'INATIVO')),
  criado_em      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MÓDULO CATÁLOGO
-- =============================================================================

-- Planos mensais recorrentes da agência (Start, Grow, Exclusive, Enterprise).
CREATE TABLE planos (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  nome               TEXT    NOT NULL UNIQUE,
  descricao          TEXT,
  preco_mensal       REAL    NOT NULL CHECK (preco_mensal >= 0),
  verba_minima_midia REAL    NOT NULL DEFAULT 0 CHECK (verba_minima_midia >= 0),
  ativo              INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
  criado_em          TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Serviços que compõem os planos (site, artes, vídeos, tráfego, IA, ...).
CREATE TABLE servicos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nome      TEXT    NOT NULL UNIQUE,
  unidade   TEXT    NOT NULL DEFAULT 'un',
  criado_em TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Composição N:N entre planos e serviços, com quantidade incluída no plano.
CREATE TABLE planos_servicos (
  plano_id   INTEGER NOT NULL REFERENCES planos(id) ON DELETE CASCADE,
  servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  PRIMARY KEY (plano_id, servico_id)
);

-- =============================================================================
-- MÓDULO COMERCIAL / FINANCEIRO
-- =============================================================================

-- Propostas comerciais enviadas aos clientes.
CREATE TABLE propostas (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  plano_id   INTEGER NOT NULL REFERENCES planos(id) ON DELETE RESTRICT,
  autor_id   INTEGER REFERENCES colaboradores(id) ON DELETE SET NULL,
  valor      REAL    NOT NULL CHECK (valor >= 0),
  status     TEXT    NOT NULL DEFAULT 'RASCUNHO'
             CHECK (status IN ('RASCUNHO', 'ENVIADA', 'ACEITA', 'RECUSADA')),
  criado_em  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Contratos de assinatura recorrente. valor_anual é coluna GERADA.
CREATE TABLE contratos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  proposta_id     INTEGER UNIQUE REFERENCES propostas(id) ON DELETE SET NULL,
  cliente_id      INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  plano_id        INTEGER NOT NULL REFERENCES planos(id) ON DELETE RESTRICT,
  valor_mensal    REAL    NOT NULL CHECK (valor_mensal >= 0),
  valor_anual     REAL    GENERATED ALWAYS AS (valor_mensal * 12) STORED,
  data_assinatura TEXT    NOT NULL DEFAULT (date('now')),
  status          TEXT    NOT NULL DEFAULT 'ATIVO'
                  CHECK (status IN ('ATIVO', 'PAUSADO', 'CANCELADO')),
  criado_em       TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Faturas (mensalidades) geradas por contrato. Uma por competência.
CREATE TABLE faturas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  contrato_id INTEGER NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  competencia TEXT    NOT NULL,                    -- 'AAAA-MM'
  valor       REAL    NOT NULL CHECK (valor >= 0),
  vencimento  TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'ABERTA'
              CHECK (status IN ('ABERTA', 'PAGA', 'ATRASADA', 'CANCELADA')),
  criado_em   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (contrato_id, competencia)
);

-- Pagamentos recebidos por fatura (pode haver pagamento parcial).
CREATE TABLE pagamentos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  fatura_id INTEGER NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
  valor     REAL    NOT NULL CHECK (valor > 0),
  metodo    TEXT    NOT NULL DEFAULT 'PIX'
            CHECK (metodo IN ('PIX', 'CARTAO', 'BOLETO', 'DINHEIRO')),
  pago_em   TEXT    NOT NULL DEFAULT (datetime('now')),
  criado_em TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MÓDULO OPERAÇÃO
-- =============================================================================

-- Projetos/entregas executados para os clientes.
CREATE TABLE projetos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id   INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  contrato_id  INTEGER REFERENCES contratos(id) ON DELETE SET NULL,
  nome         TEXT    NOT NULL,
  tipo         TEXT    NOT NULL DEFAULT 'SITE'
               CHECK (tipo IN ('SITE', 'LANDING', 'APP', 'SISTEMA', 'AUTOMACAO', 'MARKETING')),
  status       TEXT    NOT NULL DEFAULT 'EM_ANDAMENTO'
               CHECK (status IN ('EM_ANDAMENTO', 'EM_MANUTENCAO', 'CONCLUIDO', 'PAUSADO')),
  url_entregue TEXT,
  criado_em    TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tarefas que compõem cada projeto.
CREATE TABLE tarefas (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  projeto_id     INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  responsavel_id INTEGER REFERENCES colaboradores(id) ON DELETE SET NULL,
  titulo         TEXT    NOT NULL,
  status         TEXT    NOT NULL DEFAULT 'A_FAZER'
                 CHECK (status IN ('A_FAZER', 'FAZENDO', 'FEITO')),
  horas          REAL    NOT NULL DEFAULT 0 CHECK (horas >= 0),
  criado_em      TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ÍNDICES (chaves estrangeiras e colunas mais filtradas nos relatórios)
-- =============================================================================
CREATE INDEX idx_leads_segmento     ON leads(segmento_id);
CREATE INDEX idx_leads_temperatura  ON leads(temperatura);
CREATE INDEX idx_clientes_segmento  ON clientes(segmento_id);
CREATE INDEX idx_propostas_cliente  ON propostas(cliente_id);
CREATE INDEX idx_contratos_cliente  ON contratos(cliente_id);
CREATE INDEX idx_contratos_plano    ON contratos(plano_id);
CREATE INDEX idx_contratos_status   ON contratos(status);
CREATE INDEX idx_faturas_contrato   ON faturas(contrato_id);
CREATE INDEX idx_faturas_status     ON faturas(status);
CREATE INDEX idx_faturas_competencia ON faturas(competencia);
CREATE INDEX idx_pagamentos_fatura  ON pagamentos(fatura_id);
CREATE INDEX idx_projetos_cliente   ON projetos(cliente_id);
CREATE INDEX idx_tarefas_projeto    ON tarefas(projeto_id);

-- =============================================================================
-- TRIGGERS (automação das regras de negócio)
-- =============================================================================

-- (1) Proposta aceita vira contrato automaticamente.
CREATE TRIGGER trg_proposta_aceita_gera_contrato
AFTER UPDATE OF status ON propostas
FOR EACH ROW
WHEN NEW.status = 'ACEITA' AND OLD.status <> 'ACEITA'
BEGIN
  INSERT INTO contratos (proposta_id, cliente_id, plano_id, valor_mensal, data_assinatura, status)
  VALUES (NEW.id, NEW.cliente_id, NEW.plano_id, NEW.valor, date('now'), 'ATIVO');
END;

-- (2) Contrato novo (ATIVO) gera a primeira fatura da competência de assinatura.
CREATE TRIGGER trg_contrato_novo_gera_fatura
AFTER INSERT ON contratos
FOR EACH ROW
WHEN NEW.status = 'ATIVO'
BEGIN
  INSERT INTO faturas (contrato_id, competencia, valor, vencimento, status)
  VALUES (
    NEW.id,
    strftime('%Y-%m', NEW.data_assinatura),
    NEW.valor_mensal,
    date(NEW.data_assinatura, '+7 days'),
    'ABERTA'
  );
END;

-- (3) Pagamento quita a fatura quando a SOMA dos pagamentos atinge o valor.
CREATE TRIGGER trg_pagamento_quita_fatura
AFTER INSERT ON pagamentos
FOR EACH ROW
BEGIN
  UPDATE faturas
  SET status = 'PAGA'
  WHERE id = NEW.fatura_id
    AND status IN ('ABERTA', 'ATRASADA')
    AND (SELECT COALESCE(SUM(valor), 0) FROM pagamentos WHERE fatura_id = NEW.fatura_id) >= valor;
END;

-- (4) Contrato cancelado cancela as faturas ainda em aberto.
CREATE TRIGGER trg_contrato_cancelado_cancela_faturas
AFTER UPDATE OF status ON contratos
FOR EACH ROW
WHEN NEW.status = 'CANCELADO' AND OLD.status <> 'CANCELADO'
BEGIN
  UPDATE faturas
  SET status = 'CANCELADA'
  WHERE contrato_id = NEW.id AND status = 'ABERTA';
END;

-- (5) Lead convertido recebe o carimbo de data/hora da conversão.
CREATE TRIGGER trg_lead_convertido
AFTER UPDATE OF status ON leads
FOR EACH ROW
WHEN NEW.status = 'CONVERTIDO' AND OLD.status <> 'CONVERTIDO'
BEGIN
  UPDATE leads SET convertido_em = datetime('now') WHERE id = NEW.id;
END;

-- (6) Validação: não permite proposta abaixo do preço mínimo do plano.
CREATE TRIGGER trg_proposta_valida_piso
BEFORE INSERT ON propostas
FOR EACH ROW
WHEN NEW.valor < (SELECT preco_mensal FROM planos WHERE id = NEW.plano_id)
BEGIN
  SELECT RAISE(ABORT, 'Valor da proposta abaixo do preco minimo do plano');
END;

-- (7) Mantém contratos.atualizado_em a cada alteração (sem entrar em loop).
CREATE TRIGGER trg_contratos_touch
AFTER UPDATE ON contratos
FOR EACH ROW
WHEN NEW.atualizado_em = OLD.atualizado_em
BEGIN
  UPDATE contratos
  SET atualizado_em = CURRENT_TIMESTAMP
  WHERE id = OLD.id AND atualizado_em <> CURRENT_TIMESTAMP;
END;


-- ############################################################
-- PARTE 2 - DADOS DE EXEMPLO (seed)
-- ############################################################

-- =============================================================================
-- ERP Molda — Dados de exemplo (seed)
-- Observação: alguns INSERT/UPDATE disparam triggers de propósito
--   - inserir contrato ATIVO gera a 1a fatura (trigger 2)
--   - registrar pagamento quita a fatura (trigger 3)
--   - aceitar a proposta 5 gera contrato + fatura (triggers 1 e 2)
--   - converter o lead 12 carimba a data de conversão (trigger 5)
-- =============================================================================

-- Segmentos -------------------------------------------------------------------
INSERT INTO segmentos (id, nome, descricao) VALUES
 (1, 'Odontologia',              'Clínicas e consultórios odontológicos'),
 (2, 'Construtora',              'Construtoras e incorporadoras'),
 (3, 'Agro',                     'Revendas de insumos e serviços agrícolas'),
 (4, 'Imobiliário',              'Imobiliárias e corretores'),
 (5, 'E-commerce',               'Lojas e varejo online'),
 (6, 'Educação',                 'Escolas e cursos'),
 (7, 'Estética',                 'Clínicas de estética e beleza'),
 (8, 'Bares e Eventos',          'Bares, casas de show e eventos');

-- Colaboradores ---------------------------------------------------------------
INSERT INTO colaboradores (id, nome, email, papel) VALUES
 (1, 'Walisson Vinicius', 'walisson@molda.io', 'SOCIO'),
 (2, 'João Catani',       'joao@molda.io',     'SOCIO'),
 (3, 'Bruno Almeida',     'bruno@molda.io',    'COMERCIAL'),
 (4, 'Carla Souza',       'carla@molda.io',    'COMERCIAL');

-- Planos ----------------------------------------------------------------------
INSERT INTO planos (id, nome, descricao, preco_mensal, verba_minima_midia) VALUES
 (1, 'Start',      'Para começar com o pé direito',          2500.00, 1500.00),
 (2, 'Grow',       'Para escalar com estratégia',            3900.00, 2500.00),
 (3, 'Exclusive',  'Performance e operação completa',        7490.00, 5000.00),
 (4, 'Enterprise', 'Escopo customizado',                    12000.00, 8000.00);

-- Serviços --------------------------------------------------------------------
INSERT INTO servicos (id, nome, unidade) VALUES
 (1, 'Site institucional', 'un'),
 (2, 'Landing Page',       'un/mês'),
 (3, 'Arte para redes',    'un/mês'),
 (4, 'Vídeo curto',        'un/mês'),
 (5, 'Tráfego pago',       'plataforma'),
 (6, 'Automação com IA',   'un'),
 (7, 'Relatório mensal',   'un/mês'),
 (8, 'Dashboard',          'un'),
 (9, 'Treinamento',        'h');

-- Composição dos planos (N:N) -------------------------------------------------
INSERT INTO planos_servicos (plano_id, servico_id, quantidade) VALUES
 (1, 1, 1), (1, 3, 4), (1, 5, 1), (1, 7, 1),
 (2, 1, 1), (2, 2, 1), (2, 3, 6), (2, 4, 2), (2, 5, 2), (2, 7, 1),
 (3, 1, 1), (3, 2, 2), (3, 3, 9), (3, 4, 3), (3, 5, 2), (3, 6, 1), (3, 8, 1), (3, 9, 4), (3, 7, 1),
 (4, 1, 1), (4, 2, 2), (4, 3, 9), (4, 4, 3), (4, 5, 3), (4, 6, 1), (4, 8, 1), (4, 9, 8);

-- Leads (prospecção) ----------------------------------------------------------
INSERT INTO leads (id, nome, segmento_id, responsavel_id, telefone, site, score_feiura, temperatura, tier, franquia, status, convertido_em) VALUES
 (1,  'Clínica OdontoVida',    1, 3, '66996520001', 'odontovida.com.br',   82, 'SUPER_QUENTE', 1, 0, 'CONVERTIDO', '2026-02-05 10:00:00'),
 (2,  'Implantes Sorriso',     1, 3, '66996520002', 'implantesorriso.com', 60, 'QUENTE',       2, 0, 'EM_CONTATO',  NULL),
 (3,  'Construtora Horizonte', 2, 4, '66996520003', 'chorizonte.com.br',   75, 'QUENTE',       1, 0, 'CONVERTIDO', '2026-01-18 09:30:00'),
 (4,  'Incorporadora Cedro',   2, 4, '66996520004', 'cedroinc.com.br',     40, 'MORNO',        2, 0, 'NOVO',        NULL),
 (5,  'AgroInsumos Norte',     3, 3, '66996520005', NULL,                  90, 'SUPER_QUENTE', 1, 0, 'CONVERTIDO', '2026-03-08 14:00:00'),
 (6,  'Sementes MT',           3, 4, '66996520006', 'sementesmt.com',      30, 'FRIO',         3, 0, 'PERDIDO',     NULL),
 (7,  'Imobiliária Raízes',    4, 3, '66996520007', 'raizesimoveis.com',   65, 'QUENTE',       2, 0, 'CONVERTIDO', '2026-02-16 11:15:00'),
 (8,  'Lar Imóveis',           4, 4, '66996520008', 'larimoveis.com.br',   50, 'MORNO',        2, 0, 'EM_CONTATO',  NULL),
 (9,  'Boutique Bella',        7, 3, '66996520009', 'boutiquebella.com',   70, 'QUENTE',       2, 0, 'CONVERTIDO', '2026-04-01 16:45:00'),
 (10, 'Mercado Bom Preço',     5, 4, '66996520010', NULL,                  20, 'FRIO',         3, 1, 'PERDIDO',     NULL),
 (11, 'Colégio Saber',         6, 3, '66996520011', 'colegiosaber.com.br', 55, 'MORNO',        2, 0, 'NOVO',        NULL),
 (12, 'Bar do Centro',         8, 4, '66996520012', 'bardocentro.com',     78, 'QUENTE',       1, 0, 'EM_CONTATO',  NULL);

-- Auditorias de site (1:1 com lead) -------------------------------------------
INSERT INTO auditorias_site (lead_id, https, mobile_ok, tem_whatsapp, tempo_carga_ms, observacoes) VALUES
 (1,  0, 0, 0, 6200, 'Site sem HTTPS e lento, sem WhatsApp'),
 (2,  1, 0, 1, 3800, 'Não responsivo no mobile'),
 (3,  0, 1, 0, 4100, 'Sem cadeado, domínio quase expirado'),
 (5,  0, 0, 0, 9000, 'Não possui site, só Instagram'),
 (7,  1, 1, 1, 2200, 'Site ok, mas sem captação de leads'),
 (8,  1, 0, 0, 5200, 'Layout datado'),
 (12, 0, 0, 1, 7300, 'Página única desatualizada');

-- Clientes (5 convertidos de leads + 1 entrada direta) ------------------------
INSERT INTO clientes (id, nome, segmento_id, lead_origem_id, cnpj, email, telefone, decisor, status) VALUES
 (1, 'Clínica OdontoVida',    1, 1,    '12345678000101', 'contato@odontovida.com.br', '66996520001', 'Dra. Marina', 'ATIVO'),
 (2, 'Construtora Horizonte', 2, 3,    '12345678000102', 'rh@chorizonte.com.br',      '66996520003', 'Eng. Paulo',  'ATIVO'),
 (3, 'AgroInsumos Norte',     3, 5,    '12345678000103', 'comercial@agronorte.com',   '66996520005', 'Sr. Tadeu',   'ATIVO'),
 (4, 'Imobiliária Raízes',    4, 7,    '12345678000104', 'contato@raizesimoveis.com', '66996520007', 'Sra. Lúcia',  'ATIVO'),
 (5, 'Boutique Bella',        7, 9,    '12345678000105', 'bella@boutiquebella.com',   '66996520009', 'Bella',       'ATIVO'),
 (6, 'Padaria Pão Quente',    5, NULL, '12345678000106', 'contato@paoquente.com',     '66996520020', 'Sr. Antônio', 'PROSPECCAO');

-- Propostas (valores sempre >= preço mínimo do plano, exigência do trigger 6) --
INSERT INTO propostas (id, cliente_id, plano_id, autor_id, valor, status) VALUES
 (1, 1, 2, 3, 3900.00,  'ACEITA'),
 (2, 2, 3, 4, 7490.00,  'ACEITA'),
 (3, 3, 2, 3, 4200.00,  'ACEITA'),
 (4, 4, 1, 3, 2500.00,  'ACEITA'),
 (5, 5, 1, 4, 2900.00,  'ENVIADA'),
 (6, 6, 2, 4, 3900.00,  'ENVIADA'),
 (7, 2, 4, 2, 12000.00, 'RASCUNHO');

-- Contratos (data de assinatura no passado para haver histórico) --------------
-- Ao inserir cada contrato ATIVO, o trigger 2 cria a fatura da competência inicial.
INSERT INTO contratos (id, proposta_id, cliente_id, plano_id, valor_mensal, data_assinatura, status) VALUES
 (1, 1, 1, 2, 3900.00, '2026-02-10', 'ATIVO'),
 (2, 2, 2, 3, 7490.00, '2026-01-15', 'ATIVO'),
 (3, 3, 3, 2, 4200.00, '2026-03-05', 'ATIVO'),
 (4, 4, 4, 1, 2500.00, '2026-04-12', 'ATIVO');

-- Faturas das competências seguintes (a 1a de cada contrato já veio do trigger)
INSERT INTO faturas (contrato_id, competencia, valor, vencimento) VALUES
 (1, '2026-03', 3900.00, '2026-03-17'),
 (1, '2026-04', 3900.00, '2026-04-17'),
 (1, '2026-05', 3900.00, '2026-05-17'),
 (1, '2026-06', 3900.00, '2026-06-17'),
 (2, '2026-02', 7490.00, '2026-02-15'),
 (2, '2026-03', 7490.00, '2026-03-15'),
 (2, '2026-04', 7490.00, '2026-04-15'),
 (2, '2026-05', 7490.00, '2026-05-15'),
 (2, '2026-06', 7490.00, '2026-06-15'),
 (3, '2026-04', 4200.00, '2026-04-12'),
 (3, '2026-05', 4200.00, '2026-05-12'),
 (3, '2026-06', 4200.00, '2026-06-12'),
 (4, '2026-05', 2500.00, '2026-05-19'),
 (4, '2026-06', 2500.00, '2026-06-19');

-- Pagamentos (quitam faturas passadas via trigger 3; deixam vencidas/atuais em aberto)
INSERT INTO pagamentos (fatura_id, valor, metodo, pago_em)
 SELECT id, valor, 'PIX',    '2026-02-15' FROM faturas WHERE contrato_id = 1 AND competencia = '2026-02';
INSERT INTO pagamentos (fatura_id, valor, metodo, pago_em)
 SELECT id, valor, 'PIX',    '2026-03-16' FROM faturas WHERE contrato_id = 1 AND competencia = '2026-03';
INSERT INTO pagamentos (fatura_id, valor, metodo, pago_em)
 SELECT id, valor, 'CARTAO', '2026-04-15' FROM faturas WHERE contrato_id = 1 AND competencia = '2026-04';
INSERT INTO pagamentos (fatura_id, valor, metodo, pago_em)
 SELECT id, valor, 'BOLETO', '2026-01-20' FROM faturas WHERE contrato_id = 2 AND competencia = '2026-01';
INSERT INTO pagamentos (fatura_id, valor, metodo, pago_em)
 SELECT id, valor, 'PIX',    '2026-02-16' FROM faturas WHERE contrato_id = 2 AND competencia = '2026-02';
INSERT INTO pagamentos (fatura_id, valor, metodo, pago_em)
 SELECT id, valor, 'PIX',    '2026-03-16' FROM faturas WHERE contrato_id = 2 AND competencia = '2026-03';
INSERT INTO pagamentos (fatura_id, valor, metodo, pago_em)
 SELECT id, valor, 'CARTAO', '2026-04-16' FROM faturas WHERE contrato_id = 2 AND competencia = '2026-04';
INSERT INTO pagamentos (fatura_id, valor, metodo, pago_em)
 SELECT id, valor, 'PIX',    '2026-05-16' FROM faturas WHERE contrato_id = 2 AND competencia = '2026-05';
INSERT INTO pagamentos (fatura_id, valor, metodo, pago_em)
 SELECT id, valor, 'PIX',    '2026-03-10' FROM faturas WHERE contrato_id = 3 AND competencia = '2026-03';
INSERT INTO pagamentos (fatura_id, valor, metodo, pago_em)
 SELECT id, valor, 'PIX',    '2026-04-14' FROM faturas WHERE contrato_id = 3 AND competencia = '2026-04';
INSERT INTO pagamentos (fatura_id, valor, metodo, pago_em)
 SELECT id, valor, 'BOLETO', '2026-04-15' FROM faturas WHERE contrato_id = 4 AND competencia = '2026-04';

-- Projetos --------------------------------------------------------------------
INSERT INTO projetos (id, cliente_id, contrato_id, nome, tipo, status, url_entregue) VALUES
 (1, 1, 1, 'Site OdontoVida',        'SITE',      'CONCLUIDO',    'https://odontovida.com.br'),
 (2, 1, 1, 'Gestão de tráfego',      'MARKETING', 'EM_ANDAMENTO', NULL),
 (3, 2, 2, 'Sistema de vendas',      'SISTEMA',   'EM_ANDAMENTO', NULL),
 (4, 3, 3, 'Landing da safra',       'LANDING',   'CONCLUIDO',    'https://agronorte.com/safra'),
 (5, 4, 4, 'Automação no WhatsApp',  'AUTOMACAO', 'EM_ANDAMENTO', NULL);

-- Tarefas ---------------------------------------------------------------------
INSERT INTO tarefas (projeto_id, responsavel_id, titulo, status, horas) VALUES
 (1, 1, 'Layout e identidade',        'FEITO',   12.0),
 (1, 1, 'Publicação e DNS',           'FEITO',    4.0),
 (2, 2, 'Campanha Google Ads',        'FAZENDO',  8.0),
 (3, 1, 'Modelagem do banco',         'FAZENDO', 16.0),
 (3, 1, 'API de pedidos',             'A_FAZER',  0.0),
 (4, 2, 'Copy e criativos',           'FEITO',    6.0),
 (5, 1, 'Fluxo de qualificação IA',   'FAZENDO', 10.0),
 (5, 2, 'Integração WhatsApp',        'A_FAZER',  0.0);

-- Demonstrações de trigger no próprio seed ------------------------------------
-- Aceitar a proposta 5 cria contrato + 1a fatura (triggers 1 e 2).
UPDATE propostas SET status = 'ACEITA' WHERE id = 5;
-- Converter o lead 12 carimba a data de conversão (trigger 5).
UPDATE leads SET status = 'CONVERTIDO' WHERE id = 12;


-- ############################################################
-- PARTE 3 - RELATORIOS SQL DE GERENCIAMENTO (5)
-- ############################################################

-- R1 — Funil de prospecção por segmento
-- Quantos leads existem por nicho, quantos estão quentes e o "score de feiura" médio.
-- Comandos: JOIN, WHERE, AND, COUNT, AVG, GROUP BY, ORDER BY.
SELECT s.nome AS segmento,
       COUNT(*) AS total_leads,
       COUNT(CASE WHEN l.temperatura IN ('QUENTE', 'SUPER_QUENTE') THEN 1 END) AS leads_quentes,
       ROUND(AVG(l.score_feiura), 1) AS score_medio
FROM leads l
JOIN segmentos s ON s.id = l.segmento_id
WHERE l.ativo = 1 AND l.franquia = 0
GROUP BY s.id
ORDER BY total_leads DESC, score_medio DESC;


-- R2 — MRR (receita recorrente mensal) por plano
-- Soma do valor mensal dos contratos ativos e projeção anual, agrupado por plano.
-- Comandos: JOIN, WHERE, COUNT, SUM, GROUP BY, ORDER BY.
SELECT p.nome AS plano,
       COUNT(c.id) AS contratos_ativos,
       SUM(c.valor_mensal) AS mrr,
       SUM(c.valor_mensal) * 12 AS arr_projetado
FROM contratos c
JOIN planos p ON p.id = c.plano_id
WHERE c.status = 'ATIVO'
GROUP BY p.id
ORDER BY mrr DESC;


-- R3 — Inadimplência (faturas vencidas em aberto)
-- Clientes com faturas em aberto já vencidas: quantidade e total devido.
-- Comandos: JOIN (2x), WHERE, AND, OR, COUNT, SUM, MIN, GROUP BY, HAVING.
SELECT cl.nome AS cliente,
       COUNT(f.id) AS faturas_vencidas,
       SUM(f.valor) AS total_em_aberto,
       MIN(f.vencimento) AS vencimento_mais_antigo
FROM faturas f
JOIN contratos c ON c.id = f.contrato_id
JOIN clientes cl ON cl.id = c.cliente_id
WHERE f.status = 'ABERTA'
  AND (f.vencimento < date('now') OR f.competencia < strftime('%Y-%m', 'now'))
GROUP BY cl.id
HAVING total_em_aberto > 0
ORDER BY total_em_aberto DESC;


-- R4 — Extrato de caixa: realizado + previsto
-- Une, num único extrato, o que já foi recebido (pagamentos) com o que ainda
-- está previsto (faturas em aberto). É o caso clássico de UNION ALL.
-- Comandos: UNION ALL, JOIN (3x), WHERE, ORDER BY.
SELECT pg.pago_em AS data,
       'REALIZADO' AS tipo,
       cl.nome AS cliente,
       pg.valor AS valor
FROM pagamentos pg
JOIN faturas f   ON f.id = pg.fatura_id
JOIN contratos c ON c.id = f.contrato_id
JOIN clientes cl ON cl.id = c.cliente_id
UNION ALL
SELECT f.vencimento AS data,
       'PREVISTO' AS tipo,
       cl.nome AS cliente,
       f.valor AS valor
FROM faturas f
JOIN contratos c ON c.id = f.contrato_id
JOIN clientes cl ON cl.id = c.cliente_id
WHERE f.status = 'ABERTA'
ORDER BY data, tipo;


-- R5 — Ranking de clientes por LTV (valor total já pago)
-- Soma de tudo que cada cliente ativo já pagou, com número de contratos.
-- Usa LEFT JOIN para incluir clientes ativos mesmo sem pagamentos.
-- Comandos: JOIN (INNER + LEFT), WHERE, AND, COUNT(DISTINCT), SUM, GROUP BY, ORDER BY, LIMIT.
SELECT cl.nome AS cliente,
       s.nome AS segmento,
       COUNT(DISTINCT c.id) AS contratos,
       COALESCE(SUM(pg.valor), 0) AS ltv
FROM clientes cl
JOIN segmentos s   ON s.id = cl.segmento_id
LEFT JOIN contratos c  ON c.cliente_id = cl.id
LEFT JOIN faturas f    ON f.contrato_id = c.id
LEFT JOIN pagamentos pg ON pg.fatura_id = f.id
WHERE cl.status = 'ATIVO' AND s.ativo = 1
GROUP BY cl.id
ORDER BY ltv DESC
LIMIT 10;


