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
