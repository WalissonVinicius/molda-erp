import { PageHeader, DataTable, Badge, brl, type Coluna } from "@/components/ui";
import {
  listPropostas,
  getClientesSimple,
  getPlanos,
  getColaboradores,
} from "@/lib/entities";
import { NovaProposta, LinhaProposta } from "@/components/forms";
import { Busca } from "@/components/busca";

export const dynamic = "force-dynamic";

export default async function PropostasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [rows, clientes, planos, colaboradores] = await Promise.all([
    listPropostas(q),
    getClientesSimple(),
    getPlanos(),
    getColaboradores(),
  ]);

  const columns: Coluna[] = [
    { key: "id", label: "#", mono: true },
    { key: "cliente", label: "Cliente" },
    { key: "plano", label: "Plano" },
    { key: "autor", label: "Autor" },
    {
      key: "valor",
      label: "Valor/mês",
      align: "right",
      mono: true,
      render: (v) => brl(Number(v)),
    },
    { key: "status", label: "Status", render: (v) => <Badge>{String(v)}</Badge> },
    {
      key: "acoes",
      label: "",
      align: "right",
      render: (_v, row) => (
        <LinhaProposta
          registro={row}
          clientes={clientes}
          planos={planos}
          colaboradores={colaboradores}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Propostas"
        subtitle="Aceitar uma proposta gera o contrato e a 1ª fatura automaticamente (triggers 1 e 2)."
      >
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Busca placeholder="Buscar por cliente…" />
          <NovaProposta clientes={clientes} planos={planos} colaboradores={colaboradores} />
        </div>
      </PageHeader>
      <DataTable columns={columns} rows={rows} />
    </>
  );
}
