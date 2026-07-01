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
