import { PageHeader, DataTable, Badge, brl, type Coluna } from "@/components/ui";
import { listContratos } from "@/lib/entities";
import { cancelarContrato } from "@/app/actions";
import { AcaoBotao } from "@/components/acao-botao";
import { Busca } from "@/components/busca";

export const dynamic = "force-dynamic";

export default async function ContratosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const rows = await listContratos(q);

  const columns: Coluna[] = [
    { key: "id", label: "#", mono: true },
    { key: "cliente", label: "Cliente" },
    { key: "plano", label: "Plano" },
    {
      key: "valor_mensal",
      label: "Mensal",
      align: "right",
      mono: true,
      render: (v) => brl(Number(v)),
    },
    {
      key: "valor_anual",
      label: "Anual (gerado)",
      align: "right",
      mono: true,
      render: (v) => brl(Number(v)),
    },
    { key: "data_assinatura", label: "Assinatura", mono: true },
    { key: "status", label: "Status", render: (v) => <Badge>{String(v)}</Badge> },
    {
      key: "acao",
      label: "",
      align: "right",
      render: (_v, row) =>
        row.status === "ATIVO" ? (
          <AcaoBotao action={cancelarContrato} name="id" value={String(row.id)} variant="ghost">
            Cancelar
          </AcaoBotao>
        ) : (
          <span className="text-xs text-muted">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Contratos"
        subtitle="Assinaturas recorrentes. A coluna anual é calculada pelo banco; cancelar dispara o trigger 4."
      >
        <Busca placeholder="Buscar por cliente…" />
      </PageHeader>
      <DataTable columns={columns} rows={rows} />
    </>
  );
}
