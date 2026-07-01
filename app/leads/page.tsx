import { PageHeader, DataTable, Badge, cn, type Coluna } from "@/components/ui";
import { listLeads, getSegmentos, getColaboradores } from "@/lib/entities";
import { NovoLead, LinhaLead } from "@/components/forms";
import { Busca } from "@/components/busca";

export const dynamic = "force-dynamic";

const tempCor: Record<string, string> = {
  SUPER_QUENTE: "text-danger",
  QUENTE: "text-warning",
  MORNO: "text-foreground",
  FRIO: "text-muted",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [rows, segmentos, colaboradores] = await Promise.all([
    listLeads(q),
    getSegmentos(),
    getColaboradores(),
  ]);

  const columns: Coluna[] = [
    { key: "nome", label: "Lead" },
    { key: "segmento", label: "Segmento" },
    {
      key: "temperatura",
      label: "Temperatura",
      render: (v) => (
        <span className={cn("font-medium", tempCor[String(v)] ?? "text-muted")}>
          {String(v).replace(/_/g, " ")}
        </span>
      ),
    },
    { key: "score_feiura", label: "Score", align: "right", mono: true },
    { key: "responsavel", label: "Responsável" },
    { key: "status", label: "Status", render: (v) => <Badge>{String(v)}</Badge> },
    {
      key: "acoes",
      label: "",
      align: "right",
      render: (_v, row) => (
        <LinhaLead registro={row} segmentos={segmentos} colaboradores={colaboradores} />
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Leads" subtitle="Prospecção ativa em Sinop e região.">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Busca placeholder="Buscar lead…" />
          <NovoLead segmentos={segmentos} colaboradores={colaboradores} />
        </div>
      </PageHeader>
      <DataTable columns={columns} rows={rows} />
    </>
  );
}
