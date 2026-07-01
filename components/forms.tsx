"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/components/ui";
import {
  criarLead,
  editarLead,
  excluirLead,
  converterLead,
  criarCliente,
  editarCliente,
  excluirCliente,
  criarProposta,
  editarProposta,
  excluirProposta,
  enviarProposta,
  aceitarProposta,
  type Resultado,
} from "@/app/actions";

type Opcao = { id: number; nome: string };
type Reg = Record<string, unknown>;
type Plano = { id: number; nome: string; preco_mensal: number };

const toOpts = (arr: Opcao[]) => arr.map((a) => ({ value: String(a.id), label: a.nome }));
const enumOpts = (vals: string[]) => vals.map((v) => ({ value: v, label: v.replace(/_/g, " ") }));
const dv = (v: unknown) => (v == null ? undefined : String(v));

/* ---------- primitivos ---------- */
function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass relative z-10 w-full max-w-md rounded-2xl border border-border p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1 text-muted hover:bg-elevated hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

function Select({
  label,
  name,
  options,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm outline-none focus:border-accent"
      >
        <option value="">Selecione…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Rodape({ pending, onCancel }: { pending: boolean; onCancel: () => void }) {
  return (
    <div className="mt-1 flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-elevated"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </div>
  );
}

function Gatilho({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
    >
      <Plus className="h-4 w-4" />
      {children}
    </button>
  );
}

function IconBtn({ onClick, title, children }: { onClick: () => void; title: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded-md p-1.5 text-muted hover:bg-elevated hover:text-foreground"
    >
      {children}
    </button>
  );
}

function FormBtn({
  action,
  id,
  children,
  variant = "ghost",
}: {
  action: (fd: FormData) => void | Promise<void>;
  id: number;
  children: ReactNode;
  variant?: "ghost" | "primary";
}) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          variant === "primary"
            ? "bg-accent text-white hover:bg-accent-hover"
            : "border border-border text-muted hover:bg-elevated hover:text-foreground"
        )}
      >
        {children}
      </button>
    </form>
  );
}

function ExcluirBtn({ action, id }: { action: (fd: FormData) => void | Promise<void>; id: number }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      title="Excluir"
      disabled={pending}
      onClick={() => {
        if (confirm("Excluir este registro? Esta ação não pode ser desfeita.")) {
          start(async () => {
            const fd = new FormData();
            fd.set("id", String(id));
            await action(fd);
          });
        }
      }}
      className="rounded-md p-1.5 text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function useModal(action: (fd: FormData) => Promise<Resultado>) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const submit = (fd: FormData) =>
    start(async () => {
      const r = await action(fd);
      if (r?.ok) {
        setOpen(false);
        setError(null);
      } else {
        setError(r?.error ?? "Erro ao salvar.");
      }
    });
  return { open, setOpen, pending, error, submit };
}

