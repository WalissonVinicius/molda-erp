import { createClient, type Client } from "@libsql/client";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

// Resolve a URL do banco:
// 1) Turso (se as variáveis existirem) — para uso em produção com persistência real;
// 2) Vercel sem Turso — o filesystem é read-only, então copiamos o banco embutido
//    (db/molda.db) para /tmp (gravável) na primeira vez;
// 3) Desenvolvimento local — usa o arquivo db/molda.db direto.
function resolveUrl(): string {
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL;

  if (process.env.VERCEL) {
    const destino = "/tmp/molda.db";
    if (!existsSync(destino)) {
      const origem = path.join(process.cwd(), "db", "molda.db");
      if (existsSync(origem)) copyFileSync(origem, destino);
    }
    return "file:" + destino;
  }

  return "file:db/molda.db";
}

const globalForDb = globalThis as unknown as { _db?: Client };

function criarCliente(): Client {
  return createClient({ url: resolveUrl(), authToken: process.env.TURSO_AUTH_TOKEN });
}

export const db = globalForDb._db ?? criarCliente();
if (process.env.NODE_ENV !== "production") globalForDb._db = db;

// Helper: executa um SELECT e devolve as linhas como objetos simples.
export async function consultar<T = Record<string, unknown>>(
  sql: string,
  args: (string | number | null)[] = []
): Promise<T[]> {
  const rs = await db.execute({ sql, args });
  return rs.rows.map(
    (row) => Object.fromEntries(rs.columns.map((c, i) => [c, row[i]])) as T
  );
}
