// Formatação amigável das células dos relatórios (datas e dinheiro).
const MONEY = new Set(["mrr", "arr_projetado", "total_em_aberto", "valor", "ltv"]);

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);

export function formatCell(coluna: string, valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  const s = String(valor);
  const d = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (d) return `${d[3]}/${d[2]}/${d[1]}`; // 2026-05-12 -> 12/05/2026
  if (MONEY.has(coluna) && !isNaN(Number(s))) return brl(Number(s));
  return s;
}

export function isColunaNumerica(coluna: string): boolean {
  return MONEY.has(coluna) || /total|leads|quentes|score|faturas|contratos|projetado/i.test(coluna);
}
