import { consultar } from "@/lib/db";

const like = (q: string) => `%${q.trim()}%`;

export function listLeads(q = "") {
  const where = q ? "WHERE l.nome LIKE ?" : "";
  return consultar(
    `SELECT l.id, l.nome, l.segmento_id, s.nome AS segmento, l.responsavel_id,
            l.telefone, l.temperatura, l.tier, l.score_feiura, l.status,
            COALESCE(co.nome, '—') AS responsavel
     FROM leads l
     JOIN segmentos s ON s.id = l.segmento_id
     LEFT JOIN colaboradores co ON co.id = l.responsavel_id
     ${where}
     ORDER BY l.score_feiura DESC`,
    q ? [like(q)] : []
  );
}

export function listClientes(q = "") {
  const where = q ? "WHERE cl.nome LIKE ?" : "";
  return consultar(
    `SELECT cl.id, cl.nome, cl.segmento_id, s.nome AS segmento, cl.cnpj, cl.email,
            cl.telefone, cl.cidade, cl.uf, COALESCE(cl.decisor, '—') AS decisor, cl.status,
            (SELECT COUNT(*) FROM contratos c
               WHERE c.cliente_id = cl.id AND c.status = 'ATIVO') AS contratos_ativos
     FROM clientes cl
     JOIN segmentos s ON s.id = cl.segmento_id
     ${where}
     ORDER BY cl.nome`,
    q ? [like(q)] : []
  );
}

export function listPropostas(q = "") {
  const where = q ? "WHERE cl.nome LIKE ?" : "";
  return consultar(
    `SELECT pr.id, pr.cliente_id, cl.nome AS cliente, pr.plano_id, p.nome AS plano,
            pr.autor_id, pr.valor, pr.status, COALESCE(co.nome, '—') AS autor
     FROM propostas pr
     JOIN clientes cl ON cl.id = pr.cliente_id
     JOIN planos p ON p.id = pr.plano_id
     LEFT JOIN colaboradores co ON co.id = pr.autor_id
     ${where}
     ORDER BY pr.id DESC`,
    q ? [like(q)] : []
  );
}

export function listContratos(q = "") {
  const where = q ? "WHERE cl.nome LIKE ?" : "";
  return consultar(
    `SELECT c.id, cl.nome AS cliente, p.nome AS plano, c.valor_mensal,
            c.valor_anual, c.data_assinatura, c.status
     FROM contratos c
     JOIN clientes cl ON cl.id = c.cliente_id
     JOIN planos p ON p.id = c.plano_id
     ${where}
     ORDER BY c.id DESC`,
    q ? [like(q)] : []
  );
}

export function listFaturas(q = "") {
  const where = q ? "WHERE cl.nome LIKE ?" : "";
  return consultar(
    `SELECT f.id, cl.nome AS cliente, f.competencia, f.valor, f.vencimento, f.status
     FROM faturas f
     JOIN contratos c ON c.id = f.contrato_id
     JOIN clientes cl ON cl.id = c.cliente_id
     ${where}
     ORDER BY f.vencimento DESC, f.id DESC`,
    q ? [like(q)] : []
  );
}

/* ---- listas de apoio (para os formulários) ---- */
export type Opcao = { id: number; nome: string };

export function getSegmentos() {
  return consultar<Opcao>("SELECT id, nome FROM segmentos WHERE ativo = 1 ORDER BY nome");
}

export function getColaboradores() {
  return consultar<Opcao>("SELECT id, nome FROM colaboradores WHERE ativo = 1 ORDER BY nome");
}

export function getPlanos() {
  return consultar<{ id: number; nome: string; preco_mensal: number }>(
    "SELECT id, nome, preco_mensal FROM planos WHERE ativo = 1 ORDER BY preco_mensal"
  );
}

export function getClientesSimple() {
  return consultar<Opcao>("SELECT id, nome FROM clientes ORDER BY nome");
}
