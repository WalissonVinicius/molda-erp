"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type Resultado = { ok?: boolean; error?: string };

function revalidar(paths: string[] = ["/dashboard"]) {
  for (const p of paths) revalidatePath(p);
}

const texto = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return v == null || v === "" ? null : String(v);
};
const opcional = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return v ? Number(v) : null;
};
const msg = (e: unknown) => (e instanceof Error ? e.message : "Erro ao salvar.");

async function pisoDoPlano(planoId: number) {
  const rs = await db.execute({
    sql: "SELECT preco_mensal FROM planos WHERE id = ?",
    args: [planoId],
  });
  return Number(rs.rows[0]?.[0] ?? 0);
}

/* ===================== Ações de fluxo (botão, sem retorno) ===================== */

export async function aceitarProposta(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.execute({
    sql: "UPDATE propostas SET status = 'ACEITA' WHERE id = ? AND status <> 'ACEITA'",
    args: [id],
  });
  revalidar(["/propostas", "/contratos", "/faturas", "/dashboard"]);
}

export async function registrarPagamento(formData: FormData) {
  const faturaId = Number(formData.get("faturaId"));
  await db.execute({
    sql: `INSERT INTO pagamentos (fatura_id, valor, metodo)
          SELECT id, valor, 'PIX' FROM faturas
          WHERE id = ? AND status IN ('ABERTA', 'ATRASADA')`,
    args: [faturaId],
  });
  revalidar(["/faturas", "/dashboard"]);
}

export async function cancelarContrato(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.execute({
    sql: "UPDATE contratos SET status = 'CANCELADO' WHERE id = ?",
    args: [id],
  });
  revalidar(["/contratos", "/faturas", "/dashboard"]);
}

export async function converterLead(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.execute({
    sql: "UPDATE leads SET status = 'CONVERTIDO' WHERE id = ? AND status <> 'CONVERTIDO'",
    args: [id],
  });
  revalidar(["/leads", "/dashboard"]);
}

export async function enviarProposta(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.execute({
    sql: "UPDATE propostas SET status = 'ENVIADA' WHERE id = ? AND status = 'RASCUNHO'",
    args: [id],
  });
  revalidar(["/propostas"]);
}

/* ===================== Excluir ===================== */

export async function excluirLead(formData: FormData) {
  await db.execute({ sql: "DELETE FROM leads WHERE id = ?", args: [Number(formData.get("id"))] });
  revalidar(["/leads", "/dashboard"]);
}
export async function excluirCliente(formData: FormData) {
  await db.execute({ sql: "DELETE FROM clientes WHERE id = ?", args: [Number(formData.get("id"))] });
  revalidar(["/clientes", "/dashboard"]);
}
export async function excluirProposta(formData: FormData) {
  await db.execute({ sql: "DELETE FROM propostas WHERE id = ?", args: [Number(formData.get("id"))] });
  revalidar(["/propostas", "/dashboard"]);
}

/* ===================== Criar / Editar (formulários, com retorno) ===================== */

export async function criarLead(fd: FormData): Promise<Resultado> {
  const nome = String(fd.get("nome") ?? "").trim();
  if (!nome) return { error: "Informe o nome do lead." };
  const segmento_id = Number(fd.get("segmento_id"));
  if (!segmento_id) return { error: "Selecione o segmento." };
  try {
    await db.execute({
      sql: `INSERT INTO leads (nome, segmento_id, responsavel_id, telefone, score_feiura, temperatura, tier, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        nome,
        segmento_id,
        opcional(fd, "responsavel_id"),
        texto(fd, "telefone"),
        Number(fd.get("score") || 0),
        texto(fd, "temperatura") ?? "FRIO",
        Number(fd.get("tier") || 3),
        texto(fd, "status") ?? "NOVO",
      ],
    });
    revalidar(["/leads", "/dashboard"]);
    return { ok: true };
  } catch (e) {
    return { error: msg(e) };
  }
}

export async function editarLead(fd: FormData): Promise<Resultado> {
  const id = Number(fd.get("id"));
  const nome = String(fd.get("nome") ?? "").trim();
  if (!id || !nome) return { error: "Dados inválidos." };
  try {
    await db.execute({
      sql: `UPDATE leads SET nome = ?, segmento_id = ?, responsavel_id = ?, telefone = ?,
            score_feiura = ?, temperatura = ?, tier = ?, status = ? WHERE id = ?`,
      args: [
        nome,
        Number(fd.get("segmento_id")),
        opcional(fd, "responsavel_id"),
        texto(fd, "telefone"),
        Number(fd.get("score") || 0),
        texto(fd, "temperatura") ?? "FRIO",
        Number(fd.get("tier") || 3),
        texto(fd, "status") ?? "NOVO",
        id,
      ],
    });
    revalidar(["/leads", "/dashboard"]);
    return { ok: true };
  } catch (e) {
    return { error: msg(e) };
  }
}

export async function criarCliente(fd: FormData): Promise<Resultado> {
  const nome = String(fd.get("nome") ?? "").trim();
  if (!nome) return { error: "Informe o nome do cliente." };
  const segmento_id = Number(fd.get("segmento_id"));
  if (!segmento_id) return { error: "Selecione o segmento." };
  try {
    await db.execute({
      sql: `INSERT INTO clientes (nome, segmento_id, cnpj, email, telefone, cidade, decisor, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        nome,
        segmento_id,
        texto(fd, "cnpj"),
        texto(fd, "email"),
        texto(fd, "telefone"),
        texto(fd, "cidade") ?? "Sinop",
        texto(fd, "decisor"),
        texto(fd, "status") ?? "PROSPECCAO",
      ],
    });
    revalidar(["/clientes", "/dashboard"]);
    return { ok: true };
  } catch (e) {
    return { error: /UNIQUE/i.test(msg(e)) ? "CNPJ ou e-mail já cadastrado." : msg(e) };
  }
}

