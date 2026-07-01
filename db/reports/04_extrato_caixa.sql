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
