import type { ReactNode } from "react";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ---- formatadores ---- */
export const brl = (n: number | bigint) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(n));

export const num = (n: number | bigint) =>
  new Intl.NumberFormat("pt-BR").format(Number(n));

export const prettify = (s: string) =>
  s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

/* ---- containers (vidro embaçado) ---- */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-surface/55 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "warning";
}) {
  return (
    <Card className="transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between">
        <div className="font-mono text-[11px] uppercase tracking-widest text-muted">{label}</div>
        {icon && <span className="text-muted/60">{icon}</span>}
      </div>
      <div
        className={cn(
          "mt-2 text-2xl font-semibold tracking-tight tnum sm:text-3xl lg:text-4xl",
          tone === "warning" && "text-warning"
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </Card>
  );
}

/* ---- badge de status ---- */
const BADGE: Record<string, string> = {
  ATIVO: "text-success bg-success/10",
  PAGA: "text-success bg-success/10",
  ACEITA: "text-success bg-success/10",
  CONCLUIDO: "text-success bg-success/10",
  FEITO: "text-success bg-success/10",
  CONVERTIDO: "text-success bg-success/10",
  ABERTA: "text-warning bg-warning/10",
  ENVIADA: "text-warning bg-warning/10",
  EM_CONTATO: "text-warning bg-warning/10",
  EM_ANDAMENTO: "text-warning bg-warning/10",
  FAZENDO: "text-warning bg-warning/10",
  PROSPECCAO: "text-warning bg-warning/10",
  ATRASADA: "text-danger bg-danger/10",
  CANCELADA: "text-danger bg-danger/10",
  CANCELADO: "text-danger bg-danger/10",
  RECUSADA: "text-danger bg-danger/10",
  PERDIDO: "text-danger bg-danger/10",
};

export function Badge({ children }: { children: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        BADGE[children] ?? "text-muted bg-elevated"
      )}
    >
      {children.replace(/_/g, " ")}
    </span>
  );
}

/* ---- gráfico de barras horizontais ---- */
export function BarList({
  data,
  format = num,
}: {
  data: { label: string; value: number }[];
  format?: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-28 shrink-0 truncate text-sm text-muted">{d.label}</div>
          <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-elevated">
            <div
              className="absolute inset-y-0 left-0 rounded-md"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundImage: "linear-gradient(90deg,#5B58F6,#9B8FFF)",
              }}
            />
          </div>
          <div className="w-24 shrink-0 text-right font-mono text-sm tnum">
            {format(d.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- gráfico de área (SVG, sem dependências) ---- */
export function AreaChart({
  points,
}: {
  points: { label: string; value: number }[];
}) {
  const w = 640;
  const h = 180;
  const pad = 10;
  const max = Math.max(...points.map((p) => p.value), 1);
  const stepX = (w - pad * 2) / Math.max(points.length - 1, 1);
  const coords = points.map(
    (p, i) =>
      [pad + i * stepX, h - pad - (p.value / max) * (h - pad * 2)] as const
  );
  if (coords.length === 0) return null;
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c[0]},${c[1]}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0]},${h - pad} L${coords[0][0]},${h - pad} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B58F6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5B58F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#grad-area)" />
        <path d={line} fill="none" stroke="#7B6CF6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {coords.map((c, i) => (
          <circle key={i} cx={c[0]} cy={c[1]} r="3" fill="#C4BBFF" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted">
        {points.map((p) => (
          <span key={p.label}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}

/* ---- tabela ---- */
export type Coluna = {
  key: string;
  label: string;
  align?: "right";
  mono?: boolean;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
};

export function DataTable({
  columns,
  rows,
  flush,
}: {
  columns: Coluna[];
  rows: Record<string, unknown>[];
  flush?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto",
        !flush && "rounded-2xl border border-border bg-surface/70 backdrop-blur-xl"
      )}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left font-mono text-[11px] uppercase tracking-wider text-muted">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn("px-4 py-3 font-medium", c.align === "right" && "text-right")}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0 hover:bg-elevated/40">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3",
                    c.align === "right" && "text-right",
                    c.mono && "font-mono tnum"
                  )}
                >
                  {c.render ? c.render(r[c.key], r) : String(r[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-muted">
                Nenhum registro encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
