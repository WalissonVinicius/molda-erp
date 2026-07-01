import { readFileSync } from 'node:fs'
import path from 'node:path'

export type Relatorio = {
  id: string
  titulo: string
  descricao: string
  arquivo: string
  comandos: string[]
}

// Os 5 relatórios de gestão. O SQL canônico fica em db/reports/*.sql.
export const RELATORIOS: Relatorio[] = [
  {
    id: 'funil',
    titulo: 'Funil de prospecção por segmento',
    descricao: 'Leads por nicho, quantos estão quentes e o score médio de oportunidade.',
    arquivo: '01_funil_prospeccao.sql',
    comandos: ['JOIN', 'WHERE', 'AND', 'COUNT', 'AVG'],
  },
  {
    id: 'mrr',
    titulo: 'MRR — receita recorrente por plano',
    descricao: 'Soma das mensalidades dos contratos ativos e projeção anual (ARR).',
    arquivo: '02_mrr_por_plano.sql',
    comandos: ['JOIN', 'WHERE', 'SUM', 'COUNT'],
  },
  {
    id: 'inadimplencia',
    titulo: 'Inadimplência',
    descricao: 'Clientes com faturas vencidas em aberto: quantidade e total devido.',
    arquivo: '03_inadimplencia.sql',
    comandos: ['JOIN', 'WHERE', 'AND', 'OR', 'COUNT', 'SUM'],
  },
  {
    id: 'extrato',
    titulo: 'Extrato de caixa (realizado + previsto)',
    descricao: 'Une pagamentos recebidos e faturas previstas num único extrato.',
    arquivo: '04_extrato_caixa.sql',
    comandos: ['UNION ALL', 'JOIN', 'WHERE'],
  },
  {
    id: 'ltv',
    titulo: 'Ranking de clientes por LTV',
    descricao: 'Valor total já pago por cliente ativo, com número de contratos.',
    arquivo: '05_ltv_clientes.sql',
    comandos: ['JOIN', 'LEFT JOIN', 'SUM', 'COUNT'],
  },
]

export function relatorioPorId(id: string): Relatorio | undefined {
  return RELATORIOS.find((r) => r.id === id)
}

export function lerSql(arquivo: string): string {
  return readFileSync(path.join(process.cwd(), 'db', 'reports', arquivo), 'utf8').trim()
}
