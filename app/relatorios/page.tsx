import { PageHeader, Card, DataTable, prettify, type Coluna } from "@/components/ui";
import { RELATORIOS, lerSql } from "@/lib/reports";
import { formatCell, isColunaNumerica } from "@/lib/format";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function rodar(arquivo: string) {
  const sql = lerSql(arquivo);
  const rs = await db.execute(sql);
  const columns: Coluna[] = rs.columns.map((c) => ({
    key: c,
    label: prettify(c),
    align: isColunaNumerica(c) ? "right" : undefined,
    mono: isColunaNumerica(c) || /vencimento|data|competencia/i.test(c),
    render: (v) => formatCell(c, v),
  }));
  const rows = rs.rows.map(
    (row) => Object.fromEntries(rs.columns.map((c, i) => [c, row[i]])) as Record<string, unknown>
  );
  return { sql, columns, rows };
}

const linkBtn =
  "inline-flex items-center rounded-lg border border-border px-2.5 py-1 text-xs text-foreground hover:bg-elevated";

export default async function RelatoriosPage() {
  const dados = await Promise.all(
    RELATORIOS.map(async (meta) => ({ meta, ...(await rodar(meta.arquivo)) }))
  );

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle="5 relatórios de gestão em SQL, executados ao vivo — exporte em PDF, CSV ou via API."
      />

      <div className="space-y-8">
        {dados.map(({ meta, sql, columns, rows }, i) => (
          <Card key={meta.id} className="rise">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">
                <span className="text-muted">{String(i + 1).padStart(2, "0")}.</span> {meta.titulo}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {meta.comandos.map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[11px] text-accent"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <p className="mb-3 text-sm text-muted">{meta.descricao}</p>

            <div className="mb-4 flex flex-wrap gap-2">
              <a href={`/api/relatorios/${meta.id}?format=pdf`} className={linkBtn}>
                Exportar PDF
              </a>
              <a href={`/api/relatorios/${meta.id}?format=csv`} className={linkBtn}>
                Baixar CSV
              </a>
              <a href={`/api/relatorios/${meta.id}`} target="_blank" rel="noreferrer" className={linkBtn}>
                JSON (API)
              </a>
            </div>

            <pre className="mb-4 overflow-x-auto rounded-lg border border-border bg-elevated/60 p-4 font-mono text-xs leading-relaxed text-foreground/90">
              {sql}
            </pre>

            <DataTable columns={columns} rows={rows} />
          </Card>
        ))}
      </div>
    </>
  );
}
