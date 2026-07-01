import { PageHeader, DataTable, Badge, brl, type Coluna } from "@/components/ui";
import { dataBR } from "@/lib/format";
import { listFaturas } from "@/lib/entities";
import { registrarPagamento } from "@/app/actions";
import { AcaoBotao } from "@/components/acao-botao";
import { Busca } from "@/components/busca";

export const dynamic = "force-dynamic";

export default async function FaturasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const rows = await listFaturas(q);

  const columns: Coluna[] = [
    { key: "id", label: "#", mono: true },
    { key: "cliente", label: "Cliente" },
    { key: "competencia", label: "Competência", mono: true },
    {
      key: "valor",
      label: "Valor",
      align: "right",
      mono: true,
      render: (v) => brl(Number(v)),
    },
    { key: "vencimento", label: "Vencimento", mono: true, render: (v) => dataBR(v) },
    { key: "status", label: "Status", render: (v) => <Badge>{String(v)}</Badge> },
    {
      key: "acao",
      label: "",
      align: "right",
      render: (_v, row) =>
        row.status === "ABERTA" || row.status === "ATRASADA" ? (
          <AcaoBotao action={registrarPagamento} name="faturaId" value={String(row.id)}>
            Registrar pagamento
          </AcaoBotao>
        ) : (
          <span className="text-xs text-muted">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Faturas"
        subtitle="Registrar o pagamento dá baixa na fatura automaticamente (trigger 3)."
      >
        <Busca placeholder="Buscar por cliente…" />
      </PageHeader>
      <DataTable columns={columns} rows={rows} />
    </>
  );
}
