# ERP Molda

ERP de uma agência digital (a Molda, de Sinop/MT) construído sobre **SQLite**. Controla todo o ciclo do negócio: prospecção de leads, propostas, contratos de assinatura, faturas recorrentes, pagamentos e projetos. A interface roda em Next.js e os relatórios são executados em SQL puro.

Trabalho da disciplina de Banco de Dados (ADS — 3º semestre).

## Stack

- **Banco:** SQLite (libSQL / Turso em produção), acessado com `@libsql/client` via SQL puro
- **App:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS v4

## Rodando localmente

```bash
npm install
npm run db:build   # cria o banco local db/molda.db a partir de schema.sql + seed.sql
npm run dev        # http://localhost:3000
```

## Estrutura

```
db/
  schema.sql              # tabelas, tratamentos e triggers (SQLite puro)
  seed.sql                # dados de exemplo
  reports/                # os 5 relatórios de gestão, em SQL
app/                      # páginas do ERP (dashboard, leads, clientes, ...)
lib/                      # conexão com o banco e consultas
docs/
  documentacao.md         # documentação do banco
  documentacao.pdf        # versão final em PDF
scripts/
  build-db.mjs            # monta o banco local
  build-doc.mjs           # gera o PDF da documentação
```

## Banco de dados

O esquema (`db/schema.sql`) tem 14 tabelas em quatro módulos — prospecção, catálogo, comercial/financeiro e operação — com chaves estrangeiras, validações (`CHECK`), uma coluna gerada e 7 triggers que automatizam as regras de negócio (proposta aceita vira contrato, contrato gera fatura, pagamento quita fatura, etc.).

Os cinco relatórios em `db/reports/` cobrem `WHERE`, `AND`, `OR`, `JOIN`, `UNION ALL`, `COUNT` e `SUM`, e são exibidos na tela **Relatórios** com o SQL e o resultado ao vivo.

## Deploy (Turso + Vercel)

1. Criar um banco no [Turso](https://turso.tech) e aplicar `db/schema.sql` e `db/seed.sql`.
2. Importar o repositório na [Vercel](https://vercel.com).
3. Definir as variáveis `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` no projeto.
