# VETOR — Plataforma

Plataforma multi-tenant da consultoria VETOR. **Fase 0 + Fase 1 + Fase 2 implementadas**. O documento mestre do projeto é o `README-VETOR.md` na pasta pai.

## O que já existe

### Fase 0 + 1 — Core multi-tenant
- **Monólito modular** (Next.js 15 + TS): módulos em `modules/<nome>/`, compartilhado em `core/`, `app/` fino.
- **Proteção de fronteiras**: ESLint (`eslint-plugin-boundaries`) **falha o build** se um módulo importar de outro ou se `core/` importar de `modules/`/`app/`. CI em `.github/workflows/ci.yml` roda lint + typecheck + testes + build em todo push/PR.
- **Banco (Prisma 7 + Postgres)**: tabelas core + `relatorios_gerados` (Fase 2), migrações em `prisma/migrations/`, seed com os dois pilotos.
- **Isolamento por tenant (ADR-003)**: `core/db/client.ts` exporta `tenantDb(tenantId)` — extensão do Prisma que injeta `tenant_id` automaticamente.
- **Auth (Clerk Organizations)**: middleware, webhook, papéis `SUPER_ADMIN | OWNER | MEMBER`.
- **Registry de módulos** + AppShell + rota genérica `tools/[slug]/[[...path]]` + admin de tenants.
- **core/ai** + **core/events**.

### Fase 2 — Módulo Relatórios
- **UI real** em `/tools/relatorios`: lista por mês, formulário de números + CSV, detalhe com preview e download.
- **Tabela** `relatorios_gerados` (tenant_id, mes, status, dados_entrada, conteudo_html, arquivo_url…).
- **Server action** `solicitarGeracaoRelatorio` → cria linha `processando` → enfileira job.
- **Job** `gerar-relatorio`: dossiê + dados → prompt versionado (`prompts/relatorio-mensal.v1.md`) → Claude (`core/ai`) → HTML → evento `relatorio.gerado` + `activity_log`.
- **Trigger.dev** opcional: com `TRIGGER_SECRET_KEY` usa a task; sem conta, fallback `after()` do Next.js.
- **Download** autenticado em `/api/relatorios/[id]/download` (HTML no banco; blob opcional depois).

## Subindo o ambiente (passo a passo)

As chaves em `.env.local` são **placeholders** — o build passa, mas login, banco e geração de IA precisam de contas reais:

1. **Neon** (Postgres): copie a connection string para `DATABASE_URL` em `.env` **e** `.env.local`. Depois:
   ```bash
   npm run db:migrate   # aplica migrations (0001_init + 0002_relatorios)
   npm run db:seed      # tenants "Dra. Mirilaini" e "Milu Seguros" (relatorios ativo)
   ```
2. **Clerk**: Organizations on; webhook; metadata `SUPER_ADMIN` no seu usuário.
3. **Anthropic**: `ANTHROPIC_API_KEY` em `.env.local` (**obrigatória** para gerar relatórios).
4. **Trigger.dev** (opcional): `TRIGGER_SECRET_KEY` + `TRIGGER_PROJECT_REF`; `npx trigger.dev@latest dev`. Sem isso o job roda no processo do Next.
5. **Vercel**: mesmas variáveis; preview por PR com o CI.

```bash
npm run dev        # http://localhost:3000
npm test           # unitários (core + registry + relatorios)
npm run lint
npm run typecheck
npm run build
```

## "Pronto quando" da Fase 1

> Eu crio o tenant "Dra. Mirilaini" pelo admin, ativo um módulo, convido um usuário, ele loga e vê a sidebar só com o que está ativo. Módulo inativo → página "solicitar ativação".

Código pronto; E2E depende de Neon + Clerk reais.

## "Pronto quando" da Fase 2

> A Dra. Mirilaini loga, clica em gerar, espera o job, baixa o HTML/PDF e **entende o que leu**.

Código do fluxo pronto (lista → form → job → preview → download). Validação com a cliente real: preencher números/CSV de um mês fechado com `ANTHROPIC_API_KEY` válida e entregar o HTML (imprimir → PDF no browser se quiser).

## Decisões desta implementação

- **Prisma 7**: generator em `core/db/generated`, adapter `@prisma/adapter-pg`.
- **shadcn/ui adiado** (YAGNI).
- **Relatório = HTML auto-contido** (identidade VETOR embutida); download `.html`; PDF via impressão do browser na v1 (sem puppeteer no monólito).
- **Blob opcional**: sem `BLOB_READ_WRITE_TOKEN` o arquivo vive em `conteudo_html` + rota de download.
- **Trigger opcional**: mesmo worker (`executarGeracaoRelatorio`); enfileiramento Trigger ou `after()`.
- **Módulo `midia`** usa slug de URL `anuncios`.

## O que fica para as próximas fases

- **Fase 3**: Zelo v1 assistido (WhatsApp Cloud API).
- **Fase 4**: site público + cardápio lendo o registry.
- **Fase 5+**: Conteúdo, Monitor de Anúncios (API Meta), PDF nativo / Vercel Blob se a operação pedir.
