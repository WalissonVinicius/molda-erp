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
