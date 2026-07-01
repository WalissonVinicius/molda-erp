import Link from "next/link";
import { notFound } from "next/navigation";
import { relatorioPorId, lerSql } from "@/lib/reports";
import { db } from "@/lib/db";
import { prettify } from "@/components/ui";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";

export default async function ImprimirRelatorio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = relatorioPorId(id);
  if (!meta) notFound();

  const rs = await db.execute(lerSql(meta.arquivo));
  const cols = rs.columns;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex items-center justify-between gap-3">
        <Link href="/relatorios" className="text-sm text-muted hover:text-foreground">
          ← Voltar
        </Link>
        <div className="flex gap-2">
          <a
            href={`/api/relatorios/${id}?format=csv`}
            className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-elevated"
          >
            Baixar CSV
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-10 text-zinc-900 shadow-2xl print:rounded-none print:p-0 print:shadow-none">
        <div className="mb-1 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
          Molda ERP · Relatório
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{meta.titulo}</h1>
        <p className="mt-1 text-sm text-zinc-500">{meta.descricao}</p>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr>
              {cols.map((c) => (
                <th
                  key={c}
                  className="border-b-2 border-zinc-300 px-2 py-2 text-left font-semibold"
                >
                  {prettify(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rs.rows.map((r, i) => (
              <tr key={i}>
                {cols.map((c, ci) => (
                  <td key={c} className="border-b border-zinc-200 px-2 py-1.5">
                    {String(r[ci] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 text-xs text-zinc-400">
          Gerado pelo ERP Molda — {new Date().toLocaleDateString("pt-BR")}
        </div>
      </div>
    </div>
  );
}
