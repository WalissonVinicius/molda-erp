import { PageHeader, Card, StatCard, BarList, AreaChart, DataTable, brl, num } from "@/components/ui";
import {
  getKpis,
  mrrPorPlano,
  receitaPorMes,
  funilPorSegmento,
  inadimplentes,
} from "@/lib/queries";
import { TrendingUp, CalendarClock, Users, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

const mesLabel = (m: string) => `${m.slice(5)}/${m.slice(2, 4)}`;

export default async function DashboardPage() {
  const [k, mrr, receita, funil, inad] = await Promise.all([
    getKpis(),
    mrrPorPlano(),
    receitaPorMes(),
    funilPorSegmento(),
    inadimplentes(),
  ]);

  return (
    <>
      <PageHeader
        title="Visão geral"
        subtitle="Painel de gestão da agência — prospecção, contratos e financeiro."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rise">
          <StatCard label="MRR" value={brl(k.mrr)} hint="receita recorrente mensal" icon={<TrendingUp className="h-4 w-4" />} />
        </div>
        <div className="rise" style={{ animationDelay: "60ms" }}>
          <StatCard label="ARR projetado" value={brl(k.mrr * 12)} hint="MRR × 12" icon={<CalendarClock className="h-4 w-4" />} />
        </div>
        <div className="rise" style={{ animationDelay: "120ms" }}>
          <StatCard label="Clientes ativos" value={num(k.clientes)} hint={`${num(k.contratos)} contratos`} icon={<Users className="h-4 w-4" />} />
        </div>
        <div className="rise" style={{ animationDelay: "180ms" }}>
          <StatCard label="Inadimplência" value={brl(k.inadimplencia)} hint="faturas vencidas em aberto" icon={<AlertTriangle className="h-4 w-4" />} tone="warning" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="rise lg:col-span-3">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">Receita recebida</h2>
            <span className="font-mono text-xs text-muted">por mês</span>
          </div>
          <AreaChart points={receita.map((r) => ({ label: mesLabel(r.mes), value: Number(r.valor) }))} />
        </Card>

        <Card className="rise lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">MRR por plano</h2>
            <span className="font-mono text-xs text-muted">ativos</span>
          </div>
          <BarList data={mrr.map((m) => ({ label: m.plano, value: Number(m.mrr) }))} format={brl} />
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted">Total</span>
            <span className="font-mono font-semibold tnum">{brl(k.mrr)}</span>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="rise lg:col-span-2">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">Funil por segmento</h2>
            <span className="font-mono text-xs text-muted">leads</span>
          </div>
          <BarList data={funil.map((f) => ({ label: f.segmento, value: Number(f.total) }))} />
        </Card>

        <Card className="rise lg:col-span-3">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">Inadimplência</h2>
            <span className="font-mono text-xs text-muted">vencidas em aberto</span>
          </div>
          <DataTable
            flush
            columns={[
              { key: "cliente", label: "Cliente" },
              { key: "faturas", label: "Faturas", align: "right", mono: true },
              {
                key: "total",
                label: "Total devido",
                align: "right",
                mono: true,
                render: (v) => brl(Number(v)),
              },
            ]}
            rows={inad as unknown as Record<string, unknown>[]}
          />
        </Card>
      </div>
    </>
  );
}
