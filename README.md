# VETOR — Plataforma

Plataforma multi-tenant da consultoria VETOR. **Fase 0 + Fase 1 implementadas** (esqueleto core). O documento mestre do projeto é o `README-VETOR.md` na pasta pai.

## O que já existe

- **Monólito modular** (Next.js 15 + TS): módulos em `modules/<nome>/`, compartilhado em `core/`, `app/` fino.
- **Proteção de fronteiras**: ESLint (`eslint-plugin-boundaries`) **falha o build** se um módulo importar de outro ou se `core/` importar de `modules/`/`app/`. CI em `.github/workflows/ci.yml` roda lint + typecheck + testes + build em todo push/PR.
- **Banco (Prisma 7 + Postgres)**: 9 tabelas core (`tenants`, `tenant_modules`, `users`, `memberships`, `activity_log`, `events`, `ai_usage`, `dossies`, `agent_runs`), migração em `prisma/migrations/0001_init`, seed com os dois pilotos.
- **Isolamento por tenant (ADR-003)**: `core/db/client.ts` exporta `tenantDb(tenantId)` — extensão do Prisma que injeta `tenant_id` automaticamente em toda query de tabela operacional. Testado em `tests/core/`.
- **Auth (Clerk Organizations)**: middleware protege `(platform)` e `(admin)`; webhook `/api/webhooks/clerk` sincroniza usuários/organizações/memberships; papéis `SUPER_ADMIN | OWNER | MEMBER` em `core/auth/`.
- **Registry de módulos**: `modules/registry.ts` + manifests de `relatorios`, `conteudo`, `midia` (slug `anuncios`) e `zelo` (stubs "em construção"). Sidebar, dashboard e guard se montam sozinhos a partir dele.
- **UI com a identidade do brand book**: tokens em `brand/tokens.css`, fontes autohospedadas (Space Grotesk, Work Sans, JetBrains Mono), design system em `core/ui/` (Logo, Card, Badge, Button, Input, EyebrowLabel, AppShell).
- **Rota genérica** `tools/[slug]/[[...path]]`: guard (registry + `tenant_modules`) + error boundary + página "Solicitar ativação" para módulo inativo.
- **Admin (`/admin`)**: saúde da operação (tenants, módulos, fila de eventos, custo de IA no mês), provisionar empresa, ligar/desligar módulos por tenant.
- **core/ai**: cliente Anthropic único com retry e gravação de tokens/custo (BRL) em `ai_usage` por tenant/módulo.
- **core/events**: bus de eventos entre módulos (publica/consome a tabela `events`).

## Subindo o ambiente (passo a passo)

As chaves em `.env.local` são **placeholders** — o build passa, mas login e banco precisam de contas reais:

1. **Neon** (Postgres): crie o projeto, copie a connection string para `DATABASE_URL` em `.env` **e** `.env.local`. Depois:
   ```bash
   npm run db:migrate   # aplica prisma/migrations no banco
   npm run db:seed      # cria os tenants "Dra. Mirilaini" e "Milu Seguros"
   ```
2. **Clerk**: crie a aplicação, **habilite Organizations**, copie `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` e `CLERK_SECRET_KEY` para `.env.local`.
   - Webhook: endpoint `https://<seu-dominio>/api/webhooks/clerk` (eventos de user, organization e organizationMembership); copie o signing secret para `CLERK_WEBHOOK_SIGNING_SECRET`.
   - Seu usuário: em *Users → seu usuário → Metadata → public*, adicione `{ "role": "SUPER_ADMIN" }` para acessar `/admin`.
   - Vincule os tenants do seed às organizações: crie as orgs pelo `/admin/tenants` (cria no Clerk e no banco de uma vez) **ou** preencha `clerk_org_id` nos tenants existentes.
3. **Anthropic**: `ANTHROPIC_API_KEY` em `.env.local` (só usada a partir da Fase 2).
4. **Vercel**: importe o repo; configure as mesmas variáveis; preview por PR já funciona com o CI.

```bash
npm run dev        # http://localhost:3000
npm test           # unitários (core + registry)
npm run lint       # inclui a regra de fronteiras
npm run typecheck
npm run build
```

## "Pronto quando" da Fase 1 (README mestre)

> Eu crio o tenant "Dra. Mirilaini" pelo admin, ativo um módulo, convido um usuário, ele loga e vê a sidebar só com o que está ativo. Módulo inativo → página "solicitar ativação".

Todo o código desse fluxo está pronto e verificado (build, lint, testes, fronteiras). A validação de ponta a ponta depende só das contas reais (Neon + Clerk) — itens 1 e 2 acima.

## Decisões desta implementação (além do README mestre)

- **Prisma 7**: generator novo (`prisma-client`) com output em `core/db/generated` (assim `core/` não importa de `app/`) e driver adapter `@prisma/adapter-pg` (funciona com Neon e Postgres local).
- **shadcn/ui adiado**: o design system do handoff é completo e custom; shadcn entra quando algum componente dele for necessário (YAGNI).
- **Clerk v7**: `createRouteMatcher` no middleware está deprecado (aviso em dev) — os guards por página/layout (`requireTenantContext`, `requireSuperAdmin`) já são a checagem primária; o middleware é defesa em profundidade.
- **Módulo `midia`** usa slug de URL `anuncios` (língua de dono na interface, nome técnico no código).

## O que fica para as próximas fases

- **Fase 2**: módulo Relatórios de verdade (CSV manual → job → Claude → PDF no blob) — primeiro uso real de `core/ai` e Trigger.dev.
- **Fase 3**: Zelo v1 assistido (WhatsApp Cloud API).
- **Fase 4**: site público + cardápio lendo o registry.
- Trigger.dev: dependência instalada, `trigger/index.ts` é stub — configuração de conta na Fase 2.