/* ---------- campos por entidade ---------- */
function CamposLead({ segmentos, colaboradores, r }: { segmentos: Opcao[]; colaboradores: Opcao[]; r?: Reg }) {
  return (
    <>
      <Field label="Nome" name="nome" required defaultValue={dv(r?.nome)} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Segmento" name="segmento_id" required options={toOpts(segmentos)} defaultValue={dv(r?.segmento_id)} />
        <Select label="Responsável" name="responsavel_id" options={toOpts(colaboradores)} defaultValue={dv(r?.responsavel_id)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefone" name="telefone" defaultValue={dv(r?.telefone)} />
        <Field label="Score (0–100)" name="score" type="number" defaultValue={dv(r?.score_feiura) ?? "0"} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Temperatura" name="temperatura" defaultValue={dv(r?.temperatura) ?? "FRIO"} options={enumOpts(["FRIO", "MORNO", "QUENTE", "SUPER_QUENTE"])} />
        <Select label="Tier" name="tier" defaultValue={dv(r?.tier) ?? "3"} options={enumOpts(["1", "2", "3"])} />
      </div>
      {r && <Select label="Situação" name="status" defaultValue={dv(r.status)} options={enumOpts(["NOVO", "EM_CONTATO", "CONVERTIDO", "PERDIDO"])} />}
    </>
  );
}

function CamposCliente({ segmentos, r }: { segmentos: Opcao[]; r?: Reg }) {
  return (
    <>
      <Field label="Nome" name="nome" required defaultValue={dv(r?.nome)} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Segmento" name="segmento_id" required options={toOpts(segmentos)} defaultValue={dv(r?.segmento_id)} />
        <Select label="Situação" name="status" defaultValue={dv(r?.status) ?? "PROSPECCAO"} options={enumOpts(["PROSPECCAO", "ATIVO", "INATIVO"])} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="CNPJ" name="cnpj" defaultValue={dv(r?.cnpj)} />
        <Field label="E-mail" name="email" type="email" defaultValue={dv(r?.email)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefone" name="telefone" defaultValue={dv(r?.telefone)} />
        <Field label="Cidade" name="cidade" defaultValue={dv(r?.cidade) ?? "Sinop"} />
      </div>
      <Field label="Decisor" name="decisor" defaultValue={r?.decisor === "—" ? "" : dv(r?.decisor)} />
    </>
  );
}

function CamposProposta({
  clientes,
  planos,
  colaboradores,
  r,
}: {
  clientes: Opcao[];
  planos: Plano[];
  colaboradores: Opcao[];
  r?: Reg;
}) {
  const pisos = planos.map((p) => `${p.nome} R$ ${p.preco_mensal.toLocaleString("pt-BR")}`).join(" · ");
  return (
    <>
      <Select label="Cliente" name="cliente_id" required options={toOpts(clientes)} defaultValue={dv(r?.cliente_id)} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Plano" name="plano_id" required options={planos.map((p) => ({ value: String(p.id), label: p.nome }))} defaultValue={dv(r?.plano_id)} />
        <Select label="Autor" name="autor_id" options={toOpts(colaboradores)} defaultValue={dv(r?.autor_id)} />
      </div>
      <Field label="Valor mensal (R$)" name="valor" type="number" required defaultValue={dv(r?.valor)} hint={`Mínimo por plano: ${pisos}`} />
      <Select label="Situação" name="status" defaultValue={dv(r?.status) ?? "RASCUNHO"} options={enumOpts(["RASCUNHO", "ENVIADA", "RECUSADA"])} />
    </>
  );
}

/* ---------- botões "Novo" (cabeçalho) ---------- */
export function NovoLead({ segmentos, colaboradores }: { segmentos: Opcao[]; colaboradores: Opcao[] }) {
  const m = useModal(criarLead);
  return (
    <>
      <Gatilho onClick={() => m.setOpen(true)}>Novo lead</Gatilho>
      <Dialog open={m.open} onClose={() => m.setOpen(false)} title="Novo lead">
        <form action={m.submit} className="space-y-3">
          <CamposLead segmentos={segmentos} colaboradores={colaboradores} />
          {m.error && <p className="text-sm text-danger">{m.error}</p>}
          <Rodape pending={m.pending} onCancel={() => m.setOpen(false)} />
        </form>
      </Dialog>
    </>
  );
}

export function NovoCliente({ segmentos }: { segmentos: Opcao[] }) {
  const m = useModal(criarCliente);
  return (
    <>
      <Gatilho onClick={() => m.setOpen(true)}>Novo cliente</Gatilho>
      <Dialog open={m.open} onClose={() => m.setOpen(false)} title="Novo cliente">
        <form action={m.submit} className="space-y-3">
          <CamposCliente segmentos={segmentos} />
          {m.error && <p className="text-sm text-danger">{m.error}</p>}
          <Rodape pending={m.pending} onCancel={() => m.setOpen(false)} />
        </form>
      </Dialog>
    </>
  );
}

export function NovaProposta({
  clientes,
  planos,
  colaboradores,
}: {
  clientes: Opcao[];
  planos: Plano[];
  colaboradores: Opcao[];
}) {
  const m = useModal(criarProposta);
  return (
    <>
      <Gatilho onClick={() => m.setOpen(true)}>Nova proposta</Gatilho>
      <Dialog open={m.open} onClose={() => m.setOpen(false)} title="Nova proposta">
        <form action={m.submit} className="space-y-3">
          <CamposProposta clientes={clientes} planos={planos} colaboradores={colaboradores} />
          {m.error && <p className="text-sm text-danger">{m.error}</p>}
          <Rodape pending={m.pending} onCancel={() => m.setOpen(false)} />
        </form>
      </Dialog>
    </>
  );
}

/* ---------- ações de linha (editar / excluir / fluxo) ---------- */
export function LinhaLead({
  registro,
  segmentos,
  colaboradores,
}: {
  registro: Reg;
  segmentos: Opcao[];
  colaboradores: Opcao[];
}) {
  const m = useModal(editarLead);
  const status = String(registro.status);
  return (
    <div className="flex items-center justify-end gap-1">
      {(status === "NOVO" || status === "EM_CONTATO") && (
        <FormBtn action={converterLead} id={Number(registro.id)}>
          Converter
        </FormBtn>
      )}
      <IconBtn title="Editar" onClick={() => m.setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </IconBtn>
      <ExcluirBtn action={excluirLead} id={Number(registro.id)} />
      <Dialog open={m.open} onClose={() => m.setOpen(false)} title="Editar lead">
        <form action={m.submit} className="space-y-3">
          <input type="hidden" name="id" value={String(registro.id)} />
          <CamposLead segmentos={segmentos} colaboradores={colaboradores} r={registro} />
          {m.error && <p className="text-sm text-danger">{m.error}</p>}
          <Rodape pending={m.pending} onCancel={() => m.setOpen(false)} />
        </form>
      </Dialog>
    </div>
  );
}

export function LinhaCliente({ registro, segmentos }: { registro: Reg; segmentos: Opcao[] }) {
  const m = useModal(editarCliente);
  return (
    <div className="flex items-center justify-end gap-1">
      <IconBtn title="Editar" onClick={() => m.setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </IconBtn>
      <ExcluirBtn action={excluirCliente} id={Number(registro.id)} />
      <Dialog open={m.open} onClose={() => m.setOpen(false)} title="Editar cliente">
        <form action={m.submit} className="space-y-3">
          <input type="hidden" name="id" value={String(registro.id)} />
          <CamposCliente segmentos={segmentos} r={registro} />
          {m.error && <p className="text-sm text-danger">{m.error}</p>}
          <Rodape pending={m.pending} onCancel={() => m.setOpen(false)} />
        </form>
      </Dialog>
    </div>
  );
}

export function LinhaProposta({
  registro,
  clientes,
  planos,
  colaboradores,
}: {
  registro: Reg;
  clientes: Opcao[];
  planos: Plano[];
  colaboradores: Opcao[];
}) {
  const m = useModal(editarProposta);
  const status = String(registro.status);
  return (
    <div className="flex items-center justify-end gap-1">
      {status === "RASCUNHO" && (
        <FormBtn action={enviarProposta} id={Number(registro.id)}>
          Enviar
        </FormBtn>
      )}
      {status === "ENVIADA" && (
        <FormBtn action={aceitarProposta} id={Number(registro.id)} variant="primary">
          Aceitar
        </FormBtn>
      )}
      {status !== "ACEITA" && (
        <IconBtn title="Editar" onClick={() => m.setOpen(true)}>
          <Pencil className="h-4 w-4" />
        </IconBtn>
      )}
      <ExcluirBtn action={excluirProposta} id={Number(registro.id)} />
      <Dialog open={m.open} onClose={() => m.setOpen(false)} title="Editar proposta">
        <form action={m.submit} className="space-y-3">
          <input type="hidden" name="id" value={String(registro.id)} />
          <CamposProposta clientes={clientes} planos={planos} colaboradores={colaboradores} r={registro} />
          {m.error && <p className="text-sm text-danger">{m.error}</p>}
          <Rodape pending={m.pending} onCancel={() => m.setOpen(false)} />
        </form>
      </Dialog>
    </div>
  );
}
