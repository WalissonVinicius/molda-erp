# Guia de entrega — ERP Molda

Passo a passo para publicar e entregar. **Sem banco externo:** o SQLite vai embutido no app e é copiado para a área gravável (`/tmp`) na Vercel — não precisa de Turso nem de variáveis de ambiente.

## 1. GitHub (código)

Dentro da pasta `molda-erp/`:

```bash
git init
git add .
git commit -m "ERP Molda — banco SQLite, painel e relatórios"
```

Crie um repositório novo no GitHub (ex.: `molda-erp`, vazio, sem README) e suba:

```bash
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/molda-erp.git
git push -u origin main
```

## 2. Vercel (aplicação)

1. Acesse vercel.com (dá pra logar com o GitHub) → **Add New → Project**.
2. Importe o repositório `molda-erp`.
3. **Deploy** (não precisa configurar nada — nem variáveis de ambiente).
4. Ao final, a Vercel te dá a **URL pública**.

> Como o banco vem embutido, os relatórios e o painel funcionam de imediato. Cadastros feitos no ar (novo lead, baixa de fatura, etc.) valem durante a sessão e voltam ao estado inicial do seed nos "cold starts" — ideal para uma demonstração consistente.

## 3. Entrega

Envie no formulário (https://forms.gle/96jaEd1sJrELog766):

- **Link do GitHub:** o repositório
- **Link da Vercel:** a URL pública do app

---

## (Opcional) Persistência real com Turso

Se um dia quiser que os cadastros persistam de verdade (uso contínuo, não só demonstração):

1. Crie um banco no [Turso](https://turso.tech) e aplique `db/schema.sql` e `db/seed.sql`.
2. Na Vercel, defina `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`.

O app detecta essas variáveis automaticamente e passa a usar o Turso no lugar do banco embutido — sem mudar código.
