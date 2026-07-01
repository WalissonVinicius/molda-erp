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
