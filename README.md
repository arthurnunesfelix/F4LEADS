# F4 LEADS — CRM de Gestão de Leads

CRM completo para gestão de leads: acompanhe clientes **pendentes**, que **compraram** e **recusados**, com dashboard em tempo real, funil kanban (drag-and-drop) e edição completa de leads.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **PostgreSQL** com **Drizzle ORM**
- **Tailwind CSS v4**, Framer Motion, dnd-kit, Lucide Icons

---

## Rodando localmente

```bash
# 1. Instale as dependências
npm install

# 2. Configure o banco (coppie .env.example para .env e ajuste a URL)
cp .env.example .env

# 3. Crie as tabelas no banco local
npx drizzle-kit push

# 4. (Opcional) Popule com leads de exemplo
psql $DATABASE_URL -f scripts/seed.sql

# 5. Rode o app
npm run dev
```

Acesse `http://localhost:3000`.

---

## Deploy na Vercel (passo a passo)

### 1. Suba o código para o GitHub

```bash
git init
git add .
git commit -m "F4 LEADS CRM"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/f4-leads.git
git push -u origin main
```

### 2. Crie o banco de dados PostgreSQL (grátis)

A Vercel não inclui banco de dados — o mais simples é o **Neon** (Postgres serverless gratuito):

**Opção A — Pela Vercel (recomendado):**
1. No painel do seu projeto na Vercel, vá em **Storage**
2. Clique em **Create Database** → escolha **Neon (Serverless Postgres)**
3. A variável `DATABASE_URL` é criada e conectada automaticamente

**Opção B — Direto no [neon.tech](https://neon.tech):**
1. Crie uma conta e um projeto (plano Free)
2. Copie a connection string **com `-pooler` no host** (otimizada para serverless), algo como:
   `postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/dbname?sslmode=require`

> Outros providers também funcionam: Supabase, Railway, Neon, RDS... basta a URL no formato `postgresql://`.

### 3. Importe na Vercel

1. Em [vercel.com/new](https://vercel.com/new), clique em **Import** no repositório
2. O framework Next.js é detectado automaticamente — não mude nada no build
3. Em **Environment Variables**, adicione (se usou a Opção B):

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | `postgresql://...?sslmode=require` |

4. Clique em **Deploy**

### 4. Pronto — as tabelas são criadas sozinhas

No primeiro boot, o app roda as **migrações automaticamente** (via `src/instrumentation.ts`), criando a tabela `leads` no banco de produção. Você não precisa executar nenhum comando manual.

Para acompanhar: **Vercel → seu projeto → Logs** e procure por `[db] Migrações verificadas/aplicadas com sucesso.`

---

## Alterando o banco no futuro

1. Edite `src/db/schema.ts`
2. Gere uma nova migração: `npx drizzle-kit generate --name descricao_da_mudanca`
3. Faça commit da pasta `drizzle/` e dê push — a Vercel aplica no próximo deploy

---

## Estrutura

```
├── drizzle/              # Migrações SQL (aplicadas no boot da Vercel)
├── scripts/seed.sql      # Leads de exemplo (opcional)
├── src/
│   ├── app/
│   │   ├── page.tsx      # Dashboard (Visão Geral)
│   │   ├── leads/        # Tabela de leads (busca, filtro, edição)
│   │   ├── kanban/       # Funil drag-and-drop
│   │   └── api/          # Rotas: /api/leads, /api/leads/[id], /api/stats
│   ├── components/       # UI (tabela, kanban, gráficos, modal...)
│   ├── db/               # Conexão, schema e migrador
│   ├── lib/              # Tipos e formatação (R$, datas pt-BR)
│   └── instrumentation.ts # Boot hook: migrações automáticas na Vercel
└── public/images/        # Logo F4 LEADS
```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | Connection string do PostgreSQL (com `-pooler` no Neon) |

> **Saúde da aplicação:** `GET /api/health` retorna `{ "ok": true }` quando o banco está conectado — útil para monitoramento (UptimeRobot, Better Stack etc.).
