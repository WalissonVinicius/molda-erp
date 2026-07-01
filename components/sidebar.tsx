"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Users,
  FileText,
  ScrollText,
  Receipt,
  BarChart3,
  BookText,
  Code2,
} from "lucide-react";
import { cn } from "@/components/ui";

const NAV = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/propostas", label: "Propostas", icon: FileText },
  { href: "/contratos", label: "Contratos", icon: ScrollText },
  { href: "/faturas", label: "Faturas", icon: Receipt },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

function Marca() {
  return (
    <div className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/molda-logo.png" alt="Molda" className="h-7 w-auto" />
      <span className="rounded-md border border-border px-1.5 py-[3px] font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
        ERP
      </span>
    </div>
  );
}

export function Sidebar() {
  const path = usePathname();
  const isActive = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <>
      {/* Desktop */}
      <aside className="glass fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border lg:flex">
        <div className="flex h-16 items-center px-5">
          <Marca />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent-soft text-foreground"
                    : "text-muted hover:bg-elevated hover:text-foreground"
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 1.9} />
                {label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 px-3 pb-1">
          <Link
            href="/api-docs"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive("/api-docs")
                ? "bg-accent-soft text-foreground"
                : "text-muted hover:bg-elevated hover:text-foreground"
            )}
          >
            <Code2 className="h-[18px] w-[18px]" />
            API
          </Link>
          <a
            href="/documentacao.pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-foreground"
          >
            <BookText className="h-[18px] w-[18px]" />
            Documentação
          </a>
        </div>
        <div className="border-t border-border px-5 py-4 text-[11px] text-muted">
          <div className="font-mono uppercase tracking-widest">Sinop · MT</div>
          <div>Marketing &amp; tecnologia</div>
        </div>
      </aside>

      {/* Mobile */}
      <header className="glass fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-4 border-b border-border px-4 lg:hidden">
        <Marca />
        <nav className="-mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                  active ? "bg-accent-soft text-foreground" : "text-muted"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
