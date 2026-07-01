import { consultar } from "@/lib/db";

export type Kpis = {
  mrr: number;
  contratos: number;
  clientes: number;
  inadimplencia: number;
  recebido: number;
};

export async function getKpis(): Promise<Kpis> {
  const [row] = await consultar<Kpis>(`
    SELECT
      (SELECT COALESCE(SUM(valor_mensal), 0) FROM contratos WHERE status = 'ATIVO') AS mrr,
      (SELECT COUNT(*) FROM contratos WHERE status = 'ATIVO') AS contratos,
      (SELECT COUNT(*) FROM clientes WHERE status = 'ATIVO') AS clientes,
      (SELECT COALESCE(SUM(valor), 0) FROM faturas
        WHERE status = 'ABERTA' AND vencimento < date('now')) AS inadimplencia,
      (SELECT COALESCE(SUM(valor), 0) FROM pagamentos) AS recebido
  `);
  return row;
}

export function mrrPorPlano() {
  return consultar<{ plano: string; mrr: number }>(`
    SELECT p.nome AS plano, SUM(c.valor_mensal) AS mrr
    FROM contratos c
    JOIN planos p ON p.id = c.plano_id
    WHERE c.status = 'ATIVO'
    GROUP BY p.id
    ORDER BY mrr DESC
  `);
}

export function receitaPorMes() {
  return consultar<{ mes: string; valor: number }>(`
    SELECT strftime('%Y-%m', pago_em) AS mes, SUM(valor) AS valor
    FROM pagamentos
    GROUP BY mes
    ORDER BY mes
  `);
}

export function funilPorSegmento() {
  return consultar<{ segmento: string; total: number }>(`
    SELECT s.nome AS segmento, COUNT(*) AS total
    FROM leads l
    JOIN segmentos s ON s.id = l.segmento_id
    WHERE l.ativo = 1
    GROUP BY s.id
    ORDER BY total DESC
  `);
}

export function inadimplentes() {
  return consultar<{ cliente: string; faturas: number; total: number }>(`
    SELECT cl.nome AS cliente, COUNT(f.id) AS faturas, SUM(f.valor) AS total
    FROM faturas f
    JOIN contratos c ON c.id = f.contrato_id
    JOIN clientes cl ON cl.id = c.cliente_id
    WHERE f.status = 'ABERTA' AND f.vencimento < date('now')
    GROUP BY cl.id
    ORDER BY total DESC
  `);
}