export async function editarCliente(fd: FormData): Promise<Resultado> {
  const id = Number(fd.get("id"));
  const nome = String(fd.get("nome") ?? "").trim();
  if (!id || !nome) return { error: "Dados inválidos." };
  try {
    await db.execute({
      sql: `UPDATE clientes SET nome = ?, segmento_id = ?, cnpj = ?, email = ?,
            telefone = ?, cidade = ?, decisor = ?, status = ? WHERE id = ?`,
      args: [
        nome,
        Number(fd.get("segmento_id")),
        texto(fd, "cnpj"),
        texto(fd, "email"),
        texto(fd, "telefone"),
        texto(fd, "cidade") ?? "Sinop",
        texto(fd, "decisor"),
        texto(fd, "status") ?? "PROSPECCAO",
        id,
      ],
    });
    revalidar(["/clientes", "/dashboard"]);
    return { ok: true };
  } catch (e) {
    return { error: /UNIQUE/i.test(msg(e)) ? "CNPJ ou e-mail já cadastrado." : msg(e) };
  }
}

export async function criarProposta(fd: FormData): Promise<Resultado> {
  const cliente_id = Number(fd.get("cliente_id"));
  const plano_id = Number(fd.get("plano_id"));
  const valor = Number(fd.get("valor") || 0);
  if (!cliente_id || !plano_id) return { error: "Selecione cliente e plano." };
  if (!valor) return { error: "Informe o valor mensal." };
  try {
    await db.execute({
      sql: `INSERT INTO propostas (cliente_id, plano_id, autor_id, valor, status)
            VALUES (?, ?, ?, ?, ?)`,
      args: [cliente_id, plano_id, opcional(fd, "autor_id"), valor, texto(fd, "status") ?? "RASCUNHO"],
    });
    revalidar(["/propostas", "/dashboard"]);
    return { ok: true };
  } catch (e) {
    return {
      error: /piso|minimo|mínimo/i.test(msg(e))
        ? "O valor está abaixo do preço mínimo do plano escolhido."
        : msg(e),
    };
  }
}

export async function editarProposta(fd: FormData): Promise<Resultado> {
  const id = Number(fd.get("id"));
  const cliente_id = Number(fd.get("cliente_id"));
  const plano_id = Number(fd.get("plano_id"));
  const valor = Number(fd.get("valor") || 0);
  if (!id || !cliente_id || !plano_id) return { error: "Dados inválidos." };
  if (valor < (await pisoDoPlano(plano_id))) {
    return { error: "O valor está abaixo do preço mínimo do plano escolhido." };
  }
  try {
    await db.execute({
      sql: `UPDATE propostas SET cliente_id = ?, plano_id = ?, autor_id = ?, valor = ?, status = ? WHERE id = ?`,
      args: [cliente_id, plano_id, opcional(fd, "autor_id"), valor, texto(fd, "status") ?? "RASCUNHO", id],
    });
    revalidar(["/propostas", "/dashboard"]);
    return { ok: true };
  } catch (e) {
    return { error: msg(e) };
  }
}
