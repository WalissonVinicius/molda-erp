import { PageHeader, DataTable, Badge, type Coluna } from "@/components/ui";
import { listClientes, getSegmentos } from "@/lib/entities";
import { NovoCliente, LinhaCliente } from "@/components/forms";
import { Busca } from "@/components/busca";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [rows, segmentos] = await Promise.all([listClientes(q), getSegmentos()]);

  const columns: Coluna[] = [
    { key: "nome", label: "Cliente" },
    { key: "segmento", label: "Segmento" },
    {
      key: "cidade",
      label: "Cidade",
      render: (v, row) => `${String(v ?? "—")}/${String(row.uf ?? "")}`,
    },
    { key: "decisor", label: "Decisor" },
    { key: "contratos_ativos", label: "Contratos", align: "right", mono: true },
    { key: "status", label: "Status", render: (v) => <Badge>{String(v)}</Badge> },
    {
      key: "acoes",
      label: "",
      align: "right",
      render: (_v, row) => <LinhaCliente registro={row} segmentos={segmentos} />,
    },
  ];

  return (
    <>
      <PageHeader title="Clientes" subtitle="Carteira de clientes da agência por segmento.">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Busca placeholder="Buscar cliente…" />
          <NovoCliente segmentos={segmentos} />
        </div>
      </PageHeader>
      <DataTable columns={columns} rows={rows} />
    </>
  );
}
