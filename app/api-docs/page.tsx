import { PageHeader, Card } from "@/components/ui";
import { RELATORIOS } from "@/lib/reports";

export const dynamic = "force-dynamic";

const BASE = "https://erp.walisson.dev";

export default function ApiDocsPage() {
  return (
    <>
      <PageHeader
        title="API"
        subtitle="API REST dos relatórios do ERP — resultado em JSON, CSV ou PDF."
      />

      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-success/15 px-2.5 py-1 font-mono text-xs font-semibold text-success">
              GET
            </span>
            <code className="font-mono text-sm">
              /api/relatorios/<span className="text-accent">{"{id}"}</span>
            </code>
          </div>
          <p className="mt-3 text-sm text-muted">
            Executa o SQL do relatório escolhido e devolve o resultado no formato pedido.
          </p>

          <h3 className="mb-2 mt-6 text-sm font-semibold">Parâmetros</h3>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5 font-mono text-accent">id</td>
                  <td className="px-4 py-2.5 text-muted">path · obrigatório</td>
                  <td className="px-4 py-2.5">funil · mrr · inadimplencia · extrato · ltv</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono text-accent">format</td>
                  <td className="px-4 py-2.5 text-muted">query · opcional</td>
                  <td className="px-4 py-2.5">json (padrão) · csv · pdf</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold">Testar ao vivo</h3>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-4 py-2.5 font-medium">Relatório</th>
                  <th className="px-4 py-2.5 font-medium">id</th>
                  <th className="px-4 py-2.5 text-right font-medium">Formatos</th>
                </tr>
              </thead>
              <tbody>
                {RELATORIOS.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-elevated/40">
                    <td className="px-4 py-2.5">{r.titulo}</td>
                    <td className="px-4 py-2.5 font-mono text-accent">{r.id}</td>
                    <td className="space-x-3 px-4 py-2.5 text-right font-mono text-xs">
                      <a className="text-muted hover:text-accent" href={`/api/relatorios/${r.id}`} target="_blank" rel="noreferrer">JSON</a>
                      <a className="text-muted hover:text-accent" href={`/api/relatorios/${r.id}?format=csv`}>CSV</a>
                      <a className="text-muted hover:text-accent" href={`/api/relatorios/${r.id}?format=pdf`}>PDF</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold">Exemplo de resposta (JSON)</h3>
          <pre className="overflow-x-auto rounded-lg border border-border bg-elevated/60 p-4 font-mono text-xs leading-relaxed text-foreground/90">
{`GET ${BASE}/api/relatorios/mrr

{
  "relatorio": "MRR — receita recorrente por plano",
  "colunas": ["plano", "contratos_ativos", "mrr", "arr_projetado"],
  "linhas": [
    { "plano": "Grow", "contratos_ativos": 2, "mrr": 8100, "arr_projetado": 97200 }
  ]
}`}
          </pre>
          <a
            href="/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs text-accent hover:underline"
          >
            Ver especificação OpenAPI (JSON) →
          </a>
        </Card>
      </div>
    </>
  );
}
