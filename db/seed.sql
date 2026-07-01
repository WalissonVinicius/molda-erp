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
