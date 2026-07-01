import { relatorioPorId, lerSql } from "@/lib/reports";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meta = relatorioPorId(id);
  if (!meta) return new Response("Relatório não encontrado", { status: 404 });

  const rs = await db.execute(lerSql(meta.arquivo));
  const formato = new URL(req.url).searchParams.get("format");

  // PDF formatado, gerado no servidor e baixado direto
  if (formato === "pdf") {
    const { gerarRelatorioPdf } = await import("@/components/report-pdf");
    const cols = rs.columns;
    const rows = rs.rows.map((r) => cols.map((_, i) => r[i]));
    const buffer = await gerarRelatorioPdf({
      titulo: meta.titulo,
      descricao: meta.descricao,
      cols,
      rows,
    });
    const inline = new URL(req.url).searchParams.get("inline") === "1";
    return new Response(new Uint8Array(buffer), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": inline ? "inline" : `attachment; filename="relatorio-${id}.pdf"`,
      },
    });
  }

  // CSV (Excel BR)
  if (formato === "csv") {
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const linhas = [
      rs.columns.join(";"),
      ...rs.rows.map((r) => rs.columns.map((_, i) => esc(r[i])).join(";")),
    ];
    return new Response("﻿" + linhas.join("\r\n"), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="relatorio-${id}.csv"`,
      },
    });
  }

  // JSON (API)
  const linhas = rs.rows.map((r) =>
    Object.fromEntries(rs.columns.map((c, i) => [c, r[i]]))
  );
  return Response.json({ relatorio: meta.titulo, colunas: rs.columns, linhas });
}
