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
